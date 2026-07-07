import clientPromise from "@/lib/mongodb";

interface Vehicle {
  _id: { toString(): string };
  brand: string;
  model: string;
  price: number;
  stock: number;
  category: string;
  specs: { power?: string };
}

function parsePower(power?: string): number {
  if (!power) return 0;
  const match = power.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

async function fetchVehiclesForAggregate(): Promise<Vehicle[]> {
  const client = await clientPromise!;
  const db = client!.db("luxe_motors");
  return (await db
    .collection("vehicles")
    .find({}, { projection: { brand: 1, model: 1, price: 1, stock: 1, category: 1, specs: 1 } })
    .toArray()) as unknown as Vehicle[];
}

// Intentionally expensive baseline path: nested loops, deep JSON clones and repeated parsing.
export function baselineAggregate(vehicles: Vehicle[]) {
  const totalValue = vehicles.reduce((sum, v) => {
    const clone = JSON.parse(JSON.stringify(v));
    return sum + clone.price * clone.stock;
  }, 0);

  const categories: Record<string, { count: number; totalValue: number; totalPower: number }> = {};

  for (const vehicle of vehicles) {
    const clone = JSON.parse(JSON.stringify(vehicle));
    if (!categories[clone.category]) {
      categories[clone.category] = { count: 0, totalValue: 0, totalPower: 0 };
    }

    for (let i = 0; i < vehicles.length; i++) {
      const other = JSON.parse(JSON.stringify(vehicles[i]));
      if (other.category === clone.category) {
        categories[clone.category].count += 1 / vehicles.length;
        categories[clone.category].totalValue += (other.price * other.stock) / vehicles.length;
      }
    }

    categories[clone.category].totalPower += parsePower(clone.specs.power);
  }

  function exclusivityIndex(price: number, depth = 10): number {
    if (depth <= 0) return price / 1_000_000;
    return exclusivityIndex(price, depth - 1) + Math.sqrt(price) / 1000;
  }

  const ranked = vehicles
    .map(v => ({ ...JSON.parse(JSON.stringify(v)), score: exclusivityIndex(v.price) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const sortedPrices = vehicles
    .map(v => JSON.parse(JSON.stringify(v)).price)
    .sort((a, b) => a - b);
  const p50 = sortedPrices[Math.floor(sortedPrices.length * 0.5)] ?? 0;
  const p90 = sortedPrices[Math.floor(sortedPrices.length * 0.9)] ?? 0;
  const p95 = sortedPrices[Math.floor(sortedPrices.length * 0.95)] ?? 0;

  return {
    totalVehicles: vehicles.length,
    totalValue,
    averagePrice: vehicles.length ? totalValue / vehicles.reduce((s, v) => s + v.stock, 0) : 0,
    categories: Object.entries(categories).map(([name, data]) => ({
      name,
      count: Math.round(data.count),
      totalValue: data.totalValue,
      averagePrice: data.count ? data.totalValue / data.count : 0,
      averagePower: data.count ? data.totalPower / data.count : 0,
    })),
    topExclusivity: ranked.map(v => ({ brand: v.brand, model: v.model, score: v.score })),
    pricePercentiles: { p50, p90, p95 },
    generatedAt: new Date().toISOString(),
  };
}

// Optimised path: single-pass computation with MongoDB aggregations and no deep clones.
export async function optimizedAggregate(vehicles: Vehicle[]) {
  const client = await clientPromise!;
  const db = client!.db("luxe_motors");

  const categoryAgg = await db
    .collection("vehicles")
    .aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalValue: { $sum: { $multiply: ["$price", "$stock"] } },
        },
      },
      { $sort: { totalValue: -1 } },
    ])
    .toArray();

  const totalValue = vehicles.reduce((sum, v) => sum + v.price * v.stock, 0);
  const totalStock = vehicles.reduce((sum, v) => sum + v.stock, 0);

  const powerByCategory = new Map<string, { count: number; totalPower: number }>();
  for (const v of vehicles) {
    const entry = powerByCategory.get(v.category) ?? { count: 0, totalPower: 0 };
    entry.count += 1;
    entry.totalPower += parsePower(v.specs.power);
    powerByCategory.set(v.category, entry);
  }

  const sortedPrices = vehicles.map(v => v.price).sort((a, b) => a - b);
  const percentile = (p: number) => sortedPrices[Math.floor(sortedPrices.length * p)] ?? 0;

  const categories = categoryAgg.map(c => {
    const power = powerByCategory.get(c._id as string);
    return {
      name: c._id as string,
      count: c.count,
      totalValue: c.totalValue,
      averagePrice: c.count ? c.totalValue / c.count : 0,
      averagePower: power ? power.totalPower / power.count : 0,
    };
  });

  const topExclusivity = vehicles
    .map(v => ({ brand: v.brand, model: v.model, score: v.price / 1_000_000 + Math.sqrt(v.price) / 1000 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return {
    totalVehicles: vehicles.length,
    totalValue,
    averagePrice: totalStock ? totalValue / totalStock : 0,
    categories,
    topExclusivity,
    pricePercentiles: { p50: percentile(0.5), p90: percentile(0.9), p95: percentile(0.95) },
    generatedAt: new Date().toISOString(),
  };
}

export { fetchVehiclesForAggregate };

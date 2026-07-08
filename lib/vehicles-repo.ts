import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import type { CartItem, CollectionItem, Vehicle } from "@/lib/types";

export type VehicleWithId = Vehicle & { _id: string };

export interface VehicleFilters {
  category?: string;
  search?: string;
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

const SORT_MAP: Record<string, [string, 1 | -1]> = {
  price_asc: ["price", 1],
  price_desc: ["price", -1],
  name_asc: ["brand", 1],
  name_desc: ["brand", -1],
};

export const DEFAULT_PAGE_SIZE = 24;
const MAX_PAGE_SIZE = 48;

export async function queryVehicles(filters: VehicleFilters) {
  const db = await getDb();

  const query: Record<string, unknown> = {};
  if (filters.category && filters.category !== "all") query.category = filters.category;
  if (filters.search) {
    query.$or = [
      { brand: { $regex: filters.search, $options: "i" } },
      { model: { $regex: filters.search, $options: "i" } },
    ];
  }
  if (filters.minPrice != null || filters.maxPrice != null) {
    const priceFilter: Record<string, number> = {};
    if (filters.minPrice != null) priceFilter.$gte = filters.minPrice;
    if (filters.maxPrice != null) priceFilter.$lte = filters.maxPrice;
    query.price = priceFilter;
  }

  const [sortField, sortOrder] = SORT_MAP[filters.sort ?? "price_asc"] ?? SORT_MAP.price_asc;
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, filters.limit ?? DEFAULT_PAGE_SIZE));

  const collection = db.collection("vehicles");
  const [vehicles, total] = await Promise.all([
    collection
      .find(query)
      .sort({ [sortField]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray(),
    collection.countDocuments(query),
  ]);

  return {
    vehicles: vehicles.map(v => ({ ...v, _id: v._id.toString() })) as VehicleWithId[],
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export async function getVehicleById(id: string): Promise<VehicleWithId | null> {
  if (!ObjectId.isValid(id)) return null;
  const db = await getDb();
  const vehicle = await db.collection("vehicles").findOne({ _id: new ObjectId(id) });
  if (!vehicle) return null;
  return { ...vehicle, _id: vehicle._id.toString() } as VehicleWithId;
}

export async function getVehiclesByIds(ids: string[]): Promise<VehicleWithId[]> {
  if (ids.length === 0) return [];
  const db = await getDb();
  const objectIds = ids.map(id => new ObjectId(id));
  const vehicles = await db.collection("vehicles").find({ _id: { $in: objectIds } }).toArray();
  return vehicles.map(v => ({ ...v, _id: v._id.toString() })) as VehicleWithId[];
}

export async function getCartWithVehicles(userId: string) {
  const db = await getDb();
  const cart = await db.collection("carts").findOne({ userId });
  if (!cart || !cart.items?.length) return [];

  const items = cart.items as CartItem[];
  const vehicles = await getVehiclesByIds(items.map(i => i.vehicleId));
  const vehicleMap = Object.fromEntries(vehicles.map(v => [v._id, v]));

  return items.map(item => ({ ...item, vehicle: vehicleMap[item.vehicleId] ?? null }));
}

export async function getCollectionWithVehicles(userId: string) {
  const db = await getDb();
  const userCollection = await db.collection("user_collections").findOne({ userId });
  if (!userCollection || !userCollection.items?.length) return [];

  const items = userCollection.items as CollectionItem[];
  const vehicles = await getVehiclesByIds(items.map(i => i.vehicleId));
  const vehicleMap = Object.fromEntries(vehicles.map(v => [v._id, v]));

  return items.map(item => ({ ...item, vehicle: vehicleMap[item.vehicleId] ?? null }));
}

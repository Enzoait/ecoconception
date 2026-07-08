import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

const VEHICLES = [
  {
    brand: "Bugatti",
    model: "Chiron Super Sport",
    year: 2024,
    price: 3900000,
    category: "Hypercar",
    description:
      "La Bugatti Chiron Super Sport est le summum de l'ingénierie automobile. Avec son moteur W16 quadri-turbocompressé de 1 600 chevaux, elle définit la perfection mécanique et repousse les limites du possible.",
    specs: {
      power: "1 600 ch",
      topSpeed: "440 km/h",
      acceleration: "2.3 s (0-100)",
      engine: "8.0L W16 Quad-Turbo",
      transmission: "DSG 7 vitesses",
      seats: 2,
    },
    images: [
      "https://media.gqmagazine.fr/photos/65bcbf12c4f9f9f89f77dc3f/16:9/w_2560%2Cc_limit/Bugatti-Chiron-Super-Sport-Red-Dragon%2520(1).jpg",
    ],
    stock: 2,
    featured: true,
  },
  {
    brand: "Ferrari",
    model: "SF90 Stradale",
    year: 2024,
    price: 625000,
    category: "Supercar",
    description:
      "La Ferrari SF90 Stradale est la première Ferrari de série hybride plug-in. Combinant un V8 biturbo et trois moteurs électriques, elle développe 1 000 chevaux pour une expérience de conduite transcendante.",
    specs: {
      power: "1 000 ch",
      topSpeed: "340 km/h",
      acceleration: "2.5 s (0-100)",
      engine: "4.0L V8 Biturbo + Hybride",
      transmission: "DCT 8 vitesses",
      seats: 2,
    },
    images: [
      "https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=1200&q=80",
    ],
    stock: 5,
    featured: true,
  },
  {
    brand: "Lamborghini",
    model: "Revuelto",
    year: 2024,
    price: 520000,
    category: "Supercar",
    description:
      "Le Lamborghini Revuelto est le successeur de l'Aventador, mariant un V12 atmosphérique légendaire à trois moteurs électriques pour une puissance combinée de 1 015 chevaux.",
    specs: {
      power: "1 015 ch",
      topSpeed: "350 km/h",
      acceleration: "2.5 s (0-100)",
      engine: "6.5L V12 + Hybride",
      transmission: "DCT 8 vitesses",
      seats: 2,
    },
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/2/21/2023_Lamborghini_Revuelto.jpg",
    ],
    stock: 4,
    featured: true,
  },
  {
    brand: "Porsche",
    model: "911 Turbo S",
    year: 2024,
    price: 245000,
    category: "Sport",
    description:
      "La Porsche 911 Turbo S est la quintessence du sport automobile. Son flat-six biturbo de 3.8L développant 650 chevaux lui permet d'allier performances extrêmes et confort au quotidien.",
    specs: {
      power: "650 ch",
      topSpeed: "330 km/h",
      acceleration: "2.7 s (0-100)",
      engine: "3.8L Flat-6 Biturbo",
      transmission: "PDK 8 vitesses",
      seats: 4,
    },
    images: [
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=80",
    ],
    stock: 8,
    featured: false,
  },
  {
    brand: "Rolls-Royce",
    model: "Spectre",
    year: 2024,
    price: 420000,
    category: "Luxury",
    description:
      "Le Rolls-Royce Spectre est le premier coupé entièrement électrique de la marque. Il incarne l'ultra-luxe silencieux, avec une autonomie de 520 km et le raffinement légendaire de la maison.",
    specs: {
      power: "577 ch",
      topSpeed: "250 km/h",
      acceleration: "4.5 s (0-100)",
      engine: "Électrique (deux moteurs)",
      transmission: "Automatique",
      seats: 4,
    },
    images: [
      "https://images.unsplash.com/photo-1631295868223-63265b40d9e4?w=1200&q=80",
    ],
    stock: 3,
    featured: true,
  },
  {
    brand: "Bentley",
    model: "Continental GT Speed",
    year: 2024,
    price: 315000,
    category: "Grand Tourer",
    description:
      "Le Bentley Continental GT Speed est le grand tourisme ultime. Son W12 biturbo de 6.0L développe 659 chevaux pour des voyages à haute vitesse dans un cocon de luxe absolu.",
    specs: {
      power: "659 ch",
      topSpeed: "335 km/h",
      acceleration: "3.5 s (0-100)",
      engine: "6.0L W12 Biturbo",
      transmission: "DCT 8 vitesses",
      seats: 4,
    },
    images: [
      "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1200&q=80",
    ],
    stock: 6,
    featured: false,
  },
  {
    brand: "McLaren",
    model: "750S Spider",
    year: 2024,
    price: 380000,
    category: "Supercar",
    description:
      "Le McLaren 750S Spider est un chef-d'œuvre d'ingénierie britannique. Son V8 biturbo de 4.0L, son châssis en carbone et son toit rétractable offrent des sensations inégalées à ciel ouvert.",
    specs: {
      power: "750 ch",
      topSpeed: "330 km/h",
      acceleration: "2.8 s (0-100)",
      engine: "4.0L V8 Biturbo",
      transmission: "SSG 7 vitesses",
      seats: 2,
    },
    images: [
      "https://res.cloudinary.com/unix-center/image/upload/dpr_3.0,f_auto,q_auto:best,w_860,h_600,c_fit,g_center,ar_1.33,fl_progressive/w_800,h_600,c_crop,g_center,ar_1.33,fl_progressive/l_power-rent:pzf7cbrjmfyxebjpemcs/dpr_3.0,f_auto,q_auto:good,c_limit,w_60,o_30/fl_layer_apply,g_south_east,x_20,y_14/v1750062974/power-rent/m5ccjxfxidkx2y4eybyt.webp",
    ],
    stock: 3,
    featured: false,
  },
  {
    brand: "Aston Martin",
    model: "DB12",
    year: 2024,
    price: 285000,
    category: "Grand Tourer",
    description:
      "L'Aston Martin DB12 est le super tourer de nouvelle génération. Surnommée la voiture la plus puissante de l'histoire d'Aston Martin, elle associe raffinement britannique et performances redoutables.",
    specs: {
      power: "680 ch",
      topSpeed: "325 km/h",
      acceleration: "3.6 s (0-100)",
      engine: "4.0L V8 Biturbo",
      transmission: "ZF 8 vitesses",
      seats: 4,
    },
    images: [
      "https://cdn.motor1.com/images/mgl/P3Wk0G/s1/aston-martin-db12-configurator.webp",
    ],
    stock: 7,
    featured: false,
  },
  {
    brand: "Maserati",
    model: "MC20 Cielo",
    year: 2024,
    price: 295000,
    category: "Supercar",
    description:
      "Le Maserati MC20 Cielo est le spyder qui transcende la marque au trident. Son moteur Nettuno V6 biturbo à 90° de 3.0L développé par Maserati Motorsport livre 630 chevaux époustouflants.",
    specs: {
      power: "630 ch",
      topSpeed: "325 km/h",
      acceleration: "2.9 s (0-100)",
      engine: "3.0L V6 Nettuno Biturbo",
      transmission: "DCT 8 vitesses",
      seats: 2,
    },
    images: [
      "https://images.caradisiac.com/logos/2/9/4/8/282948/S0-la-maserati-mc20-cielo-est-vraiment-un-animal-etrange-209034.jpg",
    ],
    stock: 5,
    featured: false,
  },
  {
    brand: "Ferrari",
    model: "Purosangue",
    year: 2024,
    price: 390000,
    category: "SUV",
    description:
      "Le Ferrari Purosangue est le premier SUV de Maranello. Propulsé par un V12 atmosphérique de 6.5L développant 725 chevaux, il réinvente le segment en y apportant une âme unique de vrai cheval pur-sang.",
    specs: {
      power: "725 ch",
      topSpeed: "310 km/h",
      acceleration: "3.3 s (0-100)",
      engine: "6.5L V12 Atmosphérique",
      transmission: "DCT 8 vitesses",
      seats: 4,
    },
    images: [
      "https://www.pushstart.it/it/test-drive/ferrari-purosangue/images/ferrari-purosangue-tre-quarti-anteriore-prato-c-p_hu_36931ee0eac2408b.jpg",
    ],
    stock: 4,
    featured: true,
  },
  {
    brand: "Koenigsegg",
    model: "Jesko Absolut",
    year: 2024,
    price: 3000000,
    category: "Hypercar",
    description:
      "Le Koenigsegg Jesko Absolut est la voiture de production la plus rapide jamais construite. Avec 1 600 chevaux et une vitesse maximale calculée à 531 km/h, il représente l'apogée de l'hypercar suédoise.",
    specs: {
      power: "1 600 ch",
      topSpeed: "531 km/h",
      acceleration: "2.5 s (0-100)",
      engine: "5.0L V8 Biturbo Flexfuel",
      transmission: "LST 9 vitesses",
      seats: 2,
    },
    images: [
      "https://octane.rent/wp-content/uploads/2025/09/Koenigsegg_Jesko_1.jpg",
    ],
    stock: 1,
    featured: true,
  },
  {
    brand: "Pagani",
    model: "Huayra Roadster BC",
    year: 2024,
    price: 3500000,
    category: "Hypercar",
    description:
      "La Pagani Huayra Roadster BC est une sculpture mécanique. Construite à la main par des artisans italiens, chaque pièce est une œuvre d'art. Son AMG V12 biturbo de 800 chevaux chante une mélodie incomparable.",
    specs: {
      power: "800 ch",
      topSpeed: "370 km/h",
      acceleration: "2.7 s (0-100)",
      engine: "6.0L AMG V12 Biturbo",
      transmission: "H-Pattern 7 vitesses",
      seats: 2,
    },
    images: [
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=1200&q=80",
    ],
    stock: 1,
    featured: true,
  },
];

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_SEED !== "true") {
    return NextResponse.json({ error: "Route désactivée en production." }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const reset = searchParams.get("reset") === "true";

    const db = await getDb();

    if (reset) {
      await db.collection("vehicles").deleteMany({});
    }

    const existing = await db.collection("vehicles").countDocuments();
    if (existing > 0) {
      return NextResponse.json({ message: "Base de données déjà initialisée.", count: existing });
    }

    const withDates = VEHICLES.map(v => ({ ...v, createdAt: new Date() }));
    const result = await db.collection("vehicles").insertMany(withDates);

    await db.collection("vehicles").createIndex({ brand: 1 });
    await db.collection("vehicles").createIndex({ category: 1 });
    await db.collection("vehicles").createIndex({ price: 1 });
    await db.collection("users").createIndex({ email: 1 }, { unique: true });
    await db.collection("carts").createIndex({ userId: 1 }, { unique: true });
    await db.collection("user_collections").createIndex({ userId: 1 }, { unique: true });

    return NextResponse.json({ success: true, inserted: result.insertedCount });
  } catch (error) {
    console.error("POST /api/seed failed:", error);
    return NextResponse.json({ error: "Erreur lors de l'initialisation." }, { status: 500 });
  }
}

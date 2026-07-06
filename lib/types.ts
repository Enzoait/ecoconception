import { ObjectId } from "mongodb";

export interface User {
  _id?: ObjectId;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

export interface VehicleSpecs {
  power: string;
  topSpeed: string;
  acceleration: string;
  engine: string;
  transmission: string;
  seats: number;
}

export interface Vehicle {
  _id?: ObjectId;
  brand: string;
  model: string;
  year: number;
  price: number;
  category: string;
  description: string;
  specs: VehicleSpecs;
  images: string[];
  stock: number;
  featured: boolean;
  createdAt: Date;
}

export interface CartItem {
  vehicleId: string;
  quantity: number;
}

export interface CartItemPopulated extends CartItem {
  vehicle: Vehicle;
}

export interface Cart {
  _id?: ObjectId;
  userId: string;
  items: CartItem[];
  updatedAt: Date;
}

export interface CollectionItem {
  vehicleId: string;
  quantity: number;
  pricePaid: number;
  purchasedAt: Date;
}

export interface CollectionItemPopulated extends CollectionItem {
  vehicle: Vehicle;
}

export interface UserCollection {
  _id?: ObjectId;
  userId: string;
  items: CollectionItem[];
}

export interface SessionUser {
  sub: string;
  email: string;
  name: string;
}

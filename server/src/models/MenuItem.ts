import { Schema, model, type HydratedDocument } from "mongoose";
import { CATEGORIES, type Category, type MenuItemDTO } from "@shared/api";

export interface MenuItemDoc {
  name: string;
  nameMarathi: string;
  description: string;
  category: Category;
  unitLabel: string; // "per plate", "per kg", "per piece"
  price: number; // paise
  minQuantity: number;
  servesApprox: number; // only used to suggest quantities, never a constraint
  isAvailable: boolean; // Aji's on/off toggle
  stockCount: number | null; // null = unlimited, number = finite batch
  imageUrl: string | null;
  isVeg: boolean;
  tags: string[]; // what "Plan my order" matches against
  isDeleted: boolean; // soft delete — old orders still reference the id
  createdAt: Date;
  updatedAt: Date;
}

const menuItemSchema = new Schema<MenuItemDoc>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    nameMarathi: { type: String, default: "", trim: true, maxlength: 80 },
    description: { type: String, default: "", trim: true, maxlength: 500 },
    category: { type: String, enum: CATEGORIES, required: true },
    unitLabel: { type: String, required: true, trim: true, maxlength: 40 },
    price: { type: Number, required: true, min: 0, validate: Number.isInteger },
    minQuantity: { type: Number, default: 1, min: 1, validate: Number.isInteger },
    servesApprox: { type: Number, default: 1, min: 1, validate: Number.isInteger },
    isAvailable: { type: Boolean, default: true },
    stockCount: {
      type: Number,
      default: null,
      min: 0,
      validate: { validator: (v: number | null) => v === null || Number.isInteger(v), message: "stockCount must be an integer or null" },
    },
    imageUrl: { type: String, default: null },
    isVeg: { type: Boolean, default: true },
    tags: { type: [String], default: [], set: (tags: string[]) => tags.map((t) => t.trim().toLowerCase()).filter(Boolean) },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, collection: "menuItems" },
);

menuItemSchema.index({ category: 1 });

export const MenuItem = model<MenuItemDoc>("MenuItem", menuItemSchema);
export type MenuItemHydrated = HydratedDocument<MenuItemDoc>;

type MenuItemLike = Pick<MenuItemDoc, keyof Omit<MenuItemDoc, "createdAt" | "updatedAt" | "isDeleted">> & {
  _id: { toString(): string };
};

export function toMenuItemDTO(item: MenuItemLike): MenuItemDTO {
  return {
    id: item._id.toString(),
    name: item.name,
    nameMarathi: item.nameMarathi,
    description: item.description,
    category: item.category,
    unitLabel: item.unitLabel,
    price: item.price,
    minQuantity: item.minQuantity,
    servesApprox: item.servesApprox,
    isAvailable: item.isAvailable,
    stockCount: item.stockCount,
    imageUrl: item.imageUrl,
    isVeg: item.isVeg,
    tags: [...item.tags],
  };
}

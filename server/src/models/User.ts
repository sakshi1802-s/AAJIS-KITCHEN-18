import { Schema, Types, model, type HydratedDocument } from "mongoose";
import type { AddressDTO, Role, UserDTO } from "@shared/api";

export interface AddressSub {
  _id: Types.ObjectId;
  label: string;
  line1: string;
  line2: string;
  city: string;
  pincode: string;
  isDefault: boolean;
}

export interface UserDoc {
  googleId: string;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
  addresses: Types.DocumentArray<AddressSub>;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<AddressSub>({
  label: { type: String, required: true, trim: true, maxlength: 30 },
  line1: { type: String, required: true, trim: true, maxlength: 120 },
  line2: { type: String, default: "", trim: true, maxlength: 120 },
  city: { type: String, required: true, trim: true, maxlength: 60 },
  pincode: { type: String, required: true, match: /^\d{6}$/ },
  isDefault: { type: Boolean, default: false },
});

const userSchema = new Schema<UserDoc>(
  {
    googleId: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: null },
    role: { type: String, enum: ["customer", "owner"], default: "customer" },
    addresses: { type: [addressSchema], default: [] },
  },
  { timestamps: true, collection: "users" },
);

export const User = model<UserDoc>("User", userSchema);
export type UserHydrated = HydratedDocument<UserDoc>;

export function toAddressDTO(a: AddressSub): AddressDTO {
  return {
    id: a._id.toString(),
    label: a.label,
    line1: a.line1,
    line2: a.line2,
    city: a.city,
    pincode: a.pincode,
    isDefault: a.isDefault,
  };
}

export function toUserDTO(u: UserHydrated): UserDTO {
  return {
    id: u._id.toString(),
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    addresses: u.addresses.map(toAddressDTO),
  };
}

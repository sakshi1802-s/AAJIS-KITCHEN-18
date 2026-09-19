import { Schema, Types, model, type HydratedDocument } from "mongoose";
import { ORDER_STATUSES, SLOTS, type OrderDTO, type OrderStatus, type Slot } from "@shared/api";

export interface OrderLine {
  menuItemId: Types.ObjectId;
  // Name and price are COPIED at order time and never joined back from the
  // menu: if Aji raises a price in November, an October order must not change.
  nameSnapshot: string;
  quantity: number;
  unitLabel: string;
  priceAtOrder: number; // paise
  // Whether placing this order took units out of a finite stockCount. Cancel
  // and decline restore only what was actually taken, even if Aji has since
  // switched the dish between "unlimited" and a fixed batch.
  stockDecremented: boolean;
}

export interface OrderDoc {
  userId: Types.ObjectId;
  orderNumber: string;
  items: OrderLine[];
  totalAmount: number; // paise
  requestedFor: { date: string; slot: Slot }; // IST "YYYY-MM-DD"
  deliveryAddress: { label: string; line1: string; line2: string; city: string; pincode: string };
  customerPhone: string;
  customerNotes: string;
  status: OrderStatus;
  ownerNote: string | null;
  decidedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const orderLineSchema = new Schema<OrderLine>(
  {
    menuItemId: { type: Schema.Types.ObjectId, ref: "MenuItem", required: true },
    nameSnapshot: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitLabel: { type: String, required: true },
    priceAtOrder: { type: Number, required: true, min: 0 },
    stockDecremented: { type: Boolean, required: true },
  },
  { _id: false },
);

const orderSchema = new Schema<OrderDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    orderNumber: { type: String, required: true, unique: true },
    items: { type: [orderLineSchema], required: true },
    totalAmount: { type: Number, required: true, min: 0 },
    requestedFor: {
      date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
      slot: { type: String, enum: SLOTS, required: true },
    },
    deliveryAddress: {
      label: { type: String, required: true },
      line1: { type: String, required: true },
      line2: { type: String, default: "" },
      city: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    customerPhone: { type: String, required: true },
    customerNotes: { type: String, default: "", maxlength: 500 },
    status: { type: String, enum: ORDER_STATUSES, default: "PLACED" },
    ownerNote: { type: String, default: null },
    decidedAt: { type: Date, default: null },
  },
  { timestamps: true, collection: "orders" },
);

orderSchema.index({ userId: 1, createdAt: -1 }); // "My orders"
orderSchema.index({ createdAt: -1 }); // stats: today / this week
orderSchema.index({ status: 1, "requestedFor.date": 1 }); // Aji's dashboard filters

export const Order = model<OrderDoc>("Order", orderSchema);
export type OrderHydrated = HydratedDocument<OrderDoc>;

type CustomerLike = { _id: Types.ObjectId; name: string; email: string };

export function toOrderDTO(o: OrderHydrated, customer?: CustomerLike): OrderDTO {
  return {
    id: o._id.toString(),
    orderNumber: o.orderNumber,
    items: o.items.map((line) => ({
      menuItemId: line.menuItemId.toString(),
      nameSnapshot: line.nameSnapshot,
      quantity: line.quantity,
      unitLabel: line.unitLabel,
      priceAtOrder: line.priceAtOrder,
    })),
    totalAmount: o.totalAmount,
    requestedFor: { date: o.requestedFor.date, slot: o.requestedFor.slot },
    deliveryAddress: {
      label: o.deliveryAddress.label,
      line1: o.deliveryAddress.line1,
      line2: o.deliveryAddress.line2,
      city: o.deliveryAddress.city,
      pincode: o.deliveryAddress.pincode,
    },
    customerPhone: o.customerPhone,
    customerNotes: o.customerNotes,
    status: o.status,
    ownerNote: o.ownerNote,
    decidedAt: o.decidedAt ? o.decidedAt.toISOString() : null,
    createdAt: o.createdAt.toISOString(),
    ...(customer && {
      customer: { id: customer._id.toString(), name: customer.name, email: customer.email },
    }),
  };
}

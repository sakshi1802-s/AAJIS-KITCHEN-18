import type { RequestHandler } from "express";
import type { OrderDTO, OrdersListResponse } from "@shared/api";
import { valid } from "../middleware/validate";
import { idParams } from "../schemas/common.schema";
import { placeOrderSchema } from "../schemas/order.schema";
import * as orderService from "../services/order.service";

export const placeOrder: RequestHandler = async (req, res) => {
  const body: OrderDTO = await orderService.placeOrder(req.user!.id, valid(req, "body", placeOrderSchema));
  res.status(201).json(body);
};

export const listMyOrders: RequestHandler = async (req, res) => {
  const body: OrdersListResponse = { orders: await orderService.listMyOrders(req.user!.id) };
  res.json(body);
};

export const getOrder: RequestHandler = async (req, res) => {
  const { id } = valid(req, "params", idParams);
  const body: OrderDTO = await orderService.getOrder(id, req.user!);
  res.json(body);
};

export const cancelOrder: RequestHandler = async (req, res) => {
  const { id } = valid(req, "params", idParams);
  const body: OrderDTO = await orderService.cancelOrder(id, req.user!);
  res.json(body);
};

import type { RequestHandler } from "express";
import type { MenuItemDTO, OrderDTO, OrdersListResponse, OwnerStatsDTO } from "@shared/api";
import { valid } from "../middleware/validate";
import { idParams } from "../schemas/common.schema";
import { createMenuItemSchema, updateMenuItemSchema } from "../schemas/menuItem.schema";
import { ownerDecisionSchema, ownerOrdersQuerySchema } from "../schemas/order.schema";
import * as orderService from "../services/order.service";
import * as ownerService from "../services/owner.service";

export const listOrders: RequestHandler = async (req, res) => {
  const body: OrdersListResponse = {
    orders: await ownerService.listOrders(valid(req, "query", ownerOrdersQuerySchema)),
  };
  res.json(body);
};

export const decideOrder: RequestHandler = async (req, res) => {
  const { id } = valid(req, "params", idParams);
  const { decision, reason } = valid(req, "body", ownerDecisionSchema);
  const body: OrderDTO = await orderService.decideOrder(id, decision, req.user!, reason);
  res.json(body);
};

export const getStats: RequestHandler = async (_req, res) => {
  const body: OwnerStatsDTO = await ownerService.getStats();
  res.json(body);
};

export const createMenuItem: RequestHandler = async (req, res) => {
  const body: MenuItemDTO = await ownerService.createMenuItem(valid(req, "body", createMenuItemSchema));
  res.status(201).json(body);
};

export const updateMenuItem: RequestHandler = async (req, res) => {
  const { id } = valid(req, "params", idParams);
  const body: MenuItemDTO = await ownerService.updateMenuItem(id, valid(req, "body", updateMenuItemSchema));
  res.json(body);
};

export const deleteMenuItem: RequestHandler = async (req, res) => {
  const { id } = valid(req, "params", idParams);
  await ownerService.softDeleteMenuItem(id);
  res.status(204).end();
};

import type { RequestHandler } from "express";
import type { MenuItemDTO, MenuListResponse } from "@shared/api";
import { valid } from "../middleware/validate";
import { idParams } from "../schemas/common.schema";
import { menuQuerySchema } from "../schemas/menu.schema";
import * as menuService from "../services/menu.service";

export const listMenu: RequestHandler = async (req, res) => {
  const items = await menuService.listMenu(valid(req, "query", menuQuerySchema));
  const body: MenuListResponse = { items };
  res.json(body);
};

export const getMenuItem: RequestHandler = async (req, res) => {
  const { id } = valid(req, "params", idParams);
  const body: MenuItemDTO = await menuService.getMenuItem(id);
  res.json(body);
};

import type { RequestHandler } from "express";
import type { UserDTO } from "@shared/api";
import { valid } from "../middleware/validate";
import { idParams } from "../schemas/common.schema";
import { addressSchema, updateMeSchema } from "../schemas/user.schema";
import * as userService from "../services/user.service";

export const updateMe: RequestHandler = async (req, res) => {
  const body: UserDTO = await userService.updateMe(req.user!.id, valid(req, "body", updateMeSchema));
  res.json(body);
};

export const addAddress: RequestHandler = async (req, res) => {
  const body: UserDTO = await userService.addAddress(req.user!.id, valid(req, "body", addressSchema));
  res.status(201).json(body);
};

export const removeAddress: RequestHandler = async (req, res) => {
  const { id } = valid(req, "params", idParams);
  const body: UserDTO = await userService.removeAddress(req.user!.id, id);
  res.json(body);
};

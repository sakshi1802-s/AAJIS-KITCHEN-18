import type { UserDTO } from "@shared/api";
import { NotFound } from "../lib/errors";
import { User, toUserDTO, type UserHydrated } from "../models/User";
import type { AddressInputParsed, UpdateMeInput } from "../schemas/user.schema";

async function loadUser(userId: string): Promise<UserHydrated> {
  const user = await User.findById(userId);
  if (!user) throw NotFound("User");
  return user;
}

export async function getMe(userId: string): Promise<UserDTO> {
  return toUserDTO(await loadUser(userId));
}

export async function updateMe(userId: string, input: UpdateMeInput): Promise<UserDTO> {
  const user = await loadUser(userId);
  if (input.name !== undefined) user.name = input.name;
  if (input.phone !== undefined) user.phone = input.phone;
  await user.save();
  return toUserDTO(user);
}

export async function addAddress(userId: string, input: AddressInputParsed): Promise<UserDTO> {
  const user = await loadUser(userId);
  // The first address is always the default; after that, only if asked.
  const isDefault = input.isDefault || user.addresses.length === 0;
  if (isDefault) user.addresses.forEach((a) => (a.isDefault = false));
  user.addresses.push({ ...input, isDefault });
  await user.save();
  return toUserDTO(user);
}

export async function removeAddress(userId: string, addressId: string): Promise<UserDTO> {
  const user = await loadUser(userId);
  const address = user.addresses.id(addressId);
  if (!address) throw NotFound("Address");

  const wasDefault = address.isDefault;
  address.deleteOne();
  // Never leave the customer without a default to pre-select at checkout.
  if (wasDefault && user.addresses.length > 0) user.addresses[0]!.isDefault = true;

  await user.save();
  return toUserDTO(user);
}

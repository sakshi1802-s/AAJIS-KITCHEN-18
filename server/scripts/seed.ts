/**
 * Seeds the menuItems collection from data/menu.seed.json.
 *
 *   npm run seed            upsert every dish by name (safe to re-run)
 *   npm run seed -- --reset delete ALL menu items first, then insert
 *
 * The JSON holds prices in rupees (`priceRupees`) so it's easy to edit;
 * they're converted to paise here, the only unit the database knows.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { CATEGORIES } from "@shared/api";
import { env } from "../src/config/env";
import { connectDB, disconnectDB } from "../src/lib/db";
import { rupeesToPaise } from "../src/lib/money";
import { MenuItem } from "../src/models/MenuItem";

const SeedItem = z.object({
  name: z.string().min(1),
  nameMarathi: z.string(),
  description: z.string(),
  category: z.enum(CATEGORIES),
  unitLabel: z.string().min(1),
  priceRupees: z.number().positive(),
  minQuantity: z.number().int().min(1),
  servesApprox: z.number().int().min(1),
  isVeg: z.boolean(),
  isAvailable: z.boolean().default(true),
  stockCount: z.number().int().min(0).nullable(),
  // A full URL, or a path the client serves (/dishes/<slug>.webp).
  imageUrl: z
    .union([z.url(), z.string().regex(/^\/[\w\-./]+\.(webp|jpg|jpeg|png|avif)$/i)])
    .nullable()
    .default(null),
  tags: z.array(z.string()),
});
const SeedFile = z.object({ items: z.array(SeedItem).min(1) });

async function main() {
  const reset = process.argv.includes("--reset");
  const file = path.resolve(import.meta.dirname, "../data/menu.seed.json");
  const { items } = SeedFile.parse(JSON.parse(await readFile(file, "utf8")));

  const names = new Set<string>();
  for (const item of items) {
    if (names.has(item.name)) throw new Error(`Duplicate dish name in seed: ${item.name}`);
    names.add(item.name);
  }

  await connectDB(env.MONGODB_URI);

  if (reset) {
    const { deletedCount } = await MenuItem.deleteMany({});
    console.log(`Removed ${deletedCount} existing menu items`);
  }

  await MenuItem.bulkWrite(
    items.map(({ priceRupees, ...rest }) => ({
      updateOne: {
        filter: { name: rest.name },
        update: { $set: { ...rest, price: rupeesToPaise(priceRupees), isDeleted: false } },
        upsert: true,
      },
    })),
  );
  await MenuItem.syncIndexes();

  const total = await MenuItem.countDocuments({ isDeleted: false });
  const finite = await MenuItem.countDocuments({ isDeleted: false, stockCount: { $ne: null } });
  console.log(`✔ Seeded ${items.length} dishes — ${total} active in "${MenuItem.collection.collectionName}" (${finite} with finite stock)`);

  await disconnectDB();
}

main().catch(async (err: unknown) => {
  console.error("✖ Seed failed:", err);
  await disconnectDB();
  process.exit(1);
});

/** Dev-only: inspect or tweak one dish, for exercising the 409 path by hand.
 *  npm run dev:poke -- "Besan Ladoo"
 *  npm run dev:poke -- "Besan Ladoo" price 3000
 */
import { env } from "../../src/config/env";
import { connectDB, disconnectDB } from "../../src/lib/db";
import { MenuItem } from "../../src/models/MenuItem";

const [name, field, rawValue] = process.argv.slice(2);

async function main() {
  if (!name) throw new Error('Usage: npm run dev:poke -- "Dish name" [field] [value]');
  await connectDB(env.MONGODB_URI);

  if (field && rawValue !== undefined) {
    const value =
      rawValue === "null" ? null : rawValue === "true" ? true : rawValue === "false" ? false : Number(rawValue);
    await MenuItem.updateOne({ name }, { $set: { [field]: value } });
  }

  const item = await MenuItem.findOne({ name }).lean();
  console.log(
    JSON.stringify({
      name: item?.name,
      price: item?.price,
      stockCount: item?.stockCount,
      isAvailable: item?.isAvailable,
    }),
  );
  await disconnectDB();
}

main().catch(async (err: unknown) => {
  console.error(err);
  await disconnectDB();
  process.exit(1);
});

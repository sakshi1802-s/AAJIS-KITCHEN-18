/**
 * Dev-only helper: creates a throwaway customer and prints a session token so
 * the checkout flow can be exercised in a browser without a Google account.
 * Delete the user afterwards with: npm run dev:session -- --delete
 */
import jwt from "jsonwebtoken";
import { env } from "../../src/config/env";
import { connectDB, disconnectDB } from "../../src/lib/db";
import { Order } from "../../src/models/Order";
import { User } from "../../src/models/User";

const EMAIL = "qa.tester@example.invalid";

async function main() {
  if (env.NODE_ENV === "production") throw new Error("Never run this against production");
  await connectDB(env.MONGODB_URI);

  if (process.argv.includes("--delete")) {
    const user = await User.findOne({ email: EMAIL });
    if (user) {
      const { deletedCount } = await Order.deleteMany({ userId: user._id });
      await user.deleteOne();
      console.log(`Removed the test customer and ${deletedCount} of their orders`);
    } else {
      console.log("No test customer to remove");
    }
    await disconnectDB();
    return;
  }

  const user = await User.findOneAndUpdate(
    { email: EMAIL },
    {
      $set: { googleId: "dev-qa-tester", name: "QA Tester", role: "customer", phone: "9876543210" },
      $setOnInsert: {
        addresses: [
          {
            label: "Home",
            line1: "Flat 3, Shanti Nivas",
            line2: "Off FC Road",
            city: "Pune",
            pincode: "411004",
            isDefault: true,
          },
        ],
      },
    },
    { returnDocument: "after", upsert: true, setDefaultsOnInsert: true },
  );

  console.log("USERID", user.id);
  console.log("TOKEN", jwt.sign({ role: user.role }, env.JWT_SECRET, { subject: user.id, expiresIn: "2h" }));
  await disconnectDB();
}

main().catch(async (err: unknown) => {
  console.error(err);
  await disconnectDB();
  process.exit(1);
});

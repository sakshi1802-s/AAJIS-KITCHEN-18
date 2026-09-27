/**
 * Puts a password on the kitchen account.
 *
 *   npm --prefix server run set-owner-password -- "your password"
 *
 * The owner signs in at /owner-login with an email and a password, full stop.
 * An account first created through Google has no password stored, so this is
 * how one gets set. It only ever touches the address in OWNER_EMAIL.
 *
 * The password is hashed with scrypt before it goes near the database, the
 * same way registration does it. It does appear in your shell history, so
 * clear that if it matters to you.
 */
import { env } from "../src/config/env";
import { connectDB, disconnectDB } from "../src/lib/db";
import { logger } from "../src/lib/logger";
import { hashPassword } from "../src/lib/password";
import { User } from "../src/models/User";

const MIN_LENGTH = 8;

async function main(): Promise<void> {
  const password = process.argv[2];

  if (!password) {
    console.error('Give the password as an argument: npm --prefix server run set-owner-password -- "your password"');
    process.exitCode = 1;
    return;
  }
  if (password.length < MIN_LENGTH) {
    console.error(`Use at least ${MIN_LENGTH} characters.`);
    process.exitCode = 1;
    return;
  }
  if (!env.OWNER_EMAIL) {
    console.error("OWNER_EMAIL is not set in server/.env, so there is no kitchen account to set a password on.");
    process.exitCode = 1;
    return;
  }

  await connectDB(env.MONGODB_URI);

  const email = env.OWNER_EMAIL.toLowerCase();
  const owner = await User.findOne({ email });

  if (!owner) {
    logger.error(`No account for ${email}. Sign in once so the account exists, then run this again.`);
    process.exitCode = 1;
  } else {
    owner.passwordHash = await hashPassword(password);
    await owner.save();
    logger.info(`Password set for ${email}. Sign in at /owner-login with that email and password.`);
  }

  await disconnectDB();
}

main().catch((error: unknown) => {
  logger.error("Could not set the password", error);
  process.exitCode = 1;
});

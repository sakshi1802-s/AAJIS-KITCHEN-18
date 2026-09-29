/**
 * Answers one question: does the webhook reach n8n?
 *
 *   npm --prefix server run check:n8n
 *
 * It posts a sample order to whatever N8N_WEBHOOK_URL points at, with the
 * same secret header the app sends, and says what came back. That is faster
 * than placing a real order every time, and it separates "the app never
 * called n8n" from "n8n never called Twilio".
 *
 * The sample is typed as `OrderNotification`, so it cannot drift from what
 * the app actually sends: change that shape and this stops compiling.
 */
import { env } from "../../src/config/env";
import type { OrderNotification } from "../../src/services/notify";

const SAMPLE: OrderNotification = {
  orderNumber: "AK-TEST-0001",
  status: "ACCEPTED",
  customerName: "Test Customer",
  customerPhone: "9876543210",
  items: [
    { name: "Bombil Thali", quantity: 2, unitPrice: 32000, lineTotal: 64000 },
    { name: "Fried Prawns", quantity: 1, unitPrice: 30000, lineTotal: 30000 },
  ],
  total: 94000,
  requestedFor: { date: new Date().toISOString().slice(0, 10), slot: "evening" },
  deliveryAddress: {
    label: "Home",
    line1: "Flat 3, Shanti Nivas",
    line2: "Off FC Road",
    city: "Pune",
    pincode: "411004",
  },
  ownerNote: null,
};

function explain(status: number): string {
  if (status === 401 || status === 403) {
    return "n8n rejected the secret. The Header Auth credential on the webhook node must be\n" +
      "named x-webhook-secret and hold the same value as N8N_SECRET in server/.env.";
  }
  if (status === 404) {
    return "n8n has no webhook listening there. Activate the workflow, and use the node's\n" +
      "Production URL — the Test URL only fires while the editor is open.";
  }
  return "n8n answered, but not with a success. Open its Executions tab for the detail.";
}

async function main(): Promise<void> {
  if (!env.N8N_WEBHOOK_URL) {
    console.error("N8N_WEBHOOK_URL is empty, so the app is not calling n8n at all.");
    console.error("Put it in server/.env and restart the server — env is read once, at boot.");
    process.exitCode = 1;
    return;
  }

  console.log(`Posting a sample order to ${env.N8N_WEBHOOK_URL}`);
  console.log(`Secret header: ${env.N8N_SECRET ? `${env.N8N_SECRET.length} characters` : "EMPTY"}`);

  const started = Date.now();
  const response = await fetch(env.N8N_WEBHOOK_URL, {
    method: "POST",
    headers: { "content-type": "application/json", "x-webhook-secret": env.N8N_SECRET },
    body: JSON.stringify(SAMPLE),
    signal: AbortSignal.timeout(10_000),
  });

  const body = await response.text().catch(() => "");
  console.log(`\n${response.status} ${response.statusText} in ${Date.now() - started}ms`);
  if (body) console.log(body.slice(0, 400));

  if (response.ok) {
    console.log("\nn8n took it. If no WhatsApp arrived, the rest is Twilio's end:");
    console.log("check the workflow's Executions tab for the Twilio node's error.");
  } else {
    console.error(`\n${explain(response.status)}`);
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  console.error("Could not reach n8n at all:");
  console.error(error instanceof Error ? error.message : error);
  console.error("\nIs n8n running? It should answer at http://localhost:5678.");
  console.error("The site is unaffected either way — the app never waits on this webhook.");
  process.exitCode = 1;
});

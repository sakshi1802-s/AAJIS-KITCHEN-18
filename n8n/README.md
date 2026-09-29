# WhatsApp notifications via n8n

The app already calls a webhook every time an order changes status. This folder
holds the workflow that turns that call into a WhatsApp message.

**Nothing here is load-bearing.** With `N8N_WEBHOOK_URL` unset, the server's
`notifyOrderStatus()` returns immediately and the whole project runs, demos and
deploys without n8n existing. The notification is never awaited on the request
path either, so a slow or broken webhook can't hold up an order.

## What the server sends

`POST <your webhook URL>` with header `x-webhook-secret: <N8N_SECRET>`:

```json
{
  "orderNumber": "AK-260921-F2DC",
  "status": "ACCEPTED",
  "customerName": "Asha Kore",
  "customerPhone": "9876543210",
  "items": [
    { "name": "Bombil Thali", "quantity": 2, "unitPrice": 32000, "lineTotal": 64000 }
  ],
  "total": 78000,
  "requestedFor": { "date": "2026-09-22", "slot": "evening" },
  "deliveryAddress": {
    "label": "Home",
    "line1": "Flat 3, Shanti Nivas",
    "line2": "Off FC Road",
    "city": "Pune",
    "pincode": "411004"
  },
  "ownerNote": null
}
```

Every price is in **paise** — the workflow divides by 100 for the bill it
writes. `status` is `ACCEPTED`, `DECLINED` or `CANCELLED`, and `items` is what
the customer actually ordered, snapshotted at order time, so the invoice can
never drift from the price they were charged.

## The shape of it

```
Order status webhook  →  Read the order  →  Confirmed or declined?
                                                   ├─ confirmed → Confirmation message ─┐
                                                   └─ declined  → Declined message ─────┴→ Send on WhatsApp
```

`Read the order` flattens the body once — phone, order number, the bill, the
total, the day and slot — so the two message nodes stay readable. Anything
that is neither ACCEPTED nor DECLINED (a customer's own cancellation) stops
at the switch and sends nothing.

## What you configure by hand

Nothing secret is in this file. Four things to set in n8n after importing:

1. **Header Auth credential** on `Order status webhook`. Name `x-webhook-secret`,
   value the same string as `N8N_SECRET` in `server/.env`.
2. **Twilio credential** on `Send on WhatsApp`: your Account SID and Auth
   Token, entered in n8n. They never come near this repo.
3. **The sender.** `from` is the sandbox number `whatsapp:+14155238886`. If
   your sandbox shows a different one, change it in that node.
4. **`server/.env`**:
   ```
   N8N_WEBHOOK_URL=http://localhost:5678/webhook/aji-order-status
   N8N_SECRET=<the same secret as step 1>
   ```
   Restart the server after editing it; it reads `.env` once at boot.

Copy the **Production URL** from the webhook node, not the Test URL — the
test one only fires while you are watching the editor. Activate the workflow.

Before any of that works, join the sandbox from the phone you are testing
with: WhatsApp `join <your-code>` to the sandbox number. Every recipient has
to, which is why a sandbox is fine for a demo and not for real customers.

## What the customer gets

Confirmed:

```
🧾 *AAJI'S KITCHEN*
Order #AK-260928-F2DC

Bombil Thali × 2 — ₹640
Fried Prawns × 1 — ₹300
------------------------------
*Total: ₹940*

📅 2026-09-30
🕐 evening

Your order has been confirmed ❤️
Pay Aaji directly on delivery.
```

Declined carries Aaji's reason, the same bill, and says nothing has been
charged.

## Why this is deferred, honestly

n8n is the easy half — webhook in, format, send out. WhatsApp is where the
friction lives:

- **Business-initiated messages need pre-approved templates.** "Your order is
  confirmed" is business-initiated, so free text isn't allowed, and Meta
  reviews each template and rejects them over wording.
- **The 24-hour window.** Free-form replies are only allowed within 24 hours of
  the *customer* messaging *you*. Outside it, templates only.
- **Onboarding.** A Meta Business account, business verification, and a phone
  number **not already registered on WhatsApp**.

So: n8n works fine for a demo, and it is not a production notification system
for real customers without going through Meta's verification path. The in-app
status chips do the job on their own, which is why the seam exists and the
integration is optional.

**Timebox it to two days.** If messages aren't sending by then, ship without it.

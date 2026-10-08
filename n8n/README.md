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

## Setting it up

1. **Run n8n.** Copy `package.json` into a folder whose path contains **no apostrophe** — `C:\Users\<you>\aji-kitchen-n8n`
   works — then run `npm install` there once, and `npm start` to launch it.

   Two things make that instruction look stranger than it is:

   - The version is pinned on purpose. `npx n8n` re-resolves to whatever is
     newest on every run, and an unasked-for upgrade rewrites the instance
     encryption keys. After that, n8n cannot read its own stored credentials
     and every message stops — with only a `DEK ... is in an unrecognized
     format` line in the log to explain why.
   - n8n cannot run from a path containing an apostrophe. It builds a
     `require('<absolute path>')` string and `eval`s it, so a folder named
     `Aaji's Kitchen` closes the quote early and node throws
     `SyntaxError: missing ) after argument list` before the server starts.

   A local instance is fine for a demo but is not reachable from a server
   deployed on Render; use n8n Cloud for that.
2. **Import** `order-status-whatsapp.json` (Workflows → Import from file).
3. **Add the shared secret.** Open the Webhook node → Authentication → Header
   Auth → create a credential with name `x-webhook-secret` and the same value
   you put in the server's `N8N_SECRET`.
4. **Add the Twilio credential.** Open "Send on WhatsApp" → Credential for
   Twilio API → add your Account SID and Auth Token. Both live in the
   credential and nowhere else, so neither reaches this repo.
5. **Set the sender.** In the same node, `from` is the WhatsApp sandbox
   number. The message body is built by the two Set nodes before it, so the
   text is ours — not one of Twilio's fixed templates.
6. **Join the sandbox** from every phone that should receive a message:
   WhatsApp `join <your-code>` to the sandbox number. This is not optional —
   it is what opens the 24-hour window a plain message needs. It is also why
   a sandbox is fine for a demo and not for real customers.
7. **Point the server at it.** In `server/.env`:
   ```
   N8N_WEBHOOK_URL=https://<your-n8n>/webhook/aji-order-status
   N8N_SECRET=<the same secret>
   ```
   Restart the server, then accept or decline an order.

## Why it calls Twilio over HTTP instead of using the Twilio node

n8n's Twilio node can send a message body and little else. Keeping the last
step as an **HTTP Request** to `Messages.json` means any Twilio parameter is
one field away — `ContentSid` for an approved template, media, status
callbacks — without swapping the node out again. It authenticates with
`predefinedCredentialType: twilioApi`, so n8n injects the same Twilio
credential and the Auth Token never appears in this file.

## Why a plain Body, and not a template

WhatsApp only allows arbitrary text inside a **24-hour session window**,
opened when the customer messages you. Outside that window every message must
be an approved **template**, whose wording is fixed — you can only fill its
blanks.

Sending through a Twilio **trial phone number** always counts as outside the
window. That is why a `Body` there is refused with *"trial accounts have
limited parameter access"*, and why pointing at Twilio's stock template
delivered *"Reminder: Appt Tue Oct 29, 3:00 PM"* rather than an invoice — that
template is an appointment reminder, so even filled in correctly it could
never have said what we wanted.

The **sandbox** sender is different. Sending `join <code>` to it opens the
window, and inside it a plain `Body` arrives exactly as written.

**Going live later:** a paid WhatsApp sender still needs a template for the
first message of a conversation. Build one in Twilio's Content Template
Builder with the invoice wording, get it approved, then add `ContentSid` and
`ContentVariables` back to the "Send on WhatsApp" node. Nothing else changes.

## What the customer gets

Confirmed:

```
🧾 *AAJI'S KITCHEN*
Order #AK-260929-F2DC

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

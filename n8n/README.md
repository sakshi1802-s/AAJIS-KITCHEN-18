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
  "total": 78000,
  "requestedFor": { "date": "2026-09-22", "slot": "evening" },
  "ownerNote": null
}
```

`total` is in **paise** — the workflow divides by 100 for the message.
`status` is `ACCEPTED`, `DECLINED` or `CANCELLED`.

## Setting it up

1. **Run n8n.** Either `npx n8n` locally (fine for a demo, but a local
   instance is not reachable from a server deployed on Render) or n8n Cloud.
2. **Import** `order-status-whatsapp.json` (Workflows → Import from file).
3. **Add the shared secret.** Open the Webhook node → Authentication → Header
   Auth → create a credential with name `x-webhook-secret` and the same value
   you put in the server's `N8N_SECRET`.
4. **Add Twilio credentials.** Open the Twilio node and add your Account SID
   and Auth Token. For the sandbox, set "From" to `whatsapp:+14155238886`.
5. **Join the Twilio sandbox** from the phone you'll test with: send the join
   code Twilio shows you to that number. Every recipient has to do this, which
   is exactly why the sandbox is fine for a demo and not for real customers.
6. **Point the server at it.** In `server/.env`:
   ```
   N8N_WEBHOOK_URL=https://<your-n8n>/webhook/aji-order-status
   N8N_SECRET=<the same secret>
   ```
   Restart the server and accept an order.

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

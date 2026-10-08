# Aaji's Kitchen

My grandmother, Aaji, runs a home catering service in Mumbai. She takes every order over phone calls and WhatsApp and writes them in a notebook, quoting prices from memory. Orders got booked twice and dishes sold out after she had already promised them.

Aaji's Kitchen is the full stack web platform I built for that business. A customer browses the menu, builds a cart and places an order. Aaji accepts or declines it from her own dashboard, and the customer gets a WhatsApp confirmation. She makes one decision per order, nothing more.

## Tech stack

**Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui, TanStack Query

**Backend:** Node.js, Express 5, TypeScript, MongoDB, Mongoose, Zod, JWT

**Integrations:** Google Gemini, Twilio WhatsApp, n8n, Cloudinary, Google OAuth

## Architecture

<img width="435" height="282" alt="aajis kitchen drawing" src="https://github.com/user-attachments/assets/d31e2467-e0f3-4f8a-b103-e9ee41a3e3c4" />


## Demo



https://github.com/user-attachments/assets/57f4b9af-6c2f-498d-bf55-c5efa48beb38



## WhatsApp confirmation

<img width="391" height="253" alt="twilio trial" src="https://github.com/user-attachments/assets/5a6a6562-6ef4-4fd6-b028-aef9037777a2" />


> I'm on Twilio's free template, which is why the confirmation looks like this and can arrive slightly delayed. On a paid plan the same message can be formatted as a proper invoice.

## Key features

- Customer storefront and owner dashboard as two separate experiences in one app
- Google sign in or email and password, session kept in a secure cookie
- Stock that can't be oversold when two people order the last portion at once
- Prices saved with the order, so a later price change never rewrites an old bill
- AI planner that fills a cart from one sentence, limited to dishes Aaji actually cooks
- Automatic WhatsApp confirmation the moment Aaji decides
- A menu you turn like a book, with her own food photos and Marathi dish names

## Challenges

**Keeping the two sides independent but in sync.** The storefront and Aaji's dashboard are two different apps sharing one backend. They had to stay fully separate, while an order placed on one side shows up on the other straight away. I also had to stay signed in as Aaji in one window and a customer in another to test it, without one login replacing the other. Getting the sessions and role checks right was the hardest part.

**Getting WhatsApp working.** n8n took a while to set up and connect to the backend. A properly formatted confirmation also needs a paid Twilio template, so I'm on the free one. The message is plainer than I'd like but it arrives reliably, and switching later is just a settings change.

**Stopping the AI making things up.** The planner used to suggest dishes Aaji doesn't cook and prices it invented. Now the model picks from a fixed list of real dishes and the server works out the total.

## Future scope

- Deploy it and hand it to Aaji so she can run real orders through it
- Online payments, so customers can pay at the time of ordering

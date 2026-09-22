# Dish photos

One file per dish, named after the slug used in `server/data/menu.seed.json`
(`imageUrl: "/dishes/<slug>.webp"`). They were cut out of the labelled collage
by `server/scripts/dev/cropCollage.py`.

**To replace one with a better photo:** save it here under the same name, at
roughly 4:3 and about 640x480. Nothing in the code needs to change — the menu
already points at the path.

**To add a photo for a dish that hasn't got one** (paratha, chivda, varan
bhaat, vangyachi bhaji, puri bhaji thali, kombdi vade): save it here, then set
that dish's `imageUrl` in the seed file and re-run `npm --prefix server run seed`.
Until then those cards draw a warm plate with the dish's Marathi name on it.

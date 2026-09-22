"""Slice the dish collage into one photo per dish.

    python server/scripts/dev/cropCollage.py <collage.webp> client/public/dishes

The collage is a 1536x1024 grid of labelled tiles. Its row rules are detectable
but the column rules are not (the photos bleed into them), so the boxes below
are hand-measured from the image and each output was checked by eye.

Every box is the FOOD area only — the caption strip under each tile is left
out. Crops are centre-cropped to 4:3 to match the cards, then saved as WebP.

Replacing any of these later is just a matter of dropping a better file in with
the same name; nothing in the code refers to this script.
"""

import sys
from pathlib import Path

from PIL import Image

OUT_W, OUT_H = 640, 480

# slug: (left, top, right, bottom) in the 1536x1024 collage
TILES: dict[str, tuple[int, int, int, int]] = {
    # 1. Typical Marathi snacks — row 1
    "sabudana-vada": (10, 40, 176, 232),
    "vada-pav": (182, 40, 344, 232),
    "kothimbir-vadi": (352, 40, 494, 232),
    "alu-vadi": (500, 40, 632, 232),
    "batata-bhaji": (638, 40, 764, 232),
    "kanda-pohe": (770, 40, 903, 232),
    "upma": (909, 40, 1043, 232),
    # 1. Typical Marathi snacks — row 2
    "medu-vada": (10, 272, 176, 432),
    "idli-sambar": (182, 272, 348, 432),
    "onion-bhaji": (354, 272, 520, 432),
    "ukadiche-modak": (526, 272, 697, 432),
    "aamras": (703, 272, 876, 432),
    "sheera": (882, 272, 1043, 432),
    # 2. Diwali faral — row 1
    "chakli": (1060, 78, 1222, 232),
    "shankarpali": (1228, 78, 1376, 232),
    "karanji": (1382, 78, 1526, 232),
    # 2. Diwali faral — row 2
    "shev": (1060, 272, 1184, 440),
    "matthri": (1190, 272, 1299, 440),
    "anarse": (1305, 272, 1413, 440),
    "besan-ladoo": (1419, 272, 1526, 440),
    # 3. Veg thalis
    "puran-poli-thali": (10, 528, 338, 744),
    "veg-thali": (344, 528, 674, 744),
    # 4. Non-veg thalis
    "bombil-thali": (692, 528, 973, 744),
    "surmai-thali": (979, 528, 1253, 744),
    "prawns-thali": (1259, 528, 1526, 744),
    # 5. Seafood starters
    "fried-prawns": (10, 814, 158, 986),
    "bombil-fry": (164, 814, 318, 986),
    "surmai-fry": (324, 814, 476, 986),
    # 6. Street food
    "misal-pav": (492, 814, 716, 986),
    "pav-bhaji": (722, 814, 944, 986),
    # 7. More popular items
    "sabudana-khichdi": (958, 814, 1093, 986),
    "kanda-bhaji": (1099, 814, 1240, 986),
    "thalipeeth": (1246, 814, 1388, 986),
    "solkadhi": (1394, 814, 1526, 986),
}


def centre_crop_to_ratio(img: Image.Image, ratio: float) -> Image.Image:
    """Trim the long side so the photo matches the card's aspect ratio."""
    w, h = img.size
    if w / h > ratio:
        new_w = int(h * ratio)
        left = (w - new_w) // 2
        return img.crop((left, 0, left + new_w, h))
    new_h = int(w / ratio)
    top = (h - new_h) // 2
    return img.crop((0, top, w, top + new_h))


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit(__doc__)

    source, out_dir = Path(sys.argv[1]), Path(sys.argv[2])
    out_dir.mkdir(parents=True, exist_ok=True)
    collage = Image.open(source).convert("RGB")

    for slug, box in TILES.items():
        tile = centre_crop_to_ratio(collage.crop(box), OUT_W / OUT_H)
        tile = tile.resize((OUT_W, OUT_H), Image.LANCZOS)
        tile.save(out_dir / f"{slug}.webp", "WEBP", quality=82, method=6)

    print(f"wrote {len(TILES)} dish photos to {out_dir}")


if __name__ == "__main__":
    main()

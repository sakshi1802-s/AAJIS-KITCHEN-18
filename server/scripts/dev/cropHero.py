"""Close-ups from the hero photograph for the About Aji frame.

    python server/scripts/dev/cropHero.py <hero.webp> client/public/aji

The collage tiles are only ~170px wide, so blowing them up for a large frame
looks soft. The hero photo is 1536x1024, so these crops are near native
resolution and stay sharp.
"""

import sys
from pathlib import Path

from PIL import Image, ImageEnhance

# slug: (left, top, right, bottom) in the 1536x1024 hero photo
CROPS = {
    "thali-lower": (40, 395, 735, 916),
    "thali-raised": (800, 95, 1520, 635),
    "carrying": (330, 60, 1180, 700),
}


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit(__doc__)
    source, out_dir = Path(sys.argv[1]), Path(sys.argv[2])
    out_dir.mkdir(parents=True, exist_ok=True)
    hero = Image.open(source).convert("RGB")

    for slug, box in CROPS.items():
        crop = hero.crop(box)
        # A touch of contrast — the original is deliberately dim and dark.
        crop = ImageEnhance.Contrast(crop).enhance(1.05)
        crop.save(out_dir / f"{slug}.webp", "WEBP", quality=92, method=6)
        print(f"{slug}: {crop.size[0]}x{crop.size[1]}")


if __name__ == "__main__":
    main()

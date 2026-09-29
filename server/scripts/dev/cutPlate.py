"""Cuts the top plate out of a photo of a stack of plates.

The plate is an ellipse (a round plate seen at a slight angle), so the mask
is one too. Its edge is drawn at 4x and shrunk back down, which antialiases
it — a hard 1-bit mask leaves a jagged rim that reads as a cut-out sticker.

    python server/scripts/dev/cutPlate.py <source> <out.png> cx cy a b [darken]

`darken` is an optional brightness multiplier: 0.8 takes it down a fifth.
"""

import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

# The edge is drawn at this multiple, then averaged down.
SUPERSAMPLE = 4


def main() -> None:
    source, out = Path(sys.argv[1]), Path(sys.argv[2])
    cx, cy, a, b = (float(v) for v in sys.argv[3:7])
    darken = float(sys.argv[7]) if len(sys.argv) > 7 else 1.0

    image = Image.open(source).convert("RGBA")

    if darken != 1.0:
        # Brightness only, so the metal keeps its colour rather than going grey.
        rgb = ImageEnhance.Brightness(image.convert("RGB")).enhance(darken)
        image = Image.merge("RGBA", (*rgb.split(), image.split()[3]))

    big = (image.width * SUPERSAMPLE, image.height * SUPERSAMPLE)
    mask = Image.new("L", big, 0)
    ImageDraw.Draw(mask).ellipse(
        [
            (cx - a) * SUPERSAMPLE,
            (cy - b) * SUPERSAMPLE,
            (cx + a) * SUPERSAMPLE,
            (cy + b) * SUPERSAMPLE,
        ],
        fill=255,
    )
    mask = mask.resize(image.size, Image.LANCZOS)
    # A touch of blur so the rim doesn't carry a hard line of background.
    mask = mask.filter(ImageFilter.GaussianBlur(0.6))

    image.putalpha(mask)

    # Trim to what is actually left.
    box = image.split()[3].getbbox()
    if box:
        image = image.crop(box)

    out.parent.mkdir(parents=True, exist_ok=True)
    image.save(out)
    print(f"{out} {image.size}")


if __name__ == "__main__":
    main()

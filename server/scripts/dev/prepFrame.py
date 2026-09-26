"""Pulls the hand-drawn border out of a scan onto transparency.

The source is dark red linework on near-white paper, so a pixel's alpha is
just how far it is from white: the ink stays, the paper disappears, and the
anti-aliased edges keep their partial alpha instead of turning into a halo.

    python server/scripts/dev/prepFrame.py <source.png> <out.png>
"""

import sys
from pathlib import Path

from PIL import Image

# Below this, a pixel is paper and goes fully transparent; above the second,
# it is solid ink. Between them alpha ramps, which keeps the edges smooth.
PAPER = 26
INK = 150


def main() -> None:
    source = Path(sys.argv[1])
    out = Path(sys.argv[2])

    image = Image.open(source).convert("RGBA")
    pixels = image.load()
    width, height = image.size

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            # Distance from white, on the channel that moved the most.
            ink = 255 - min(r, g, b)
            if ink <= PAPER:
                alpha = 0
            elif ink >= INK:
                alpha = 255
            else:
                alpha = round((ink - PAPER) / (INK - PAPER) * 255)
            # Keep the ink's own colour; a transparent pixel's rgb is unused.
            pixels[x, y] = (r, g, b, min(alpha, a))

    out.parent.mkdir(parents=True, exist_ok=True)
    image.save(out)
    print(f"{out} {image.size}")


if __name__ == "__main__":
    main()

"""Make a seamless parchment tile (and the Ganpati motif) from the reference.

    python server/scripts/dev/prepParchment.py <17.png> client/public/textures

The reference is only 358px square and has a motif and beads in it, so
stretching it across a section would both blur and repeat the motif. Instead we
take a clean patch of paper and mirror it into a tile whose edges match, which
repeats invisibly at any size, and keep the motif separately as an ornament.
"""

import sys
from pathlib import Path

from PIL import Image, ImageOps

# A clean patch of paper: below the motif, left of the beads.
PAPER = (45, 185, 245, 330)
MOTIF = (92, 42, 170, 118)


def seamless_tile(patch: Image.Image) -> Image.Image:
    """Mirror the patch into a 2x2 block so opposite edges always match."""
    w, h = patch.size
    tile = Image.new("RGB", (w * 2, h * 2))
    tile.paste(patch, (0, 0))
    tile.paste(ImageOps.mirror(patch), (w, 0))
    tile.paste(ImageOps.flip(patch), (0, h))
    tile.paste(ImageOps.flip(ImageOps.mirror(patch)), (w, h))
    return tile


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit(__doc__)
    source, out_dir = Path(sys.argv[1]), Path(sys.argv[2])
    out_dir.mkdir(parents=True, exist_ok=True)
    img = Image.open(source).convert("RGB")

    tile = seamless_tile(img.crop(PAPER))
    tile.save(out_dir / "parchment-tile.png", "PNG")
    print(f"parchment tile: {tile.size[0]}x{tile.size[1]}")

    motif = img.crop(MOTIF)
    motif.save(out_dir / "ganpati-motif.png", "PNG")
    print(f"motif: {motif.size[0]}x{motif.size[1]}")


if __name__ == "__main__":
    main()

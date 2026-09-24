"""Turn the two ornament screenshots into usable transparent PNGs.

    python server/scripts/dev/prepOrnaments.py <10.png> <12.png> client/public/textures

Both arrive as artwork on a solid white page (with app chrome around it), so:
  - crop to the artwork,
  - flood-fill the white *background* to transparent from the outside, and for
    the round frame also from the centre, which leaves the ring itself —
    including its white lace — intact.
"""

import sys
from collections import deque
from pathlib import Path

from PIL import Image


def flood_clear(img: Image.Image, seeds, tolerance: int = 18) -> None:
    """Make the connected near-white region under each seed transparent."""
    px = img.load()
    w, h = img.size
    seen = set()
    queue = deque()

    for seed in seeds:
        if 0 <= seed[0] < w and 0 <= seed[1] < h:
            queue.append(seed)

    def near_white(p):
        return p[3] > 0 and p[0] > 255 - tolerance and p[1] > 255 - tolerance and p[2] > 255 - tolerance

    while queue:
        x, y = queue.popleft()
        if (x, y) in seen or not (0 <= x < w and 0 <= y < h):
            continue
        seen.add((x, y))
        if not near_white(px[x, y]):
            continue
        px[x, y] = (255, 255, 255, 0)
        queue.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))


def content_box(img: Image.Image, keep=lambda p: p[3] > 8):
    px = img.load()
    w, h = img.size
    xs, ys = [], []
    for y in range(h):
        for x in range(w):
            if keep(px[x, y]):
                xs.append(x)
                ys.append(y)
    return (min(xs), min(ys), max(xs) + 1, max(ys) + 1)


def prep_round_frame(source: Path, out: Path) -> None:
    img = Image.open(source).convert("RGBA")
    w, h = img.size
    # Yellow artwork only — drop the page and the app chrome around it.
    px = img.load()
    xs, ys = [], []
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a > 0 and r > 200 and g > 140 and b < 150 and r - b > 60:
                xs.append(x)
                ys.append(y)
    pad = 6
    img = img.crop((max(0, min(xs) - pad), max(0, min(ys) - pad), min(w, max(xs) + pad), min(h, max(ys) + pad)))

    w, h = img.size
    flood_clear(img, [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)])
    flood_clear(img, [(w // 2, h // 2)])

    # The source was a screenshot, so app chrome (grey buttons) can overlap the
    # artwork. Keep only the yellow and its white lace.
    px = img.load()
    for y in range(img.size[1]):
        for x in range(img.size[0]):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            is_yellow = r > 190 and g > 130 and r - b > 45
            is_lace = r > 225 and g > 225 and b > 200
            if not (is_yellow or is_lace):
                px[x, y] = (255, 255, 255, 0)

    img.save(out, "PNG")
    print(f"round frame: {img.size[0]}x{img.size[1]} -> {out}")


def prep_strip(source: Path, out: Path) -> None:
    img = Image.open(source).convert("RGBA")
    w, h = img.size
    flood_clear(img, [(0, y) for y in range(0, h, 4)] + [(w - 1, y) for y in range(0, h, 4)])
    flood_clear(img, [(x, 0) for x in range(0, w, 4)] + [(x, h - 1) for x in range(0, w, 4)])
    img = img.crop(content_box(img))
    img.save(out, "PNG")
    print(f"strip: {img.size[0]}x{img.size[1]} -> {out}")


def main() -> None:
    if len(sys.argv) != 4:
        raise SystemExit(__doc__)
    round_src, strip_src, out_dir = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
    out_dir.mkdir(parents=True, exist_ok=True)
    prep_round_frame(round_src, out_dir / "round-frame.png")
    prep_strip(strip_src, out_dir / "ornament-strip.png")


if __name__ == "__main__":
    main()

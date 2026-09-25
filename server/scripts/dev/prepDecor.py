"""Prepare the decorative pieces and Aaji's portrait.

    python server/scripts/dev/prepDecor.py <corner.png> <portrait.jpg> <circle.png> client/public

  - corner ornament: white background flood-filled away, cropped to the art
  - circle frame:    same, and trimmed square so it lines up with a round photo
  - portrait:        cropped to a square around her face, for the round frame
  - favicon:         the logo, masked to a circle so it isn't a square tile
"""

import sys
from collections import deque
from pathlib import Path

from PIL import Image, ImageDraw


def flood_clear(img: Image.Image, seeds, tolerance: int = 26) -> None:
    px = img.load()
    w, h = img.size
    seen: set[tuple[int, int]] = set()
    queue = deque(s for s in seeds if 0 <= s[0] < w and 0 <= s[1] < h)

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


def content_box(img: Image.Image):
    px = img.load()
    w, h = img.size
    xs, ys = [], []
    for y in range(h):
        for x in range(w):
            if px[x, y][3] > 10:
                xs.append(x)
                ys.append(y)
    return (min(xs), min(ys), max(xs) + 1, max(ys) + 1)


def edge_seeds(img: Image.Image):
    w, h = img.size
    return (
        [(x, 0) for x in range(0, w, 3)]
        + [(x, h - 1) for x in range(0, w, 3)]
        + [(0, y) for y in range(0, h, 3)]
        + [(w - 1, y) for y in range(0, h, 3)]
    )


def transparent_art(source: Path, out: Path, square: bool = False, ring: bool = False) -> None:
    img = Image.open(source).convert("RGBA")
    flood_clear(img, edge_seeds(img))
    if ring:
        # A closed ring keeps its own middle: clear that separately, or the
        # frame arrives as a white disc.
        w, h = img.size
        flood_clear(img, [(w // 2, h // 2)])

    # These came from screenshots, so drop the grey app chrome while keeping
    # the cream beads (bright) and the tan swirls (saturated).
    px = img.load()
    for y in range(img.size[1]):
        for x in range(img.size[0]):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            grey = max(r, g, b) - min(r, g, b) < 26
            if grey and max(r, g, b) < 205:
                px[x, y] = (255, 255, 255, 0)

    img = img.crop(content_box(img))

    if square:
        # A round frame has to sit on a square canvas or it will look squashed
        # over a circular photo.
        side = max(img.size)
        canvas = Image.new("RGBA", (side, side), (255, 255, 255, 0))
        canvas.paste(img, ((side - img.size[0]) // 2, (side - img.size[1]) // 2), img)
        img = canvas

    img.save(out, "PNG")
    print(f"{out.name}: {img.size[0]}x{img.size[1]}")


def square_portrait(source: Path, out: Path) -> None:
    img = Image.open(source).convert("RGB")
    w, h = img.size
    # Her face sits in the upper third. Start a little below the top edge so
    # the screenshot chrome in the corner of the original is left out.
    side = min(w, int(h * 0.56))
    left = (w - side) // 2
    top = int(h * 0.07)
    img.crop((left, top, left + side, top + side)).resize((800, 800), Image.LANCZOS).save(
        out, "WEBP", quality=92, method=6
    )
    print(f"{out.name}: 800x800")


def circular_icons(logo: Path, out_dir: Path) -> None:
    img = Image.open(logo).convert("RGBA")
    side = min(img.size)
    img = img.crop(((img.size[0] - side) // 2, (img.size[1] - side) // 2, (img.size[0] + side) // 2, (img.size[1] + side) // 2))
    mask = Image.new("L", (side, side), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, side - 1, side - 1), fill=255)
    img.putalpha(mask)
    for size in (32, 180, 512):
        img.resize((size, size), Image.LANCZOS).save(out_dir / f"icon-{size}.png", "PNG")
    img.resize((512, 512), Image.LANCZOS).save(out_dir / "aji-logo.webp", "WEBP", quality=92, method=6)
    print("circular icons written")


def main() -> None:
    if len(sys.argv) != 5:
        raise SystemExit(__doc__)
    corner, portrait, circle, public = (Path(p) for p in sys.argv[1:5])
    (public / "textures").mkdir(parents=True, exist_ok=True)
    (public / "aji").mkdir(parents=True, exist_ok=True)

    transparent_art(corner, public / "textures" / "corner-ornament.png")
    transparent_art(circle, public / "textures" / "circle-frame.png", square=True, ring=True)
    square_portrait(portrait, public / "aji" / "aaji.webp")
    circular_icons(public / "logo" / "aji-logo.webp", public / "logo")


if __name__ == "__main__":
    main()

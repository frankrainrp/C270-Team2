"""
Extract JPEG from SVG wrapper, key out white background, trim margins,
save as transparent PNG. One-shot tool for new butler pose assets.

Matches the [027] PNG-trim workflow used on standing/serving/pointout.
"""
import base64
import io
import os
import re
import sys
from PIL import Image

# (source svg name, output png name)
MAPPING = [
    ("thinking.svg", "butler-thinking.png"),
    ("thinking_hard.svg", "butler-thinking-hard.png"),
    ("thinking_rare.svg", "butler-rare-thinking.png"),
    ("I_got_it.svg", "butler-idea.png"),
]

SRC_DIR = os.path.join(os.path.dirname(__file__), "..", "Doc", "bulter")
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "my-app", "apps", "web", "public", "assets")

# White-keying threshold. JPEG anti-aliasing makes pure white pixels rare;
# 240 catches off-white margins while preserving character lights.
WHITE_THRESHOLD = 240


def extract_jpeg(svg_path: str) -> bytes:
    with open(svg_path, "r", encoding="utf-8") as f:
        s = f.read()
    m = re.search(r'xlink:href="data:image/jpeg;base64,([^"]+)"', s)
    if not m:
        raise RuntimeError(f"no embedded JPEG in {svg_path}")
    return base64.b64decode(m.group(1))


def key_white_and_trim(img: Image.Image) -> Image.Image:
    """RGB → RGBA, make near-white transparent, crop to bbox."""
    img = img.convert("RGBA")
    px = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b, _ = px[x, y]
            if r >= WHITE_THRESHOLD and g >= WHITE_THRESHOLD and b >= WHITE_THRESHOLD:
                px[x, y] = (255, 255, 255, 0)
    bbox = img.getbbox()
    if bbox is None:
        raise RuntimeError("entire image is transparent after keying")
    return img.crop(bbox)


def main() -> int:
    os.makedirs(OUT_DIR, exist_ok=True)
    print(f"src: {os.path.abspath(SRC_DIR)}")
    print(f"out: {os.path.abspath(OUT_DIR)}\n")
    print(f"{'name':<28} {'orig':<14} {'trimmed':<14} {'size'}")
    print("-" * 72)
    for src, dst in MAPPING:
        src_path = os.path.join(SRC_DIR, src)
        out_path = os.path.join(OUT_DIR, dst)
        if not os.path.exists(src_path):
            print(f"!! missing: {src_path}")
            continue
        jpeg_bytes = extract_jpeg(src_path)
        with Image.open(io.BytesIO(jpeg_bytes)) as img:
            orig_size = img.size
            trimmed = key_white_and_trim(img)
        trimmed.save(out_path, "PNG", optimize=True)
        fsize_kb = os.path.getsize(out_path) / 1024
        print(f"{dst:<28} {orig_size[0]}x{orig_size[1]:<10} {trimmed.size[0]}x{trimmed.size[1]:<10} {fsize_kb:.1f}KB")
    print("\nDone. Update POSES table in ButlerCharacter.tsx with the trimmed dimensions.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

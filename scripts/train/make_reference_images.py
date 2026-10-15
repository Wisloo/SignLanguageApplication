"""Build per-letter reference images for a language from an image dataset.

Reference images are the "copy me" pictures shown on the learn and practice
pages. This script picks one clean, representative frame per letter from a
folder-per-class dataset and writes it into ``public/signs/<lang>/<letter>.png``.

Selection is deliberately simple and dependency-light (Pillow only): from an
evenly-spaced sample per class, it keeps the frame with the largest file size,
which tends to be the sharpest, least-blurred capture. The FSL dataset
(``japorton/fsl-dataset``, CC0) already crops the hand, so no re-cropping is done.

Usage::

    python scripts/train/make_reference_images.py \
        --dataset data/fsl/Collated \
        --out public/signs/fsl
"""

from __future__ import annotations

import argparse
import re
from pathlib import Path

from PIL import Image

LETTER_PATTERN = re.compile(r"^[A-Z]$")
IMAGE_SUFFIXES = {".jpg", ".jpeg", ".png"}
DEFAULT_LETTERS = [chr(code) for code in range(ord("A"), ord("Z") + 1)]


def pick_representative(folder: Path, sample: int) -> Path | None:
    images = sorted(
        p for p in folder.iterdir() if p.suffix.lower() in IMAGE_SUFFIXES
    )
    if not images:
        return None
    stride = max(1, len(images) // sample)
    spaced = images[::stride]
    return max(spaced, key=lambda path: path.stat().st_size)


def write_reference(source: Path, destination: Path, size: int) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as image:
        rgb = image.convert("RGB")
        rgb.thumbnail((size, size), Image.LANCZOS)
        rgb.save(destination, format="PNG", optimize=True)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dataset", required=True, type=Path)
    parser.add_argument("--out", required=True, type=Path)
    parser.add_argument(
        "--size",
        type=int,
        default=480,
        help="Longest edge of the saved image in pixels.",
    )
    parser.add_argument(
        "--sample",
        type=int,
        default=40,
        help="How many evenly-spaced frames per class to compare.",
    )
    parser.add_argument("--letters", nargs="+", default=DEFAULT_LETTERS)
    args = parser.parse_args()

    written: list[str] = []
    missing: list[str] = []
    for letter in args.letters:
        folder = args.dataset / letter
        if not folder.is_dir():
            missing.append(letter)
            continue
        source = pick_representative(folder, args.sample)
        if source is None:
            missing.append(letter)
            continue
        destination = args.out / f"{letter.lower()}.png"
        write_reference(source, destination, args.size)
        written.append(f"{letter} <- {source.name}")

    print(f"Wrote {len(written)} reference images to {args.out}")
    for line in written:
        print(f"  {line}")
    if missing:
        print(f"Missing folders/images for: {', '.join(missing)}")


if __name__ == "__main__":
    main()

"""Clean an image dataset and emit a grouping manifest for the training run.

First stage of the offline pipeline. It does three things the raw datasets need
before landmark extraction:

1. **Integrity** - drops files Pillow cannot open.
2. **Exact-duplicate removal** - keeps the first image of each identical
   difference-hash, dropping byte-for-byte visual clones.
3. **Group assignment** - the datasets were recorded as continuous video, so
   neighbouring frames are near-identical. Left alone, a random train/val split
   would leak near-duplicates across the boundary and inflate validation
   accuracy. We walk each class in filename order and place runs of similar
   frames into bounded groups (``<label>#<n>``). The training script splits by
   group, so whole near-duplicate runs stay on one side.

Output is a JSON manifest consumed by ``extract_landmarks.py`` via ``--manifest``.

Usage::

    python scripts/train/clean_images.py \
        --dataset data/asl_alphabet_train/asl_alphabet_train \
        --out data/asl_manifest.json
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
from PIL import Image, UnidentifiedImageError

IMAGE_SUFFIXES = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}

# Folders that are not single letters (negatives / control classes).
NON_LETTER_FOLDERS = {"nothing", "space", "del", "delete", "none"}


def dhash(path: Path, hash_size: int) -> np.ndarray:
    """Difference hash: horizontal gradient sign per pixel, row-major."""
    with Image.open(path) as image:
        grey = image.convert("L").resize((hash_size + 1, hash_size), Image.LANCZOS)
    pixels = np.asarray(grey, dtype=np.int16)
    return (pixels[:, 1:] > pixels[:, :-1]).reshape(-1)


def hamming(a: np.ndarray, b: np.ndarray) -> int:
    return int(np.count_nonzero(a != b))


def discover_classes(dataset: Path) -> list[str]:
    names = []
    for entry in sorted(dataset.iterdir()):
        if not entry.is_dir() or entry.name.lower() in NON_LETTER_FOLDERS:
            continue
        names.append(entry.name)
    return names


def clean_class(
    class_dir: Path,
    label: str,
    hash_size: int,
    max_hamming: int,
    max_group: int,
) -> tuple[list[dict], int, int]:
    records: list[dict] = []
    corrupt = 0
    duplicates = 0
    seen_hashes: dict[bytes, str] = {}

    group_index = -1
    group_size = 0
    previous_hash: np.ndarray | None = None

    images = sorted(
        p for p in class_dir.iterdir() if p.suffix.lower() in IMAGE_SUFFIXES
    )

    for image_path in images:
        try:
            digest = dhash(image_path, hash_size)
        except (UnidentifiedImageError, OSError):
            corrupt += 1
            continue

        key = digest.tobytes()
        if key in seen_hashes:
            duplicates += 1
            continue
        seen_hashes[key] = image_path.name

        starts_new_group = previous_hash is None or group_size >= max_group
        if not starts_new_group:
            starts_new_group = hamming(digest, previous_hash) > max_hamming

        if starts_new_group:
            group_index += 1
            group_size = 0

        records.append(
            {
                "path": str(image_path.relative_to(class_dir.parent)),
                "label": label,
                "group": f"{label}#{group_index}",
            }
        )
        group_size += 1
        previous_hash = digest

    return records, corrupt, duplicates


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dataset", required=True, type=Path)
    parser.add_argument("--out", required=True, type=Path)
    parser.add_argument("--hash-size", type=int, default=8)
    parser.add_argument(
        "--max-hamming",
        type=int,
        default=6,
        help="Difference-hash distance at which two frames are 'near-duplicate'.",
    )
    parser.add_argument(
        "--max-group",
        type=int,
        default=32,
        help="Cap group size so a whole recording does not collapse into one group.",
    )
    args = parser.parse_args()

    classes = discover_classes(args.dataset)
    if not classes:
        raise SystemExit(f"No class folders found under {args.dataset}")

    all_records: list[dict] = []
    total_corrupt = 0
    total_duplicates = 0

    for label in classes:
        records, corrupt, duplicates = clean_class(
            args.dataset / label,
            label,
            args.hash_size,
            args.max_hamming,
            args.max_group,
        )
        group_count = len({record["group"] for record in records})
        print(
            f"  {label}: {len(records)} kept, {duplicates} dupes, "
            f"{corrupt} corrupt, {group_count} groups"
        )
        all_records.extend(records)
        total_corrupt += corrupt
        total_duplicates += duplicates

    manifest = {
        "dataset": str(args.dataset),
        "hash_size": args.hash_size,
        "max_hamming": args.max_hamming,
        "max_group": args.max_group,
        "classes": classes,
        "records": all_records,
    }

    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(manifest), encoding="utf-8")

    print(
        f"\n{len(all_records)} images across {len(classes)} classes "
        f"({total_duplicates} duplicates, {total_corrupt} corrupt dropped)."
    )
    print(f"Manifest written to {args.out}")


if __name__ == "__main__":
    main()

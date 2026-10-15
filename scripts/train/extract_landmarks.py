"""Extract hand landmarks from a folder-per-class image dataset.

Second stage of the offline pipeline that produces the on-device fingerspelling
model. It reads the cleaning manifest from ``clean_images.py`` (recommended),
runs MediaPipe's HandLandmarker over every image, keeps only frames with a
confident, plausibly-sized hand, and writes a compressed ``.npz`` of normalised
landmark vectors, labels and group ids.

The normalisation here MUST match ``src/lib/vision/normalize.ts`` exactly.

Expected datasets:
  * ASL: Kaggle ``grassknoted/asl-alphabet`` (folders ``A``..``Z`` + controls).
  * FSL: Kaggle ``japorton/fsl-dataset`` (folders ``A``..``Z``).

Letters ``J`` and ``Z`` are skipped (motion signs handled by ``motion.ts``).
The ``none`` (not-a-letter) class is optional and comes from ``--negatives``;
use hand-present non-letter gestures (ASL ``space``/``del``) - the ASL
``nothing`` folder has no hand and is dropped by the hand filter, so it is
useless here.

Usage::

    python scripts/train/extract_landmarks.py \
        --dataset data/asl_alphabet_train/asl_alphabet_train \
        --manifest data/asl_manifest.json \
        --out data/asl_landmarks.npz
"""

from __future__ import annotations

import argparse
import json
import math
import re
import urllib.request
from pathlib import Path

import numpy as np

_MODEL_URL = (
    "https://storage.googleapis.com/mediapipe-models/hand_landmarker/"
    "hand_landmarker/float16/1/hand_landmarker.task"
)

SKIP_LABELS = {"J", "Z"}
NON_LETTER_FOLDERS = {"nothing", "space", "del", "delete", "none"}
LETTER_PATTERN = re.compile(r"^[A-Z]$")
IMAGE_SUFFIXES = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
NEGATIVE_LABEL = "none"


def normalize(landmarks) -> list[float]:
    """Wrist-origin, palm-scaled 63-dim vector. Mirror of normalizeLandmarks()."""
    wrist = landmarks[0]
    reference = landmarks[9]
    scale = max(math.hypot(reference.x - wrist.x, reference.y - wrist.y), 1e-6)

    vector: list[float] = []
    for point in landmarks:
        vector.extend(
            [
                (point.x - wrist.x) / scale,
                (point.y - wrist.y) / scale,
                (point.z - wrist.z) / scale,
            ]
        )
    return vector


def palm_size(landmarks) -> float:
    wrist = landmarks[0]
    reference = landmarks[9]
    return math.hypot(reference.x - wrist.x, reference.y - wrist.y)


def ensure_model(path: Path) -> Path:
    if not path.exists():
        path.parent.mkdir(parents=True, exist_ok=True)
        print(f"Downloading hand landmarker to {path} ...")
        urllib.request.urlretrieve(_MODEL_URL, path)
    return path


def build_landmarker(model_path: Path):
    from mediapipe.tasks import python as mp_python
    from mediapipe.tasks.python import vision

    options = vision.HandLandmarkerOptions(
        base_options=mp_python.BaseOptions(model_asset_path=str(model_path)),
        running_mode=vision.RunningMode.IMAGE,
        num_hands=1,
        min_hand_detection_confidence=0.5,
        min_hand_presence_confidence=0.5,
    )
    return vision.HandLandmarker.create_from_options(options)


def discover_letter_classes(dataset: Path) -> list[str]:
    classes = []
    for entry in sorted(dataset.iterdir()):
        if not entry.is_dir():
            continue
        name = entry.name
        if LETTER_PATTERN.match(name) and name not in SKIP_LABELS:
            classes.append(name)
    return classes


def iter_images(folder: Path) -> list[Path]:
    return sorted(
        p for p in folder.rglob("*") if p.suffix.lower() in IMAGE_SUFFIXES
    )


def load_manifest(manifest_path: Path, dataset: Path) -> dict[str, tuple[str, str]]:
    """Map absolute image path -> (label, group)."""
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    mapping: dict[str, tuple[str, str]] = {}
    for record in manifest["records"]:
        absolute = (dataset / record["path"]).resolve()
        mapping[str(absolute)] = (record["label"], record["group"])
    return mapping


def collect_jobs(
    dataset: Path,
    manifest_path: Path | None,
    negatives: list[Path] | None,
) -> list[tuple[Path, str, str]]:
    jobs: list[tuple[Path, str, str]] = []

    if manifest_path is not None:
        for absolute, (label, group) in load_manifest(manifest_path, dataset).items():
            if label in SKIP_LABELS:
                continue
            jobs.append((Path(absolute), label, group))
    else:
        for label in discover_letter_classes(dataset):
            images = iter_images(dataset / label)
            for index, image_path in enumerate(images):
                jobs.append((image_path, label, f"{label}#{index // 16}"))

    for neg_index, negatives_dir in enumerate(negatives or []):
        for index, image_path in enumerate(iter_images(negatives_dir)):
            group = f"{NEGATIVE_LABEL}#{neg_index}#{index // 16}"
            jobs.append((image_path, NEGATIVE_LABEL, group))

    return jobs


def subsample(
    jobs: list[tuple[Path, str, str]], max_per_class: int
) -> list[tuple[Path, str, str]]:
    """Cap each label to evenly-spaced samples so a video's start is not over-used."""
    if max_per_class <= 0:
        return jobs
    by_label: dict[str, list[tuple[Path, str, str]]] = {}
    for job in jobs:
        by_label.setdefault(job[1], []).append(job)
    picked: list[tuple[Path, str, str]] = []
    for items in by_label.values():
        if len(items) <= max_per_class:
            picked.extend(items)
        else:
            step = len(items) / max_per_class
            picked.extend(items[int(index * step)] for index in range(max_per_class))
    return picked


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dataset", required=True, type=Path)
    parser.add_argument("--out", required=True, type=Path)
    parser.add_argument("--manifest", type=Path, default=None)
    parser.add_argument(
        "--negatives",
        type=Path,
        nargs="+",
        default=None,
        help="Folder(s) of hand-present non-letter images for the 'none' class.",
    )
    parser.add_argument(
        "--model",
        type=Path,
        default=Path("scripts/train/hand_landmarker.task"),
    )
    parser.add_argument(
        "--min-confidence",
        type=float,
        default=0.6,
        help="Minimum handedness/detection score to keep a frame.",
    )
    parser.add_argument(
        "--min-palm",
        type=float,
        default=0.05,
        help="Minimum wrist->middle-MCP distance (normalised) to keep a frame.",
    )
    parser.add_argument(
        "--max-per-class",
        type=int,
        default=0,
        help="Cap kept images per class (0 = use all).",
    )
    args = parser.parse_args()

    import mediapipe as mp

    jobs = collect_jobs(args.dataset, args.manifest, args.negatives)
    jobs = subsample(jobs, args.max_per_class)
    if not jobs:
        raise SystemExit("No images to process.")

    model_path = ensure_model(args.model)

    features: list[list[float]] = []
    targets: list[int] = []
    groups: list[str] = []
    paths: list[str] = []
    label_index: dict[str, int] = {}
    skipped_no_hand = 0
    skipped_low_confidence = 0
    skipped_small = 0

    with build_landmarker(model_path) as landmarker:
        for image_path, label, group in jobs:
            try:
                mp_image = mp.Image.create_from_file(str(image_path))
            except (RuntimeError, OSError):
                skipped_no_hand += 1
                continue

            result = landmarker.detect(mp_image)
            if not result.hand_landmarks:
                skipped_no_hand += 1
                continue

            confidence = 0.0
            if result.handedness and result.handedness[0]:
                confidence = float(result.handedness[0][0].score)
            if confidence < args.min_confidence:
                skipped_low_confidence += 1
                continue

            hand = result.hand_landmarks[0]
            if palm_size(hand) < args.min_palm:
                skipped_small += 1
                continue

            if label not in label_index:
                label_index[label] = len(label_index)
            features.append(normalize(hand))
            targets.append(label_index[label])
            groups.append(group)
            paths.append(str(image_path))

    if not features:
        raise SystemExit("No usable hands found. Check the dataset and thresholds.")

    labels = [name for name, _ in sorted(label_index.items(), key=lambda kv: kv[1])]
    unique_groups = {name: i for i, name in enumerate(dict.fromkeys(groups))}

    X = np.asarray(features, dtype=np.float32)
    y = np.asarray(targets, dtype=np.int64)
    group_ids = np.asarray([unique_groups[g] for g in groups], dtype=np.int64)

    args.out.parent.mkdir(parents=True, exist_ok=True)
    np.savez_compressed(
        args.out,
        X=X,
        y=y,
        groups=group_ids,
        labels=np.asarray(labels),
        paths=np.asarray(paths),
    )

    print(f"\nKept {X.shape[0]} samples ({X.shape[1]} features) across {len(labels)} classes.")
    print(f"  classes: {', '.join(labels)}")
    print(
        "  dropped: "
        f"{skipped_no_hand} no-hand, "
        f"{skipped_low_confidence} low-confidence, "
        f"{skipped_small} too-small"
    )
    print(f"Saved to {args.out}")


if __name__ == "__main__":
    main()

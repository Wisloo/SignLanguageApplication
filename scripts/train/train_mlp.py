"""Train the on-device fingerspelling MLP and export it as JSON weights.

Final stage of the offline pipeline. Consumes the ``.npz`` from
``extract_landmarks.py``, trains a small multi-layer perceptron, reports a
per-class confusion matrix, flags suspected mislabels, and writes the weights in
the JSON shape the browser runtime (``src/lib/vision/letter-model.ts``) expects.

Key choices:
  * **Grouped split** - validation is split by near-duplicate group (from
    ``clean_images.py``), so no near-identical frame leaks across the boundary.
  * **Mirror augmentation on train only** - left/right hand robustness without
    contaminating validation.
  * **Class weights** - balances the ``none`` class and any underfilled letters.

The exported model is dependency-free at inference time: ``letter-model.ts``
runs the forward pass in plain TypeScript, so the app ships no ML runtime.

Usage::

    python scripts/train/train_mlp.py \
        --npz data/asl_landmarks.npz --lang asl
    python scripts/train/train_mlp.py \
        --npz data/fsl_landmarks.npz --lang fsl

Requires PyTorch (CPU is plenty for a model this small).
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
import torch
from torch import nn

# Keep in lockstep with src/lib/vision/normalize.ts.
NORMALIZATION_ID = "wrist-origin-palm-scale-v1"
DEFAULT_THRESHOLD = 0.7


def mirror(features: np.ndarray) -> np.ndarray:
    """Flip the x axis of every landmark (left/right hand augmentation)."""
    flipped = features.copy()
    flipped[:, 0::3] *= -1.0
    return flipped


def grouped_split(
    y: np.ndarray, groups: np.ndarray, val_fraction: float, seed: int
) -> tuple[np.ndarray, np.ndarray]:
    """Split by group id so near-duplicate frames never span train/val."""
    rng = np.random.default_rng(seed)
    train_idx: list[int] = []
    val_idx: list[int] = []
    for label in np.unique(y):
        label_indices = np.where(y == label)[0]
        label_groups = np.unique(groups[label_indices])
        rng.shuffle(label_groups)
        cut = max(1, int(len(label_groups) * val_fraction))
        val_groups = set(label_groups[:cut].tolist())
        for index in label_indices:
            (val_idx if int(groups[index]) in val_groups else train_idx).append(int(index))
    return np.asarray(train_idx), np.asarray(val_idx)


def build_model(
    input_dim: int, hidden: list[int], classes: int, dropout: float
) -> nn.Module:
    layers: list[nn.Module] = []
    prev = input_dim
    for size in hidden:
        layers += [nn.Linear(prev, size), nn.ReLU(), nn.Dropout(dropout)]
        prev = size
    layers.append(nn.Linear(prev, classes))
    return nn.Sequential(*layers)


def confusion(targets: np.ndarray, preds: np.ndarray, classes: int) -> np.ndarray:
    matrix = np.zeros((classes, classes), dtype=np.int64)
    for target, pred in zip(targets, preds):
        matrix[target, pred] += 1
    return matrix


def print_report(matrix: np.ndarray, labels: list[str]) -> None:
    print("\nPer-class recall:")
    for i, name in enumerate(labels):
        total = matrix[i].sum()
        recall = matrix[i, i] / total if total else 0.0
        print(f"  {name}: {recall * 100:5.1f}% ({matrix[i, i]}/{total})")

    worst = sorted(
        range(len(labels)),
        key=lambda i: (matrix[i, i] / matrix[i].sum()) if matrix[i].sum() else 0.0,
    )[:5]
    print("\nMost confused classes (look here when tuning):")
    for i in worst:
        row = matrix[i]
        confused_with = int(np.argmax(np.where(np.arange(len(row)) == i, -1, row)))
        print(f"  {labels[i]} -> {labels[confused_with]}")


def flag_outliers(
    model: nn.Module,
    X: np.ndarray,
    y: np.ndarray,
    paths: np.ndarray | None,
    labels: list[str],
    confidence: float,
    limit: int,
) -> None:
    """List confidently-wrong predictions; these are likely mislabelled images."""
    model.eval()
    with torch.no_grad():
        probs = torch.softmax(model(torch.from_numpy(X)), dim=1).numpy()
    predicted = probs.argmax(axis=1)
    best = probs.max(axis=1)

    suspects = np.where((predicted != y) & (best >= confidence))[0]
    print(
        f"\nSuspected mislabels: {len(suspects)} frames predicted as another "
        f"letter with >= {confidence:.0%} confidence."
    )
    if len(suspects) == 0:
        return
    for index in suspects[:limit]:
        location = paths[index] if paths is not None else f"sample {index}"
        print(
            f"  {labels[y[index]]} labelled but predicted {labels[predicted[index]]} "
            f"({best[index]:.0%}) - {location}"
        )
    if len(suspects) > limit:
        print(f"  ... and {len(suspects) - limit} more.")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--npz", required=True, type=Path)
    parser.add_argument(
        "--lang",
        default="asl",
        help="Language code, used for the default output path (asl/fsl).",
    )
    parser.add_argument("--out", type=Path, default=None)
    parser.add_argument("--hidden", type=int, nargs="+", default=[128, 128])
    parser.add_argument("--epochs", type=int, default=60)
    parser.add_argument("--batch-size", type=int, default=128)
    parser.add_argument("--lr", type=float, default=1e-3)
    parser.add_argument("--dropout", type=float, default=0.3)
    parser.add_argument("--val-fraction", type=float, default=0.15)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument(
        "--no-mirror",
        action="store_true",
        help="Disable left/right hand mirror augmentation.",
    )
    parser.add_argument(
        "--class-weight",
        action="store_true",
        help="Weight the loss by inverse class frequency.",
    )
    parser.add_argument("--outlier-confidence", type=float, default=0.8)
    parser.add_argument("--outlier-limit", type=int, default=20)
    args = parser.parse_args()

    out_path = args.out or Path(f"public/models/letters-{args.lang}.json")

    torch.manual_seed(args.seed)

    data = np.load(args.npz, allow_pickle=True)
    X = data["X"].astype(np.float32)
    y = data["y"].astype(np.int64)
    labels = [str(name) for name in data["labels"]]
    groups = (
        data["groups"].astype(np.int64)
        if "groups" in data
        else np.arange(len(y), dtype=np.int64)
    )
    paths = data["paths"] if "paths" in data else None
    classes = len(labels)

    train_idx, val_idx = grouped_split(y, groups, args.val_fraction, args.seed)

    x_train = torch.from_numpy(X[train_idx])
    y_train = torch.from_numpy(y[train_idx])
    x_val = torch.from_numpy(X[val_idx])
    y_val = torch.from_numpy(y[val_idx])

    if not args.no_mirror:
        x_train = torch.cat([x_train, torch.from_numpy(mirror(X[train_idx]))], dim=0)
        y_train = torch.cat([y_train, y_train], dim=0)

    model = build_model(X.shape[1], args.hidden, classes, args.dropout)
    optimizer = torch.optim.Adam(model.parameters(), lr=args.lr)

    weight = None
    if args.class_weight:
        counts = np.bincount(y[train_idx], minlength=classes).astype(np.float64)
        counts[counts == 0] = 1.0
        weight = torch.tensor((counts.sum() / (classes * counts)), dtype=torch.float32)
    criterion = nn.CrossEntropyLoss(weight=weight)

    best_accuracy = 0.0
    best_state = model.state_dict()
    for epoch in range(args.epochs):
        model.train()
        permutation = torch.randperm(x_train.shape[0])
        for start in range(0, len(permutation), args.batch_size):
            batch = permutation[start : start + args.batch_size]
            optimizer.zero_grad()
            loss = criterion(model(x_train[batch]), y_train[batch])
            loss.backward()
            optimizer.step()

        model.eval()
        with torch.no_grad():
            preds = model(x_val).argmax(dim=1)
            accuracy = (preds == y_val).float().mean().item()
        if accuracy > best_accuracy:
            best_accuracy = accuracy
            best_state = {k: v.clone() for k, v in model.state_dict().items()}
        if (epoch + 1) % 10 == 0 or epoch == args.epochs - 1:
            print(f"epoch {epoch + 1:3d}  val accuracy {accuracy * 100:5.1f}%")

    model.load_state_dict(best_state)
    model.eval()
    with torch.no_grad():
        val_preds = model(x_val).argmax(dim=1).numpy()
    print(f"\nBest validation accuracy: {best_accuracy * 100:.1f}%")
    print_report(confusion(y_val.numpy(), val_preds, classes), labels)
    flag_outliers(
        model,
        X[train_idx],
        y[train_idx],
        paths[train_idx] if paths is not None else None,
        labels,
        args.outlier_confidence,
        args.outlier_limit,
    )

    linear_layers = [module for module in model if isinstance(module, nn.Linear)]
    payload = {
        "version": 1,
        "normalization": NORMALIZATION_ID,
        "threshold": DEFAULT_THRESHOLD,
        "labels": labels,
        "layers": [
            {
                "W": layer.weight.detach().tolist(),
                "b": layer.bias.detach().tolist(),
            }
            for layer in linear_layers
        ],
    }

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(payload), encoding="utf-8")
    print(f"\nWrote model ({len(linear_layers)} dense layers) to {out_path}")


if __name__ == "__main__":
    main()

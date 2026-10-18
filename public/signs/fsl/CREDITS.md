# FSL handshape images

The `a.png` … `z.png` files are reference handshapes for the Filipino Sign
Language fingerspelling alphabet, used on the Learn and Practice pages.

- **Source:** [FSL Dataset](https://www.kaggle.com/datasets/japorton/fsl-dataset)
  by John Gabriel Porton (`japorton`) — 26 letters, images captured by the
  researchers and pre-cropped to the hand region.
- **License:** CC0 1.0 Public Domain Dedication. The creator waived all rights,
  so the images may be reused and redistributed without conditions or
  attribution.
- **Processing:** one representative frame per letter was selected and
  downscaled to PNG via `scripts/train/make_reference_images.py`. No other
  changes were made.
- **Note:** J and Z are motion letters. These images show the **starting** pose;
  the app adds an arrow overlay and movement text to describe the traced path.

No attribution is legally required under CC0, but we credit the original
creator to be respectful of their work.

import { describe, expect, it } from "vitest";
import { NORMALIZATION_ID } from "./normalize";
import {
  classifyLandmarks,
  predictWithModel,
  type LetterModel,
} from "./letter-model";
import type { Landmark } from "./features";

function model(partial: Partial<LetterModel>): LetterModel {
  return {
    version: 1,
    normalization: NORMALIZATION_ID,
    labels: ["A", "B"],
    layers: [],
    threshold: 0.5,
    ...partial,
  };
}

describe("predictWithModel", () => {
  it("picks the highest-scoring class through a single softmax layer", () => {
    const single = model({
      layers: [
        {
          W: [
            [1, 0],
            [0, 1],
          ],
          b: [0, 0],
        },
      ],
    });
    expect(predictWithModel(single, [3, 0]).letter).toBe("A");
    expect(predictWithModel(single, [0, 3]).letter).toBe("B");
  });

  it("applies ReLU between hidden layers", () => {
    const net = model({
      labels: ["A"],
      layers: [
        { W: [[1, -1]], b: [0] },
        { W: [[1]], b: [0] },
      ],
    });
    // relu(1*2 + -1*1) = 1 -> output 1 -> softmax 1.0 for the only class.
    const prediction = predictWithModel(net, [2, 1]);
    expect(prediction.letter).toBe("A");
    expect(prediction.confidence).toBeCloseTo(1, 6);
  });

  it("returns normalised, ranked candidates", () => {
    const single = model({
      layers: [
        {
          W: [
            [1, 0],
            [1, 0],
          ],
          b: [0, 0],
        },
      ],
    });
    const { candidates } = predictWithModel(single, [2, 0]);
    expect(candidates).toHaveLength(2);
    expect(candidates.map((c) => c.letter)).toEqual(["A", "B"]);
    const total = candidates.reduce((sum, c) => sum + c.score, 0);
    expect(total).toBeCloseTo(1, 6);
  });

  it("withholds a letter when confidence is below the threshold", () => {
    const single = model({
      threshold: 0.9,
      layers: [
        {
          W: [
            [1, 0],
            [1, 0],
          ],
          b: [0, 0],
        },
      ],
    });
    const prediction = predictWithModel(single, [2, 0]);
    expect(prediction.letter).toBeNull();
    expect(prediction.source).toBe("model");
  });

  it("marks model predictions with the model source", () => {
    const single = model({
      layers: [
        {
          W: [
            [1, 0],
            [0, 1],
          ],
          b: [0, 0],
        },
      ],
    });
    expect(predictWithModel(single, [3, 0]).source).toBe("model");
  });
});

describe("classifyLandmarks", () => {
  it("normalises landmarks before running the network", () => {
    // Normalised landmark 1 sits at index 3; weight it heavily to pick A.
    const rowA = new Array<number>(63).fill(0);
    const rowB = new Array<number>(63).fill(0);
    rowA[3] = 10;

    const single = model({ layers: [{ W: [rowA, rowB], b: [0, 0] }] });
    const hand: Landmark[] = Array.from({ length: 21 }, (_, i) => ({
      x: 0.5 + i * 0.01,
      y: 0.5,
      z: 0,
    }));

    const prediction = classifyLandmarks(single, hand);
    expect(prediction.letter).toBe("A");
    expect(prediction.confidence).toBeGreaterThan(0.5);
  });
});

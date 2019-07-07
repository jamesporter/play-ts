import { uniformRandomInt } from "../randomness";

describe("Uniform random int", () => {
  it("should work (nearly all the time!)", () => {
    const results = new Set<number>();

    for (let i = 0; i < 100; i++) {
      results.add(
        uniformRandomInt({
          from: 1,
          to: 5
        })
      );
    }
    expect(results.size).toEqual(5);
  });

  it("should work (nearly all the time!) for non inclusive range", () => {
    const results = new Set<number>();

    for (let i = 0; i < 100; i++) {
      results.add(
        uniformRandomInt({
          from: 1,
          to: 5,
          inclusive: false
        })
      );
    }
    expect(results.size).toEqual(4);
  });
});

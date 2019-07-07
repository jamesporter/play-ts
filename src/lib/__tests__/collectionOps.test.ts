import { pairWise, tripleWise } from "../collectionOps";

describe("Pairwise", () => {
  it("should be able to do pairwise on simple array", () => {
    expect(pairWise([1, 2, 3, 4, 5])).toMatchSnapshot();
  });

  it("should give empty array when not long enough", () => {
    expect(pairWise([1])).toEqual([]);
  });
});

describe("Triplewise", () => {
  it("should be able to do triplewise on simple array", () => {
    expect(tripleWise([1, 2, 3, 4, 5])).toMatchSnapshot();
  });

  it("should give empty array when not long enough", () => {
    expect(tripleWise([1, 2])).toEqual([]);
  });
});

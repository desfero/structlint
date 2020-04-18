import { findMatchedImports } from "./traverser";

describe("Traverser tests", () => {
  it("findMatchedImports package import tests", () => {
    expect(
      findMatchedImports(["@monorepo/components"], "@monorepo/components"),
    ).toEqual(["@monorepo/components"]);

    expect(
      findMatchedImports(["redux-saga/effects"], "redux-saga/**/*"),
    ).toEqual(["redux-saga/effects"]);

    expect(
      findMatchedImports(["react"], "react"),
    ).toEqual(["react"]);
  });
});

import { resolve } from "path";

import { structLint } from "./utils";

describe("typescript support", () => {
  it("should return 2 violations", async () => {
    const { stdout, code } = await structLint({
      cwd: resolve(__dirname, "../examples/violations-ts"),
    });

    expect(code).toBe(1);
    expect(stdout).toMatchSnapshot();
  });
});

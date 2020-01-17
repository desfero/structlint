import { resolve } from "path";

import { structLint } from "./utils";

describe("javascript support", () => {
  it("no violations found", async () => {
    const { stdout, code } = await structLint({
      cwd: resolve(__dirname, "../examples/no-violations-js"),
    });

    expect(code).toBe(0);
    expect(stdout).toMatchSnapshot();
  });

  it("no config found", async () => {
    const { stdout, code } = await structLint({
      cwd: resolve(__dirname, "../examples/no-config-js"),
    });

    expect(code).toBe(1);
    expect(stdout).toMatchSnapshot();
  });
});

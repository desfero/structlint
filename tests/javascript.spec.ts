import { resolve } from "path";

import { structLint } from "./utils";

describe("javascript support", () => {
  it("should return 2 structure violations", async () => {
    const { stdout, code } = await structLint({
      cwd: resolve(__dirname, "../examples/violations-js"),
    });

    expect(code).toBe(1);
    expect(stdout).toMatchSnapshot();
  });

  it("should return no violations found", async () => {
    const { stdout, code } = await structLint({
      cwd: resolve(__dirname, "../examples/no-violations-js"),
    });

    expect(code).toBe(0);
    expect(stdout).toMatchSnapshot();
  });

  it("should return no config found", async () => {
    const { stdout, code } = await structLint({
      cwd: resolve(__dirname, "../examples/no-config-js"),
    });

    expect(code).toBe(1);
    expect(stdout).toMatchSnapshot();
  });

  it("should return 4 violations for mono repo", async () => {
    const { stdout, code } = await structLint({
      cwd: resolve(__dirname, "../examples/violations-monorepo"),
    });

    expect(code).toBe(1);
    expect(stdout).toMatchSnapshot();
  });
});

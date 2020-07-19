import { resolve } from "path";

import { structLint } from "./utils";

describe("cli options", () => {
  it("--version", async () => {
    const { stdout, code } = await structLint({
      cwd: resolve(__dirname, "../examples/violations-js"),
      options: ["--version"],
    });

    expect(code).toBe(0);
    expect(stdout).toMatchSnapshot();
  });

  it("--help", async () => {
    const { stdout, code } = await structLint({
      cwd: resolve(__dirname, "../examples/violations-js"),
      options: ["--help"],
    });

    expect(code).toBe(0);
    expect(stdout).toMatchSnapshot();
  });

  it("--print-config", async () => {
    const { stdout, code } = await structLint({
      cwd: resolve(__dirname, "../examples/violations-js"),
      options: ["--print-config"],
    });

    expect(code).toBe(1);
    expect(stdout).toMatchSnapshot();
  });
});

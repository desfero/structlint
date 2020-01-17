import { exec } from "child_process";
import { resolve } from "path";

const structLint = ({ cwd }: { cwd: string }) =>
  new Promise((pResolve, pReject) => {
    exec(
      resolve(__dirname, "../bin/structlint.js"),
      {
        cwd,
        env: {
          ...process.env,
          // Turn off chalk color support
          // to make shapshot more readable
          FORCE_COLOR: "0",
        },
      },
      (error, stdout) => {
        if (!stdout) {
          pReject(new Error(`Failed to run structlint. Error: ${error}`));
        }

        pResolve({ stdout, code: error ? error.code : 0 });
      },
    );
  });

export { structLint };

import { exec } from "child_process";
import { resolve } from "path";

const structLint = ({ cwd }: { cwd: string }) =>
  new Promise((pResolve, pReject) => {
    exec(
      resolve(__dirname, "../bin/structlint.js"),
      { cwd },
      (error, stdout) => {
        if (!stdout) {
          pReject(new Error(`Failed to run structlint. Error: ${error}`));
        }

        pResolve({ stdout, code: error ? error.code : 0 });
      },
    );
  });

export { structLint };

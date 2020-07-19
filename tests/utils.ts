import { exec } from "child_process";
import { resolve } from "path";

const structLint = ({
  cwd,
  options = [],
}: {
  cwd: string;
  options?: string[];
}) =>
  new Promise((pResolve, pReject) => {
    exec(
      `node ${resolve(__dirname, "../bin/structlint.js")}${
        options ? " " + options.join(" ") : ""
      }`,
      {
        cwd,
        env: {
          ...process.env,
          // Turn off chalk color support
          // to make snapshot more readable
          FORCE_COLOR: "0",
        },
      },
      (error, stdout, stderr) => {
        if (!stdout) {
          pReject(new Error(`Failed to run structlint. ${error}`));
        }

        if (stderr) {
          pReject(new Error(`Failed to run structlint. ${stderr}`));
        }

        pResolve({ stdout, code: error ? error.code : 0 });
      },
    );
  });

export { structLint };

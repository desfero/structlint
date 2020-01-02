import * as fg from "fast-glob";
import * as chalk from "chalk";
import { cosmiconfig } from "cosmiconfig";

import { parse } from "./parser";
import { analyze } from "./analyzer";
import {prettyPrintViolations, printResult} from "./printer";
import { name } from "../package.json";

const log = console.log;
const error = console.error;
const debug = console.debug;

const logBold = chalk.bold;

const terminate = () => {
    // terminate the process with non zero exit code
    process.exit(1);
};

const run = async () => {
    try {
        const explorer = cosmiconfig(name);

        const result = await explorer.search();

        if (!result || result.isEmpty) {
            error(logBold.red("You need to specify structure config to run linter."));
            terminate();
        }

        log("Linting folder structure...");

        debug(`Root: ${process.cwd()}`);

        const files = await fg(result.config.include, { dot: true, });

        debug(`Files to parse: \n${files.join("\n")}`);

        const root = parse(files);

        const violations = await analyze(root, result.config);

        log(printResult(violations));

        if (violations.length > 0) {
            log(prettyPrintViolations(violations));

            terminate();
        }
    }
    catch (e) {
        error(e);

        terminate();
    }
};

export { run };

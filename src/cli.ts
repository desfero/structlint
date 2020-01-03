import * as globby from "globby";
import * as chalk from "chalk";
import { cosmiconfigSync } from "cosmiconfig";
import { dirname, join, relative, sep } from "path";

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

const runTask = async ({ relativePath, structure }) => {
    const taskNested = await Promise.all(structure.map(async structure => {
        const path = join(relativePath, structure.path);
        const disallowedImports = structure.disallowedImports.map(imp => join(sep, relativePath, imp));

        const files = await globby(path, { expandDirectories: structure.recursive, onlyFiles: true, });

        const root = parse(files);

        const directories = await globby(path, { expandDirectories: structure.recursive, onlyDirectories: true, });

        const violations = await analyze(root, [path, ...directories], disallowedImports);

        return violations;
    }));

    return taskNested.flat(Infinity);
};

const run = async () => {
    try {
        debug(`Root: ${process.cwd()}`);

        log("Resolving configs...");

        const explorer = cosmiconfigSync(name);

        const configs = globby
            .sync(["**/.struct-lint-rc"])
            .map(file => explorer.load(file))
            .flatMap(({ config, filepath }) => {
                // filter all empty configs
                if (!config) {
                    return [];
                }

                return [({
                    ...config,
                    relativePath: relative(process.cwd(), dirname(filepath))
                })];
            });

        if (configs.length === 0) {
            error(logBold.red("You need to specify structure config to run linter."));
            terminate();
        }

        log("Linting folder structure...");

        const violationsNested = await Promise.all(configs.map(runTask));

        const violations = violationsNested.flat(Infinity);

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

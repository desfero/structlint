import {Violation, ViolationByType, ViolationType} from "./violations";
import * as chalk from "chalk";
import * as dedent from "dedent";

const bold = chalk.bold;

const printType = (type: ViolationType) => bold.red(type);

const printViolation = (violation: Violation) => {
    switch (violation.type) {
        case ViolationType.DISALLOWED_IMPORTS:
            return logDisallowedImportViolation(violation);

        default:
            throw new Error("Not yet implemented");
    }
};

const logDisallowedImportViolation = (violation: ViolationByType<ViolationType.DISALLOWED_IMPORTS>) => {
    return dedent`
        The following imports are disallowed in ${bold(violation.file.path)}
        ${violation.disallowedImports.map(importPath => `- ${bold(importPath)}`).join("\n")}
    `;
};

const printResult = (violations: Violation[]) => {
    if (violations.length > 0) {
        return `Found ${bold.red(violations.length)} violation${violations.length !== 1 ? "s" : ""}`;
    }

    return "No violations found"
};

const prettyPrintViolations = (violations: Violation[]) => {
    return violations
        .map(violation => dedent`${printType(violation.type)}: ${printViolation(violation)}`)
        .join("\n");
};

export { prettyPrintViolations, printResult };

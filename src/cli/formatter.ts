import chalk from "chalk";
import dedent from "dedent";

import { Violation, ViolationByType, ViolationType } from "../violations";
import { NotYetImplementedError } from "../errors";

const bold = chalk.bold;

const printType = (type: ViolationType) => bold.red(type);

const printViolation = (violation: Violation) => {
  switch (violation.type) {
    case ViolationType.DISALLOWED_IMPORTS:
      return logDisallowedImportViolation(violation);

    default:
      throw new NotYetImplementedError();
  }
};

const logDisallowedImportViolation = ({
  file,
  config,
  disallowedImports,
}: ViolationByType<ViolationType.DISALLOWED_IMPORTS>) => {
  return dedent`
        The following imports are disallowed in ${bold(file.path)}
        ${disallowedImports
          .map(importPath => `- ${bold(importPath)}`)
          .join("\n")}
        ${config.message || ""}  
    `;
};

const printResult = (violations: Violation[]) => {
  if (violations.length > 0) {
    return `Found ${bold.red(violations.length)} violation${
      violations.length !== 1 ? "s" : ""
    }`;
  }

  return chalk.green("No violations found");
};

const prettyPrintViolations = (violations: Violation[]) => {
  return (
    "\n" +
    violations
      .map(
        violation =>
          dedent`${printType(violation.type)}: ${printViolation(violation)}`,
      )
      .join("\n\n")
  );
};

export { prettyPrintViolations, printResult };

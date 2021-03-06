import chalk from "chalk";
import dedent from "dedent";
import groupBy from "lodash/fp/groupBy";
import { join } from "path";

import { TViolation, TViolationByType, EViolationType } from "../violations";
import { debug } from "../utils";
import { NotYetImplementedError } from "../errors";
import { TDeepReadonly, TFile } from "../types";
import { TLoadConfigs } from "../config/schemas";

const bold = chalk.bold;

const formatterDebug = debug("formatter");

const printType = (type: EViolationType) => bold.red(type);

const printViolation = (
  file: TDeepReadonly<TFile>,
  violations: TViolation[],
) => {
  switch (violations[0].type) {
    case EViolationType.DISALLOWED_IMPORTS:
      return logDisallowedImportViolation(file, violations);

    default:
      throw new NotYetImplementedError();
  }
};

const logDisallowedImportViolation = (
  file: TDeepReadonly<TFile>,
  violations: TViolationByType<EViolationType.DISALLOWED_IMPORTS>[],
) => {
  return dedent`
        The following imports are disallowed in ${bold(file.path)}
        ${violations
          .map(
            ({ disallowedImport, config }) => dedent`
              - ${bold(disallowedImport)}
              ${config.message || ""} 
            `,
          )
          .join("\n")}
    `;
};

const printResult = (violations: TViolation[]) => {
  if (violations.length > 0) {
    return `Found ${bold.red(violations.length)} violation${
      violations.length !== 1 ? "s" : ""
    }`;
  }

  return chalk.green("No violations found");
};

const printConfig = (config: TLoadConfigs) =>
  `${bold("--")} Config path: ${bold(
    join(config.relativePath, config.fileName),
  )} `.padEnd(80, "-");

/**
 * Given that violations may come from different tasks for the same file
 * manual grouping is required to show all file related violations at once
 */
const groupViolations = groupBy<TViolation>(
  violation => `${violation.type}|${violation.file.path}`,
);

const prettyPrintViolationsByConfig = (
  violations: TViolation[],
  config: TLoadConfigs,
) => dedent`
  ${printConfig(config)}
  ${prettyPrintViolations(violations)}
`;

const prettyPrintViolations = (violations: TViolation[]) => {
  formatterDebug(`Grouping ${violations.length} violations by type and file`);

  const grouped = groupViolations(violations);

  formatterDebug(
    `Violations grouped. ${violations.length} violations to be reported`,
  );
  return (
    "\n" +
    Object.values(grouped)
      .map(violations => {
        // `fileViolations` are grouped already by type and file
        // therefore we can just take them from the first violation
        const { type, file } = violations[0];

        return dedent`${printType(type)}: ${printViolation(file, violations)}`;
      })
      .join("\n\n")
  );
};

export { prettyPrintViolations, printResult, prettyPrintViolationsByConfig };

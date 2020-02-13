import { DeepReadonly, Demand, File } from "./types";
import { ImportConfig } from "./config";

enum ViolationType {
  DISALLOWED_IMPORTS = "DISALLOWED IMPORTS",
}

const createDisallowedImportViolation = (
  demand: DeepReadonly<Demand>,
  file: DeepReadonly<File>,
  disallowedImports: string[],
  config: ImportConfig,
) =>
  ({
    type: ViolationType.DISALLOWED_IMPORTS,
    file,
    disallowedImports,
    demand,
    config,
  } as const);

type Violation = ReturnType<typeof createDisallowedImportViolation>;

type ViolationByType<T extends ViolationType> = Extract<Violation, { type: T }>;

export {
  Violation,
  createDisallowedImportViolation,
  ViolationType,
  ViolationByType,
};

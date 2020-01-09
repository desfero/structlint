import { File, Folder } from "./types";
import { DeepReadonly } from "./utils";
import { ImportConfig } from "./config";

enum ViolationType {
  DISALLOWED_IMPORTS = "DISALLOWED IMPORTS",
}

const createDisallowedImportViolation = (
  folder: DeepReadonly<Folder>,
  file: DeepReadonly<File>,
  disallowedImports: string[],
  config: ImportConfig,
) =>
  ({
    type: ViolationType.DISALLOWED_IMPORTS,
    file,
    disallowedImports,
    folder,
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

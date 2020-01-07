import { File, Folder } from "./types";
import { DeepReadonly } from "./utils";

enum ViolationType {
  DISALLOWED_IMPORTS = "DISALLOWED IMPORTS",
}

const createDisallowedImportViolation = (
  folder: DeepReadonly<Folder>,
  file: DeepReadonly<File>,
  disallowedImports: string[],
) =>
  ({
    type: ViolationType.DISALLOWED_IMPORTS,
    file,
    disallowedImports,
    folder,
  } as const);

type Violation = ReturnType<typeof createDisallowedImportViolation>;

type ViolationByType<T extends ViolationType> = Extract<Violation, { type: T }>;

export {
  Violation,
  createDisallowedImportViolation,
  ViolationType,
  ViolationByType,
};

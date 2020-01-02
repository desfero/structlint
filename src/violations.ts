import { File, Folder } from "./types";

enum ViolationType {
    DISALLOWED_IMPORTS = "DISALLOWED IMPORTS",
}

const createDisallowedImportViolation = (folder: Folder, file: File, disallowedImports: string[]) => ({
  type: ViolationType.DISALLOWED_IMPORTS,
  file,
  disallowedImports,
  folder,
} as const);

type Violation =
    ReturnType<typeof createDisallowedImportViolation>;

type ViolationByType<T extends ViolationType> = Extract<Violation, { type: T }>;

export { Violation, createDisallowedImportViolation, ViolationType, ViolationByType };

import { DeepReadonly, File } from "./types";
import { ImportConfig } from "./config";

enum EViolationType {
  DISALLOWED_IMPORTS = "DISALLOWED IMPORTS",
}

type TViolation = ReturnType<typeof createDisallowedImportViolation>;

type TViolationByType<T extends EViolationType> = Extract<
  TViolation,
  { type: T }
>;

const createDisallowedImportViolation = (
  file: DeepReadonly<File>,
  disallowedImports: string[],
  config: TImportConfig,
) =>
  ({
    type: EViolationType.DISALLOWED_IMPORTS,
    file,
    disallowedImports,
    config,
  } as const);

export {
  TViolation,
  createDisallowedImportViolation,
  EViolationType,
  TViolationByType,
};

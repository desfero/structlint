import { TDeepReadonly, TFile } from "./types";
import { TImportConfig } from "./config/schemas";

enum EViolationType {
  DISALLOWED_IMPORTS = "DISALLOWED IMPORTS",
}

type TViolation = ReturnType<typeof createDisallowedImportViolation>;

type TViolationByType<T extends EViolationType> = Extract<
  TViolation,
  { type: T }
>;

const createDisallowedImportViolation = (
  file: TDeepReadonly<TFile>,
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

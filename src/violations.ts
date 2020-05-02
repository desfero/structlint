import { TDeepReadonly, TDemand, TFile } from "./types";
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
  demand: TDeepReadonly<TDemand>,
  file: TDeepReadonly<TFile>,
  disallowedImports: string[],
  config: TImportConfig,
) =>
  ({
    type: EViolationType.DISALLOWED_IMPORTS,
    file,
    disallowedImports,
    demand,
    config,
  } as const);

export {
  TViolation,
  createDisallowedImportViolation,
  EViolationType,
  TViolationByType,
};

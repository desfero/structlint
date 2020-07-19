import * as yup from "yup";

const importSchema = yup
  .object({
    glob: yup.string().required(),
    message: yup.string(),
  })
  .transform((_, originalValue) => {
    switch (typeof originalValue) {
      case "string":
        return {
          glob: originalValue,
          message: undefined,
        };
      default:
        return importSchema.validateSync(originalValue, { strict: true });
    }
  });

const structureSchema = yup.object({
  description: yup.string().required(),
  path: yup.string().required(),
  recursive: yup.bool().default(true),
  disallowedImports: yup.array(importSchema).default([]),
  allowedImports: yup.array(importSchema).default([]),
});

export const configSchema = yup.object({
  fileName: yup.string().required(),
  relativePath: yup
    .string()
    .test(
      "is-defined",
      "${path} is not provided",
      value => value !== undefined,
    ),
  structure: yup.array(structureSchema).required(),
});

type TStructureConfig = yup.InferType<typeof structureSchema>;
type TImportConfig = yup.InferType<typeof importSchema>;
type TLoadConfigs = yup.InferType<typeof configSchema>;

export { TLoadConfigs, TImportConfig, TStructureConfig };

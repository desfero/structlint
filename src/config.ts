import { cosmiconfigSync } from "cosmiconfig";
import * as globby from "globby";
import * as yup from "yup";
import { dirname, relative } from "path";

import { name } from "../package.json";

const CONFIG_PATTERNS = ["**/.structlintrc"];

const configExplorer = cosmiconfigSync(name);

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

const configSchema = yup.object({
  relativePath: yup
    .string()
    .test(
      "is-defined",
      "${path} is not provided",
      value => value !== undefined,
    ),
  structure: yup.array(structureSchema).required(),
});

type Config = yup.InferType<typeof configSchema>;

type ImportConfig = yup.InferType<typeof importSchema>;

const loadConfigs = (): ReadonlyArray<Config> => {
  return globby
    .sync(CONFIG_PATTERNS)
    .map(file => configExplorer.load(file))
    .flatMap(explorer => {
      if (explorer !== null) {
        // filter all empty configs
        if (explorer.isEmpty) {
          return [];
        }

        return {
          ...explorer.config,
          relativePath: relative(process.cwd(), dirname(explorer.filepath)),
        };
      }
    })
    .map(config =>
      configSchema.validateSync(config, {
        stripUnknown: true,
      }),
    );
};

export { loadConfigs, Config, ImportConfig };

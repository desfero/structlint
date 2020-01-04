import { cosmiconfigSync } from "cosmiconfig";
import * as globby from "globby";
import * as yup from "yup";
import { dirname, relative } from "path";

import { name } from "../package.json";

const CONFIG_PATTERNS = ["**/.struct-lint-rc"];

const configExplorer = cosmiconfigSync(name);

const structureSchema = yup.object({
    description: yup.string().required(),
    path: yup.string().required(),
    recursive: yup.bool().default(true),
    disallowedImports: yup.array(yup.string()).required(),
});

const configSchema = yup.object({
    relativePath: yup.string().test(
        'is-defined',
        '${path} is not provided',
        value => value !== undefined,
    ),
    structure: yup.array(structureSchema).required(),
});

type Config = yup.InferType<typeof configSchema>;

const loadConfigs = (): ReadonlyArray<Config> => {
    return globby
        .sync(CONFIG_PATTERNS)
        .map(file => configExplorer.load(file))
        .flatMap(({ config: parsedConfig, filepath }) => {
            // filter all empty configs
            if (!parsedConfig) {
                return [];
            }

            return {
                ...parsedConfig,
                relativePath: relative(process.cwd(), dirname(filepath))
            };
        })
        .map(config => configSchema.validateSync(config));
};

export { loadConfigs, Config }

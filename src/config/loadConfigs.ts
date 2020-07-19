import { cosmiconfigSync } from "cosmiconfig";
import * as globby from "globby";
import { dirname, relative, basename } from "path";

import { name } from "../../package.json";
import { TLoadConfigs, configSchema } from "./schemas";

const CONFIG_PATTERNS = ["**/.structlintrc"];

const configExplorer = cosmiconfigSync(name);

const loadConfigs = (): ReadonlyArray<TLoadConfigs> =>
  globby
    .sync(CONFIG_PATTERNS)
    .map(configExplorer.load)
    .flatMap(explorer => {
      if (explorer !== null) {
        // filter all empty configs
        if (explorer.isEmpty) {
          return [];
        }

        return {
          ...explorer.config,
          fileName: basename(explorer.filepath),
          relativePath: relative(process.cwd(), dirname(explorer.filepath)),
        };
      }
    })
    .map(config =>
      configSchema.validateSync(config, {
        stripUnknown: true,
      }),
    );

export { loadConfigs };

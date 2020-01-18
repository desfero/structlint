import { partition } from "lodash/fp";
import { sep } from "path";
import * as globby from "globby";

/**
 *  Cast a `value` to exclude `null` and `undefined`.
 *  Throws if either `null` or `undefined` was passed
 */
function nonNullable<T>(
  value: T,
  message?: string,
): asserts value is NonNullable<T> {
  if (value === undefined || value === null) {
    throw new Error(
      message || `Non nullable values expected, received ${value}`,
    );
  }
}

type Primitive = string | number | boolean | undefined | null;

type DeepReadonly<T> = T extends Primitive
  ? T
  : T extends Array<infer U>
  ? ReadonlyArray<U>
  : T extends Function
  ? T
  : DeepReadonlyObject<T>;

export type DeepReadonlyObject<T> = {
  readonly [P in keyof T]: DeepReadonly<T[P]>;
};

type TOptions = { expandDirectories: boolean };

const getPathFilesAndDirectories = async (
  path: string,
  { expandDirectories }: TOptions,
) => {
  const filesAndFolders = await globby(path, {
    expandDirectories,
    onlyFiles: false,
    gitignore: true,
    markDirectories: true,
  });

  const [directories, files] = partition(
    path => path.endsWith(sep),
    filesAndFolders,
  );

  return { directories, files };
};

export { nonNullable, Primitive, DeepReadonly, getPathFilesAndDirectories };

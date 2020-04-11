import { ImportDefinition } from "./parsers/types";

type Primitive = string | number | boolean | undefined | null;

type DeepReadonly<T> = T extends Primitive
  ? T
  : T extends Array<infer U>
  ? ReadonlyArray<U>
  : T extends Function
  ? T
  : DeepReadonlyObject<T>;

type DeepReadonlyObject<T> = {
  readonly [P in keyof T]: DeepReadonly<T[P]>;
};

type Folder = {
  parent: undefined | Folder;
  path: string;
  name: string;
  folders: Record<string, undefined | Folder>;
  files: Record<string, undefined | File>;
};

type File = {
  path: string;
  name: string;
  parent: Folder;
  imports: ImportDefinition[];
};

type Demand = Folder | File;

export { File, Folder, Primitive, DeepReadonly, DeepReadonlyObject, Demand };

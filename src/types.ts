import { TImportDefinition } from "./parsers/types";

type TPrimitive = string | number | boolean | undefined | null;

type TDeepReadonly<T> = T extends TPrimitive
  ? T
  : T extends Array<infer U>
  ? ReadonlyArray<U>
  : T extends Function
  ? T
  : TDeepReadonlyObject<T>;

type TDeepReadonlyObject<T> = {
  readonly [P in keyof T]: TDeepReadonly<T[P]>;
};

export type SafeRecord<K extends string | number, T> = { [key in K]?: T };

type TFolder = {
  parent: undefined | TFolder;
  path: string;
  name: string;
  folders: Record<string, undefined | TFolder>;
  files: Record<string, undefined | TFile>;
};

type TFile = {
  path: string;
  name: string;
  parent: TFolder;
  imports: TImportDefinition[];
};

type TDemand = TFolder | TFile;

export {
  TFile,
  TFolder,
  TPrimitive,
  TDeepReadonly,
  TDeepReadonlyObject,
  TDemand,
};

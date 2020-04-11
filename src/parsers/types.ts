// TODO: Add more information to import definition (location/imported variables/etc)
export type ImportDefinition = string;

export type Parser = {
  name: string;
  canParse: (filePath: string) => boolean;
  parse: (filePath: string) => void;
};

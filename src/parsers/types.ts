// TODO: Add more information to import definition (location/imported variables/etc)
export type TImportDefinition = string;

export type TParser = {
  name: string;
  canParse: (filePath: string) => boolean;
  parse: (filePath: string) => void;
};

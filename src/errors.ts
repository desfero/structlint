class StructlintError extends Error {
  constructor(message: string) {
    super(`[structlint] ${message}`);
  }
}

class FolderNotFoundError extends StructlintError {
  constructor(folderPath: string) {
    super(`No folder found under ${folderPath}`);
  }
}

class FileNotFoundError extends StructlintError {
  constructor(filePath: string) {
    super(`No file found under ${filePath}`);
  }
}

class NotYetImplementedError extends StructlintError {
  constructor() {
    super(`Not yet implemented`);
  }
}

class FileParsingFailedError extends StructlintError {
  constructor(filePath: string, parserErrorMessage: string) {
    super(`Failed to parse "${filePath}"\n${parserErrorMessage}`);
  }
}

class MoreThanOneParserError extends StructlintError {
  constructor(filePath: string, matchedParsers: string[]) {
    super(
      `More than one parsed matched "${filePath}": ${matchedParsers.join(
        ", ",
      )}.`,
    );
  }
}

export {
  StructlintError,
  FolderNotFoundError,
  FileParsingFailedError,
  NotYetImplementedError,
  MoreThanOneParserError,
  FileNotFoundError,
};

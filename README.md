![npm](https://img.shields.io/npm/v/structlint?style=flat-square)

<p align="center">
  <img src="https://raw.githubusercontent.com/desfero/structlint/master/logo/logo_transparent.png" width="300" alt="structlint">
</p>

## Getting Started

Install the package:

```sh
npm install --save-dev structlint
```

in case you prefer `yarn`

```sh
yarn add -D structlint
```

then add the config into a `.structlintrc` file. For example:

**.structlintrc**

```json
{
  "structure": [
    {
      "description": "Core application business logic",
      "path": "./modules",
      "disallowedImports": [
        {
          "glob": "./components/**/*",
          "message": "Business logic should never import UI components"
        }
      ]
    },
    {
      "description": "Reducers",
      "path": "./reducers",
      "disallowedImports": ["./components/**/*", "./sagas/**/*"],
      "allowedImports": ["./utils/**/*"]
    }
  ]
}
```

You can have a single config file at the root of your project or multiple configs, one for every major sub directory.

```
- src
  - reducers
    - .structlintrc
    - user.reducer.js
    - settings.reducer.js
    - profile.reducer.js
  - components
    - .structlintrc
    - Header
      - Header.js
      - Header.scss
    - Footer
      - Header.js
      - Header.scss
   - sagas
     - .structlintrc
     - auth.saga.js
     - profile.saga.js
   - utils
     - .structlintrc
     - color.js
     - url.js
- tests
  - .structlintrc
  - user-tests
  - settings-tests
```

## Usage

Run from the root of your project:

```sh
<path-to-node-modules>/.bin/structlint
```

OR

```
npx structlint
```

Structlint will recursively go through the sub-directories and lint them.
If you prefer to lint just one sub-directory, you must change the directory before running the command: `cd tests && structlint`.

## Options

### structure

Type: `array`

An array of objects containing the following:

| Name                | Type                               | Description                                                                                                          |
| ------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `description`       | `String`                           | Name or label or description for the directory to be linted                                                          |
| `path`              | `String`                           | Path to the directory to be linted relative to `.structlintrc`                                                       |
| `disallowedImports` | `Array<String>` or `Array<Object>` | An array of globs representing the imports to be disallowed or an array of objects containing the glob and a message |
| `allowedImports`    | `Array<String>` or `Array<Object>` | An array of globs representing the imports to be allowed or an array of objects containing the glob and a message    |
| `recursive`         | `Boolean`                          | Defaults to `true`. If `false`, will not check sub directories.                                                      |

Checkout the [examples](https://github.com/desfero/structlint/tree/master/examples) for more.

# lint-world

One command to run every linter in your project.

`lint-world` is a small orchestrator for the tools you already use - ESLint, Prettier, TypeScript, Knip, and Stylelint. You declare them once in a config file, and a single `lint-world` invocation runs them all, in parallel, with unified output.

```
> eslint running
> prettier running
> tsc running
> eslint successful
> prettier successful
> tsc successful
```

## Why

A typical project accumulates a chain of shell commands in `package.json`:

```json
"lint": "eslint . && prettier --check . && tsc --noEmit && knip"
```

That chain stops at the first failure, has no shared `--fix` mode, runs everything serially, and can't be reconfigured without editing a string. `lint-world` replaces it with a typed config, parallel execution, and per-tool CLI flags.

## Installation

```sh
npm install --save-dev lint-world
# or
pnpm add -D lint-world
```

Each underlying tool (`eslint`, `prettier`, `typescript`, ...) stays a dependency of your project - `lint-world` only invokes the locally installed binaries.

## Getting started

Create a `lint-world.config.ts` in your project root:

```ts
import { defineConfig, eslint, prettier, tsc, knip } from 'lint-world';

export default defineConfig({
  tools: [eslint(), prettier({ cache: true }), tsc(), knip()],
});
```

Then wire it into your scripts:

```json
{
  "scripts": {
    "lint": "lint-world",
    "lint:fix": "lint-world --fix"
  }
}
```

## CLI

```sh
lint-world [options]
```

| Flag                           | Default  | Description                                                                                  |
| ------------------------------ | -------- | -------------------------------------------------------------------------------------------- |
| `--fix`                        | `false`  | Run the tools in fix mode (`eslint --fix`, `prettier --write`). Forces sequential execution. |
| `--parallel` / `--no-parallel` | `true`   | Run tools concurrently. Ignored when `--fix` is set.                                         |
| `--dry-run`                    | `false`  | Print the command each tool would run, without executing anything.                           |
| `--<tool>` / `--no-<tool>`     | per tool | Enable or disable an individual tool for this run.                                           |

Every tool contributes a flag named after itself, so you can narrow a run:

```sh
lint-world --no-knip             # everything except knip
lint-world --fix --no-eslint     # fix mode, skip eslint
```

The process exits with code `1` if any tool fails; a failure does not stop the remaining tools from running.

### Dry run

`--dry-run` prints the fully resolved command line for each tool that would run:

```sh
$ lint-world --dry-run
eslint   │ eslint .
prettier │ prettier . --check --cache
tsc      │ tsc --noEmit
knip     │ knip
```

This is the fastest way to check what a given combination of options and flags actually expands to.

## Built-in tools

All built-ins accept `executeByDefault` (whether the tool runs when its flag is not given) and `cliOptions` (extra arguments appended verbatim).

### eslint

| Option   | Type                                            | Description                                                               |
| -------- | ----------------------------------------------- | ------------------------------------------------------------------------- |
| `target` | `string \| string[]`                            | Paths or globs to lint. Defaults to `.`.                                  |
| `cache`  | `boolean \| { cacheLocation?, cacheStrategy? }` | Adds `--cache` and friends. `cacheStrategy` is `'metadata' \| 'content'`. |

Adds `--fix` in fix mode.

### prettier

Same `target` and `cache` options as ESLint. Runs `--check` normally and `--write` in fix mode.

### stylelint

Same `target` and `cache` options; `target` defaults to `**/*.css` instead of `.`. Adds `--fix` in fix mode.

### tsc (TypeScript)

Runs `tsc --noEmit`. Automatically skipped when `--fix` is set.

### knip

| Option   | Type                           | Description                                      |
| -------- | ------------------------------ | ------------------------------------------------ |
| `cache`  | `boolean \| { cacheLocation }` | Adds `--cache` / `--cache-location`.             |
| `cycles` | `boolean`                      | Adds `--cycles` to report circular dependencies. |

Adds `--fix` in fix mode.

Example:

```ts
import { defineConfig, eslint, stylelint, knip } from 'lint-world';

export default defineConfig({
  tools: [
    eslint({
      target: ['src', 'scripts'],
      cache: {
        cacheLocation: 'node_modules/.cache/eslint',
        cacheStrategy: 'content',
      },
      cliOptions: '--max-warnings=0',
    }),
    stylelint({ target: 'src/**/*.css' }),
    knip({ cycles: true, executeByDefault: false }),
  ],
});
```

With `executeByDefault: false`, Knip only runs when you ask for it explicitly: `lint-world --knip`.

## Custom tools

A tool is an object with a name, an optional predicate, and an execution function.

```ts
import { defineLintTool, npmExec } from 'lint-world';

export const madge = defineLintTool<'madge'>({
  name: 'madge',
  cli: {
    madge: { default: true },
  },
  when: ({ fix, madge }) => !fix && madge,
  execute: npmExec(['madge', '--circular', 'src']),
});
```

| Property  | Type                                   | Description                                                             |
| --------- | -------------------------------------- | ----------------------------------------------------------------------- |
| `name`    | `string`                               | Shown in the output and used as the tool's CLI flag.                    |
| `cli`     | `Record<string, { default: boolean }>` | Optional. The boolean flags this tool contributes, with their defaults. |
| `when`    | `(args) => boolean`                    | Optional. Whether to run for this invocation. Omit it to always run.    |
| `execute` | `(args) => void \| Promise<void>`      | The work itself. Throwing marks the tool as failed.                     |

### `npmExec`

`npmExec` builds an execution function that runs a locally installed binary via [execa](https://github.com/sindresorhus/execa) with `preferLocal: true`, so `node_modules/.bin` is on the path.

Its argument is a command template, where each entry may be a string, a nested array, a falsy value (dropped), or a function of the current args:

```ts
npmExec([
  'my-linter',
  ({ fix }) => fix && '--fix',
  options?.strict && '--strict',
  options?.cliOptions,
]);
```

### Executing arbitrary code

`execute` is an ordinary function - it doesn't have to spawn a process:

```ts
export const noTodos = defineLintTool({
  name: 'no-todos',
  execute: async () => {
    const offenders = await findTodoComments();

    if (offenders.length > 0) {
      throw new Error(`Found ${offenders.length} TODO comments`);
    }
  },
});
```

To make such a tool visible in `--dry-run`, attach a `describe` function to it.

## License

MIT

import { loadConfig, type LintWorldConfig } from './config.js';
import chalk from 'chalk';
import type { BaseLintTool, CliArgumentMap } from './tool.js';
import minimist from 'minimist';

type CliArgs = {
  fix: boolean;
  parallel: boolean;
  'dry-run': boolean;
  [key: string]: boolean;
};

type ExecutionStrategy = <Args>(
  tools: readonly BaseLintTool<Args>[],
  args: Args,
) => Promise<boolean>;

function printStatus(
  action: string,
  toolName: string,
  format: (value: string) => string,
) {
  console.log(format(`> ${chalk.bold(toolName)} ${action}`));
}

async function runTool<Args>(
  tool: BaseLintTool<Args>,
  args: Args,
): Promise<boolean> {
  const { name, execute } = tool;

  try {
    printStatus('running', name, chalk.gray);
    await execute(args);
    printStatus('successful', name, chalk.green);

    return true;
  } catch (error) {
    printStatus('failed', name, chalk.red);
    console.log(error instanceof Error ? error.message : String(error));

    return false;
  }
}

function shouldRunTool<Args>(tool: BaseLintTool<Args>, args: Args): boolean {
  return tool.when?.(args) ?? true;
}

const sequentialExecution: ExecutionStrategy = async (tools, args) => {
  let allSuccess = true;

  for (const tool of tools) {
    if (shouldRunTool(tool, args)) {
      allSuccess &&= await runTool(tool, args);
    }
  }

  return allSuccess;
};

const parallelExecution: ExecutionStrategy = async (tools, args) => {
  const results = await Promise.all(
    tools.map(async (tool) => {
      if (shouldRunTool(tool, args)) {
        return runTool(tool, args);
      }

      return true;
    }),
  );

  return results.every((result) => result);
};

function getMinimistOptions(config: LintWorldConfig): minimist.Opts {
  const cli = Object.assign(
    {},
    ...config.tools.map((tool) => tool.cli),
  ) as CliArgumentMap<string>;

  const defaultValues: Record<string, boolean> = {
    fix: false,
    parallel: true,
    'dry-run': false,
  };

  for (const key in cli) {
    const descriptor = cli[key];

    if (descriptor) {
      defaultValues[key] = descriptor.default;
    }
  }

  return {
    boolean: ['fix', 'parallel', 'dry-run', ...Object.keys(cli)],
    default: defaultValues,
  };
}

async function runTools(config: LintWorldConfig, args: CliArgs) {
  const runInParallel = args.parallel && !args.fix;
  const strategy = runInParallel ? parallelExecution : sequentialExecution;

  const success = await strategy(config.tools, args);

  if (!success) {
    process.exit(1);
  }
}

function dryRunTools(config: LintWorldConfig, args: CliArgs) {
  const rows: { name: string; description: string }[] = [];
  let maxNameLength = 0;

  for (const tool of config.tools) {
    if (shouldRunTool(tool, args)) {
      const { name, execute } = tool;
      const description = execute.describe?.(args);

      if (description !== undefined) {
        rows.push({ name, description });

        maxNameLength = Math.max(maxNameLength, name.length);
      }
    }
  }

  console.log(
    rows
      .map(
        ({ name, description }) =>
          `${chalk.bold(name.padEnd(maxNameLength))} │ ${description}`,
      )
      .join('\n'),
  );
}

async function main() {
  const config = await loadConfig();
  const parsedArgs = minimist(
    process.argv.slice(2),
    getMinimistOptions(config),
  );

  const args = parsedArgs as unknown as CliArgs;

  if (args['dry-run']) {
    dryRunTools(config, args);
  } else {
    await runTools(config, args);
  }
}

void main();

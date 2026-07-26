import { loadConfig, type LintWorldConfig } from './config.js';
import chalk from 'chalk';
import type { BaseLintPhase, CliArgumentMap } from './phase.js';
import minimist from 'minimist';

type ExecutionStrategy = <Args>(
  phases: readonly BaseLintPhase<Args>[],
  args: Args,
) => Promise<boolean>;

function printStatus(
  action: string,
  phaseName: string,
  format: (value: string) => string,
): void {
  console.log(format(`> ${chalk.bold(phaseName)} ${action}`));
}

async function runPhase<Args>(
  phase: BaseLintPhase<Args>,
  args: Args,
): Promise<boolean> {
  const { name, execute } = phase;

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

function shouldRunPhase<Args>(phase: BaseLintPhase<Args>, args: Args): boolean {
  return phase.when?.(args) ?? true;
}

const sequentialExecution: ExecutionStrategy = async (phases, args) => {
  let allSuccess = true;

  for (const phase of phases) {
    if (shouldRunPhase(phase, args)) {
      allSuccess &&= await runPhase(phase, args);
    }
  }

  return allSuccess;
};

const parallelExecution: ExecutionStrategy = async (phases, args) => {
  const results = await Promise.all(
    phases.map(async (phase) => {
      if (shouldRunPhase(phase, args)) {
        return runPhase(phase, args);
      }

      return true;
    }),
  );

  return results.every((result) => result);
};

function getMinimistOptions(config: LintWorldConfig): minimist.Opts {
  const cli = Object.assign(
    {},
    ...config.phases.map((phase) => phase.cli),
  ) as CliArgumentMap<string>;

  const defaultValues: Record<string, boolean> = {
    fix: false,
    parallel: true,
  };

  for (const key in cli) {
    const descriptor = cli[key];

    if (descriptor) {
      defaultValues[key] = descriptor.default;
    }
  }

  return {
    boolean: ['fix', 'parallel', ...Object.keys(cli)],
    default: defaultValues,
  };
}

async function main() {
  const config = await loadConfig();
  const parsedArgs = minimist(
    process.argv.slice(2),
    getMinimistOptions(config),
  );

  const args = parsedArgs as unknown as {
    fix: boolean;
    parallel: boolean;
    [key: string]: boolean;
  };

  const runInParallel = args.parallel && !args.fix;
  const strategy = runInParallel ? parallelExecution : sequentialExecution;

  const success = await strategy(config.phases, args);

  if (!success) {
    process.exit(1);
  }
}

void main();

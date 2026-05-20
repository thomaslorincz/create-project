import { spawn } from 'node:child_process';
import { mkdir, readdir, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { stdin as input, stdout as output } from 'node:process';
import readline from 'node:readline/promises';
import {
  backendPackageJson,
  tsconfig as backendTsconfig,
  devVars,
  drizzleConfig,
  healthRouterTs,
  indexTs,
  middlewareTs,
  schemaTs,
  typesTs,
  wranglerJsonc,
} from './templates/backend.ts';
import {
  appTsx,
  oxlintConfig as frontendOxlintConfig,
  frontendPackageJson,
  indexCss,
  indexHtml,
  mainTsx,
  tsconfig,
  tsconfigApp,
  tsconfigNode,
  viteConfig,
} from './templates/frontend.ts';
import {
  bunfigToml,
  cursorRules,
  gitignore,
  oxfmtConfig,
  oxlintConfig,
  readme,
  rootPackageJson,
  vscodeExtensions,
  vscodeSettings,
} from './templates/root.ts';

interface CliOptions {
  force: boolean;
  help: boolean;
  install: boolean;
  packageName?: string;
  projectName?: string;
}

interface ScaffoldOptions {
  force: boolean;
  install: boolean;
  packageName: string;
  projectName: string;
  targetDir: string;
  workerName: string;
}

export async function run(argv: string[]) {
  const options = await getOptions(argv);

  if (options.help) {
    printHelp();
    return;
  }

  const projectName = options.projectName ?? (await promptProjectName());
  const targetDir = path.resolve(process.cwd(), projectName);
  const packageName = options.packageName ?? toPackageName(path.basename(targetDir));

  validatePackageName(packageName);

  const scaffoldOptions: ScaffoldOptions = {
    force: options.force,
    install: options.install,
    packageName,
    projectName,
    targetDir,
    workerName: toWorkerName(packageName),
  };

  await scaffold(scaffoldOptions);
  printNextSteps(scaffoldOptions);
}

async function getOptions(argv: string[]): Promise<CliOptions> {
  const options: CliOptions = {
    force: false,
    help: false,
    install: true,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--help' || arg === '-h') {
      options.help = true;
      continue;
    }

    if (arg === '--force' || arg === '-f') {
      options.force = true;
      continue;
    }

    if (arg === '--no-install') {
      options.install = false;
      continue;
    }

    if (arg === '--name') {
      const value = argv[index + 1];

      if (!value) {
        throw new Error('Expected a value after --name.');
      }

      options.packageName = value;
      index += 1;
      continue;
    }

    if (arg.startsWith('--name=')) {
      options.packageName = arg.slice('--name='.length);
      continue;
    }

    if (arg.startsWith('-')) {
      throw new Error(`Unknown option: ${arg}`);
    }

    if (options.projectName) {
      throw new Error(`Unexpected argument: ${arg}`);
    }

    options.projectName = arg;
  }

  return options;
}

async function promptProjectName() {
  const rl = readline.createInterface({ input, output });

  try {
    const answer = await rl.question('Project name: ');
    const projectName = answer.trim();

    if (!projectName) {
      throw new Error('Project name is required.');
    }

    return projectName;
  } finally {
    rl.close();
  }
}

async function scaffold(options: ScaffoldOptions) {
  await prepareTargetDirectory(options);
  await writeRootFiles(options);
  await scaffoldFrontend(options);
  await writeBackendFiles(options);

  if (options.install) {
    await runCommand('bun', ['install'], options.targetDir);
    await runPostInstallCommands(options);
  }
}

async function prepareTargetDirectory({ force, targetDir }: ScaffoldOptions) {
  const exists = await pathExists(targetDir);

  if (!exists) {
    await mkdir(targetDir, { recursive: true });
    return;
  }

  const entries = await readdir(targetDir);

  if (entries.length === 0) {
    return;
  }

  if (!force) {
    throw new Error(`${targetDir} is not empty. Re-run with --force to overwrite it.`);
  }

  await rm(targetDir, { force: true, recursive: true });
  await mkdir(targetDir, { recursive: true });
}

async function writeRootFiles(options: ScaffoldOptions) {
  await writeFile(path.join(options.targetDir, 'package.json'), rootPackageJson(options));
  await writeFile(path.join(options.targetDir, 'bunfig.toml'), bunfigToml);
  await writeFile(path.join(options.targetDir, '.gitignore'), gitignore);
  await writeFile(path.join(options.targetDir, '.cursorrules'), cursorRules);
  await writeFile(path.join(options.targetDir, '.oxlintrc.json'), oxlintConfig);
  await writeFile(path.join(options.targetDir, '.oxfmtrc.json'), oxfmtConfig);
  await writeFile(path.join(options.targetDir, 'README.md'), readme(options));

  await mkdir(path.join(options.targetDir, '.vscode'), { recursive: true });
  await writeFile(path.join(options.targetDir, '.vscode', 'settings.json'), vscodeSettings);
  await writeFile(path.join(options.targetDir, '.vscode', 'extensions.json'), vscodeExtensions);
}

async function scaffoldFrontend(options: ScaffoldOptions) {
  const frontendDir = path.join(options.targetDir, 'frontend');

  await mkdir(path.join(frontendDir, 'src'), { recursive: true });
  await writeFile(path.join(frontendDir, 'package.json'), frontendPackageJson(options));
  await writeFile(path.join(frontendDir, 'vite.config.ts'), viteConfig);
  await writeFile(path.join(frontendDir, 'tsconfig.json'), tsconfig);
  await writeFile(path.join(frontendDir, 'tsconfig.app.json'), tsconfigApp);
  await writeFile(path.join(frontendDir, 'tsconfig.node.json'), tsconfigNode);
  await writeFile(path.join(frontendDir, 'index.html'), indexHtml);
  await writeFile(path.join(frontendDir, '.oxlintrc.json'), frontendOxlintConfig);
  await writeFile(path.join(frontendDir, 'src', 'main.tsx'), mainTsx);
  await writeFile(path.join(frontendDir, 'src', 'App.tsx'), appTsx);
  await writeFile(path.join(frontendDir, 'src', 'index.css'), indexCss);
}

async function writeBackendFiles(options: ScaffoldOptions) {
  const backendDir = path.join(options.targetDir, 'backend');

  await mkdir(path.join(backendDir, 'src', 'routers'), { recursive: true });
  await mkdir(path.join(backendDir, 'db', 'migrations'), { recursive: true });

  await writeFile(path.join(backendDir, 'package.json'), backendPackageJson(options));
  await writeFile(path.join(backendDir, 'wrangler.jsonc'), wranglerJsonc(options));
  await writeFile(path.join(backendDir, 'tsconfig.json'), backendTsconfig);
  await writeFile(path.join(backendDir, 'drizzle.config.ts'), drizzleConfig);
  await writeFile(path.join(backendDir, '.dev.vars'), devVars);
  await writeFile(path.join(backendDir, 'src', 'index.ts'), indexTs);
  await writeFile(path.join(backendDir, 'src', 'schema.ts'), schemaTs);
  await writeFile(path.join(backendDir, 'src', 'types.ts'), typesTs);
  await writeFile(path.join(backendDir, 'src', 'middleware.ts'), middlewareTs);
  await writeFile(path.join(backendDir, 'src', 'routers', 'health.ts'), healthRouterTs);
}

async function runPostInstallCommands(options: ScaffoldOptions) {
  await runCommand('bun', ['run', 'fmt'], options.targetDir);
  await runCommand('bun', ['wrangler', 'types'], path.join(options.targetDir, 'backend'));
}

async function runCommand(command: string, args: string[], cwd: string) {
  console.log(`\n> ${[command, ...args].join(' ')}`);

  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} exited with code ${code ?? 'unknown'}.`));
    });
  });
}

async function pathExists(filePath: string) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

function toPackageName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-~/@.]/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toWorkerName(packageName: string) {
  const unscopedName = packageName.includes('/')
    ? (packageName.split('/').at(-1) as string)
    : packageName;

  return unscopedName
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 63);
}

function validatePackageName(packageName: string) {
  if (!packageName) {
    throw new Error('Could not infer a valid package name.');
  }

  const validPackageName = /^(?:@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;

  if (!validPackageName.test(packageName)) {
    throw new Error(`Invalid package name: ${packageName}`);
  }
}

function printHelp() {
  console.log(`create-project

Usage:
  create-project <project-name> [options]

Options:
  --name <package-name>  Override the generated package name
  --force, -f            Overwrite a non-empty target directory
  --no-install           Skip bun install after scaffolding
  --help, -h             Show this help message
`);
}

function printNextSteps(options: ScaffoldOptions) {
  const relativeTarget = path.relative(process.cwd(), options.targetDir) || '.';
  const installSteps = options.install
    ? ''
    : `
  bun install
  bun run fmt
  (cd backend && bun wrangler types)
`;

  console.log(`
Done. Next steps:

  cd ${relativeTarget}
${installSteps}
  bun run --cwd frontend dev
  bun run dev

Before deploying:

  Fill in DATABASE_URL in backend/.dev.vars
  bun run deploy
`);
}

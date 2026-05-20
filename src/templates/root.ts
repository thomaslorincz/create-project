export interface RootTemplateOptions {
  packageName: string;
}

export function rootPackageJson({ packageName }: RootTemplateOptions) {
  return `${JSON.stringify(
    {
      name: packageName,
      private: true,
      workspaces: ['backend', 'frontend'],
      scripts: {
        build: 'bun run --cwd frontend build',
        deploy: 'bun run build && bun run --cwd backend deploy',
        dev: 'bun run --cwd backend dev',
        lint: 'oxlint',
        'lint:fix': 'oxlint --fix',
        fmt: 'oxfmt',
        'fmt:check': 'oxfmt --check',
      },
      devDependencies: {
        oxfmt: '^0.49.0',
        oxlint: '^1.64.0',
      },
    },
    null,
    2,
  )}\n`;
}

export const bunfigToml = `# bunfig.toml

[install]
# Require packages to be at least 10080 minutes old (7 days)
minimumReleaseAge = 10080

# Prevent lifecycle scripts like postinstall/preinstall/install from running automatically
ignoreScripts = true
`;

export const gitignore = `# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
pnpm-debug.log*

node_modules
.DS_Store
dist
dist-ssr
coverage
*.local
*.tsbuildinfo

# Editor directories and files
.idea
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

.env.*

# wrangler files
.wrangler
.dev.vars*
!.env.example
`;

export const cursorRules = `# General
- Do not automatically fix or focus on linting errors unless specifically asked. Focus only on functionality
- Do not build solutions when you are finished. Do not run build commands

# TypeScript
- Prefer interfaces over types unless an interface is not possible
- Avoid using ReturnType over defining standalone types for return values

# React
- Prefer export default function Component over having an export at the end of the file
- Prefer component props to be named just Props instead of ComponentNameProps for simplicity
- Use React Query when applicable for server state
- Avoid useEffect unless it is applicable and necessary
- Avoid useCallback and useMemo excessively as React Compiler applies these automatically
`;

export const oxlintConfig = `${JSON.stringify(
  {
    $schema: './node_modules/oxlint/configuration_schema.json',
  },
  null,
  2,
)}\n`;

export const oxfmtConfig = `${JSON.stringify(
  {
    $schema: './node_modules/oxfmt/configuration_schema.json',
    singleQuote: true,
    ignorePatterns: ['**/*.d.ts'],
  },
  null,
  2,
)}\n`;

export const vscodeSettings = `${JSON.stringify(
  {
    'biome.enabled': false,
    'oxc.fmt.configPath': '.oxfmtrc.json',
    'editor.defaultFormatter': 'oxc.oxc-vscode',
    'editor.formatOnSave': true,
    '[json]': {
      'editor.defaultFormatter': 'oxc.oxc-vscode',
    },
    '[javascript]': {
      'editor.defaultFormatter': 'oxc.oxc-vscode',
    },
    '[typescript]': {
      'editor.defaultFormatter': 'oxc.oxc-vscode',
    },
    '[javascriptreact]': {
      'editor.defaultFormatter': 'oxc.oxc-vscode',
    },
    '[typescriptreact]': {
      'editor.defaultFormatter': 'oxc.oxc-vscode',
    },
    '[jsonc]': {
      'editor.defaultFormatter': 'oxc.oxc-vscode',
    },
  },
  null,
  2,
)}\n`;

export const vscodeExtensions = `${JSON.stringify(
  {
    recommendations: ['oxc.oxc-vscode'],
  },
  null,
  2,
)}\n`;

export function readme({ packageName }: RootTemplateOptions) {
  return `# ${packageName}

Bun workspace with a Vite React frontend and a Cloudflare Worker backend.

## Prerequisites

- Bun
- Wrangler
- A Cloudflare account for deployment

## Development

\`\`\`sh
bun install
bun run --cwd frontend dev
bun run dev
\`\`\`

The frontend dev server proxies \`/api\` to the Worker on \`http://localhost:8787\`.

## Scripts

- \`bun run build\`: build the frontend assets.
- \`bun run deploy\`: build the frontend and deploy the Worker with Wrangler.
- \`bun run lint\`: run oxlint.
- \`bun run fmt\`: run oxfmt.

## Environment

Fill in \`DATABASE_URL\` in \`backend/.dev.vars\` for local Worker secrets.
`;
}

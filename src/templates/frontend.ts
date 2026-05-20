export interface FrontendTemplateOptions {
  packageName: string;
}

export function frontendPackageJson({ packageName }: FrontendTemplateOptions) {
  return `${JSON.stringify(
    {
      name: `${packageName}-frontend`,
      version: '0.0.0',
      private: true,
      type: 'module',
      scripts: {
        dev: 'vite',
        build: 'tsc -b && vite build',
        lint: 'oxlint',
        'lint:fix': 'oxlint --fix',
        fmt: 'oxfmt',
        'fmt:check': 'oxfmt --check',
      },
      dependencies: {
        react: '^19.2.6',
        'react-dom': '^19.2.6',
        'react-router': '^7.15.0',
      },
      devDependencies: {
        '@babel/core': '^7.29.0',
        '@rolldown/plugin-babel': '^0.2.3',
        '@tailwindcss/vite': '^4.3.0',
        '@tsconfig/node20': '^20.1.9',
        '@types/babel__core': '^7.20.5',
        '@types/node': '^24.12.4',
        '@types/react': '^19.2.14',
        '@types/react-dom': '^19.2.3',
        '@vitejs/plugin-react': '^6.0.1',
        'babel-plugin-react-compiler': '^1.0.0',
        globals: '^17.6.0',
        tailwindcss: '^4.3.0',
        typescript: '~6.0.3',
        vite: '^8.0.12',
      },
      engines: {
        node: '>=22.0.0',
        npm: '>=10.0.0',
      },
    },
    null,
    2,
  )}\n`;
}

export const viteConfig = `import { URL, fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';

import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] }), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8787',
    },
  },
});
`;

export const tsconfig = `${JSON.stringify(
  {
    files: [],
    references: [{ path: './tsconfig.app.json' }, { path: './tsconfig.node.json' }],
  },
  null,
  2,
)}\n`;

export const tsconfigApp = `${JSON.stringify(
  {
    compilerOptions: {
      tsBuildInfoFile: './node_modules/.tmp/tsconfig.app.tsbuildinfo',
      target: 'es2023',
      lib: ['ES2023', 'DOM'],
      module: 'esnext',
      types: ['vite/client'],
      skipLibCheck: true,
      moduleResolution: 'bundler',
      paths: {
        '@/*': ['./src/*'],
      },
      allowImportingTsExtensions: true,
      verbatimModuleSyntax: true,
      moduleDetection: 'force',
      noEmit: true,
      jsx: 'react-jsx',
      noUnusedLocals: true,
      noUnusedParameters: true,
      erasableSyntaxOnly: true,
      noFallthroughCasesInSwitch: true,
    },
    include: ['src'],
  },
  null,
  2,
)}\n`;

export const tsconfigNode = `${JSON.stringify(
  {
    compilerOptions: {
      tsBuildInfoFile: './node_modules/.tmp/tsconfig.node.tsbuildinfo',
      target: 'es2023',
      lib: ['ES2023'],
      module: 'esnext',
      types: ['node'],
      skipLibCheck: true,
      moduleResolution: 'bundler',
      allowImportingTsExtensions: true,
      verbatimModuleSyntax: true,
      moduleDetection: 'force',
      noEmit: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      erasableSyntaxOnly: true,
      noFallthroughCasesInSwitch: true,
    },
    include: ['vite.config.ts'],
  },
  null,
  2,
)}\n`;

export const indexHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + React + Cloudflare</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;

export const mainTsx = `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
`;

export const appTsx = `export default function App() {
  async function checkApi() {
    const response = await fetch('/api/health');
    const result = await response.json();

    alert(result.message);
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-16 text-white">
      <section className="mx-auto flex max-w-3xl flex-col gap-6">
        <p className="text-sm uppercase tracking-[0.35em] text-violet-300">
          Bun + Vite + Wrangler
        </p>
        <h1 className="text-5xl font-semibold tracking-tight">
          Your project is ready.
        </h1>
        <p className="text-lg leading-8 text-zinc-300">
          This app uses a React frontend, a Hono Cloudflare Worker backend, and
          Bun workspace scripts that build and deploy them together.
        </p>
        <button
          className="w-fit rounded-full bg-violet-400 px-5 py-3 font-medium text-zinc-950 transition hover:bg-violet-300"
          onClick={checkApi}
          type="button"
        >
          Check API
        </button>
      </section>
    </main>
  );
}
`;

export const indexCss = `@import 'tailwindcss' important;

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  min-height: 100vh;
  margin: 0;
  color: white;
  background: black;
  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    Oxygen,
    Ubuntu,
    Cantarell,
    'Fira Sans',
    'Droid Sans',
    'Helvetica Neue',
    sans-serif;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
`;

export const oxlintConfig = `${JSON.stringify(
  {
    extends: ['../.oxlintrc.json'],
  },
  null,
  2,
)}\n`;

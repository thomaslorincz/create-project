export interface BackendTemplateOptions {
  packageName: string;
  workerName: string;
}

export function backendPackageJson({ packageName }: BackendTemplateOptions) {
  return `${JSON.stringify(
    {
      name: `${packageName}-backend`,
      version: '0.0.0',
      private: true,
      type: 'module',
      scripts: {
        dev: 'wrangler dev',
        deploy: 'wrangler deploy',
        test: 'vitest',
      },
      dependencies: {
        '@hono/zod-validator': '^0.7.6',
        'drizzle-orm': '^0.45.2',
        hono: '^4.12.10',
        postgres: '^3.4.8',
        zod: '^4.3.6',
      },
      devDependencies: {
        '@types/node': '^25.5.2',
        'drizzle-kit': '^0.31.10',
        typescript: '^6.0.2',
        wrangler: '^4.80.0',
      },
    },
    null,
    2,
  )}\n`;
}

export function wranglerJsonc({ workerName }: BackendTemplateOptions) {
  return `{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "${workerName}",
  "main": "src/index.ts",
  "compatibility_date": "2026-04-04",
  "observability": {
    "enabled": true
  },
  "assets": {
    "directory": "../frontend/dist",
    "binding": "ASSETS",
    "not_found_handling": "single-page-application"
  },
  "compatibility_flags": ["nodejs_compat"],
  "vars": {
    "ENV": "production"
  }
}
`;
}

export const tsconfig = `{
  "compilerOptions": {
    "target": "es2021",
    "lib": ["es2021"],
    "jsx": "react-jsx",
    "module": "es2022",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "checkJs": false,
    "noEmit": true,
    "isolatedModules": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true,
    "types": ["./worker-configuration.d.ts", "node"],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["worker-configuration.d.ts", "src/**/*.ts"]
}
`;

export const workerConfiguration = `interface Env {
  ASSETS: {
    fetch(request: Request): Promise<Response>;
  };
  DATABASE_URL: string;
  ENV: string;
}
`;

export const drizzleConfig = `import { type Config, defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/schema.ts',
  out: './db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL as string,
  },
}) satisfies Config;
`;

export const schemaTs = `import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const projects = pgTable('projects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
`;

export const typesTs = `import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type * as schema from './schema';

export type DB = PostgresJsDatabase<typeof schema>;

interface AppVariables {
  db: DB;
}

export interface AppContext {
  Bindings: Env;
  Variables: AppVariables;
}
`;

export const middlewareTs = `import { drizzle } from 'drizzle-orm/postgres-js';
import type { Context, Next } from 'hono';
import postgres from 'postgres';
import * as schema from './schema';
import type { AppContext } from './types';

export async function dbMiddleware(c: Context<AppContext>, next: Next) {
  const client = postgres(c.env.DATABASE_URL, {
    prepare: false,
    max: 5,
    fetch_types: false,
  });

  c.set('db', drizzle(client, { schema }));

  await next();
}
`;

export const healthRouterTs = `import { Hono } from 'hono';
import type { AppContext } from '../types';

const healthRouter = new Hono<AppContext>();

healthRouter.get('/', (c) => {
  return c.json({
    ok: true,
    message: 'API is healthy',
    env: c.env.ENV,
  });
});

export default healthRouter;
`;

export const indexTs = `import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { ZodError } from 'zod';
import healthRouter from './routers/health';
import type { AppContext } from './types';

const app = new Hono<AppContext>();

app.route('/api/health', healthRouter);

app.onError((err, c) => {
  console.error(\`Error in route \${c.req.path}:\`, err);

  if (err instanceof ZodError) {
    return c.text('Invalid request body', 400);
  }
  if (err instanceof HTTPException) {
    return err.getResponse();
  }
  return c.text('Failed to process request', 500);
});

app.notFound((c) => {
  if (c.req.path.startsWith('/api')) {
    return c.text('Not Found', 404);
  }

  return c.env.ASSETS.fetch(c.req.raw);
});

export default app;
`;

export const devVarsExample = `ENV=development
DATABASE_URL=postgres://user:password@localhost:5432/app
`;

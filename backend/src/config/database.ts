import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import {env} from './env.js';


// TODO: Sau khi chạy `npx kysely-codegen`, import DB ở đây
import type { DB } from '../db/types.js';

const dialect = new PostgresDialect({
  pool: new Pool({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    max: 20,
  }),
});

export const db = new Kysely<DB>({ // Đã thay 'any' bằng 'DB'
  dialect,
});
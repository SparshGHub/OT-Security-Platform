import { Pool } from 'pg';
import { env } from '../util/env';

export const pool = new Pool({ connectionString: env.DATABASE_URL });


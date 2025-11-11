import 'dotenv/config';
import { Pool } from 'pg';

const poolActiva = new Pool({connectionString: process.env.DATABASE_URL});



export {poolActiva}
import mysql from 'mysql2/promise';
import fs from 'node:fs/promises';
import {env} from '../src/config/env.js';
// Inicialização não destrutiva. Credenciais administrativas não ficam no código.
const connection = await mysql.createConnection({host:env.DB_HOST,port:env.DB_PORT,user:env.DB_USER,password:env.DB_PASSWORD,multipleStatements:true});
try {
 const db=mysql.escapeId(env.DB_NAME);
 let schema=await fs.readFile(new URL('../database/schema.sql',import.meta.url),'utf8');
 schema=schema.replaceAll('db_ProService',db);
 await connection.query(schema);
 let seed=await fs.readFile(new URL('../database/seed.sql',import.meta.url),'utf8');
 await connection.query(seed.replaceAll('db_ProService',db));
 console.log('Banco preparado sem excluir tabelas ou registros.');
} finally {await connection.end();}

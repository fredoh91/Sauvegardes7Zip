import { describe, it, expect, afterAll } from 'vitest';
import pool from '../src/database.js';

describe('Database Connection', () => {
  it('should connect to the database and run a simple query', async () => {
    let connection;
    try {
      connection = await pool.getConnection();
      const [rows] = await connection.execute('SELECT 1 + 1 AS result');
      expect(rows[0].result).toBe(2);
    } finally {
      if (connection) connection.release();
    }
  });

  afterAll(() => {
    pool.end();
  });
});



// import { describe, it, expect } from 'vitest';
// import mysql from 'mysql2/promise';
// import dotenv from 'dotenv';

// // Charger les variables d'environnement
// dotenv.config();

// describe('Database Connection', () => {
//   it('should connect to the database and run a simple query', async () => {
//     const connection = await mysql.createConnection({
//       host: process.env.HOST,
//       user: process.env.USER,
//       password: process.env.PASSWORD,
//       database: process.env.DATABASE,
//     });

//     const [rows] = await connection.execute('SELECT 1 + 1 AS solution');
//     expect(rows[0].solution).toBe(2);

//     await connection.end();
//   });
// });
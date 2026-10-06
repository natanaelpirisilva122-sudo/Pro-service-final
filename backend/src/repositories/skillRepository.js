import { pool } from '../config/database.js';

export class SkillRepository {
  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT id, nome, categoria
       FROM habilidades
       WHERE id = ?
       LIMIT 1`,
      [id],
    );
    return rows[0] ?? null;
  }

  async listAll() {
    const [rows] = await pool.execute(
      `SELECT id, nome, categoria
       FROM habilidades
       ORDER BY categoria, nome`,
    );
    return rows;
  }
}

export const skillRepository = new SkillRepository();

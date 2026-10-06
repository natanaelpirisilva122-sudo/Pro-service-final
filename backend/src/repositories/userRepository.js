import { pool } from '../config/database.js';

export class UserRepository {
  async findByEmail(email) {
    const [rows] = await pool.execute(
      `SELECT id, nome, email, telefone, senha_hash, tipo, ativo, criado_em, atualizado_em
       FROM usuarios
       WHERE email = ?
       LIMIT 1`,
      [email],
    );
    return rows[0] ?? null;
  }

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT id, nome, email, telefone, tipo, ativo, criado_em, atualizado_em
       FROM usuarios
       WHERE id = ?
       LIMIT 1`,
      [id],
    );
    return rows[0] ?? null;
  }

  async create({ nome, email, telefone, senhaHash, tipo }, connection = pool) {
    const [result] = await connection.execute(
      `INSERT INTO usuarios (nome, email, telefone, senha_hash, tipo)
       VALUES (?, ?, ?, ?, ?)`,
      [nome, email, telefone ?? null, senhaHash, tipo],
    );

    return this.findById(result.insertId);
  }
}

export const userRepository = new UserRepository();

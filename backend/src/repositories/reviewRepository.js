import { pool } from '../config/database.js';

export class ReviewRepository {
  async findByServiceId(serviceId) {
    const [rows] = await pool.execute(
      `SELECT
        a.id,
        a.servico_id AS servicoId,
        a.cliente_id AS clienteId,
        u.nome AS clienteNome,
        a.nota,
        a.comentario,
        a.criado_em AS criadoEm
       FROM avaliacoes a
       INNER JOIN usuarios u ON u.id = a.cliente_id
       WHERE a.servico_id = ?
       LIMIT 1`,
      [serviceId],
    );
    return rows[0] ?? null;
  }

  async create({ serviceId, clientId, score, comment }) {
    const [result] = await pool.execute(
      `INSERT INTO avaliacoes (servico_id, cliente_id, nota, comentario)
       VALUES (?, ?, ?, ?)`,
      [serviceId, clientId, score, comment ?? null],
    );

    const [rows] = await pool.execute(
      `SELECT
         a.id,
         a.servico_id AS servicoId,
         a.cliente_id AS clienteId,
         u.nome AS clienteNome,
         a.nota,
         a.comentario,
         a.criado_em AS criadoEm
       FROM avaliacoes a
       INNER JOIN usuarios u ON u.id = a.cliente_id
       WHERE a.id = ?
       LIMIT 1`,
      [result.insertId],
    );

    return rows[0];
  }

  async listByProviderId(providerId) {
    const [rows] = await pool.execute(
      `SELECT
         a.id,
         a.servico_id AS servicoId,
         a.nota,
         a.comentario,
         a.criado_em AS criadoEm,
         u.nome AS clienteNome
       FROM avaliacoes a
       INNER JOIN servicos s ON s.id = a.servico_id
       INNER JOIN usuarios u ON u.id = a.cliente_id
       WHERE s.prestador_id = ?
       ORDER BY a.criado_em DESC`,
      [providerId],
    );
    return rows;
  }
}

export const reviewRepository = new ReviewRepository();

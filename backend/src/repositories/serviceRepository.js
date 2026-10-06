import { pool } from '../config/database.js';

const baseSelect = `
  SELECT
    s.id,
    s.cliente_id AS clienteId,
    uc.nome AS clienteNome,
    s.prestador_id AS prestadorId,
    up.nome AS prestadorNome,
    s.titulo,
    s.descricao,
    s.categoria,
    s.endereco,
    s.cidade,
    s.uf,
    s.valor_combinado AS valorCombinado,
    s.status,
    s.criado_em AS criadoEm,
    s.atualizado_em AS atualizadoEm,
    a.id AS avaliacaoId, a.nota AS notaAvaliacao
  FROM servicos s
  INNER JOIN usuarios uc ON uc.id = s.cliente_id
  INNER JOIN usuarios up ON up.id = s.prestador_id
  LEFT JOIN avaliacoes a ON a.servico_id = s.id
`;

export class ServiceRepository {
  async create(data) {
    const [result] = await pool.execute(
      `INSERT INTO servicos
        (cliente_id, prestador_id, titulo, descricao, categoria, endereco, cidade, uf, valor_combinado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.clienteId,
        data.prestadorId,
        data.titulo,
        data.descricao,
        data.categoria,
        data.endereco,
        data.cidade,
        data.uf,
        data.valorCombinado ?? null,
      ],
    );

    return this.findById(result.insertId);
  }

  async findById(id) {
    const [rows] = await pool.query(
      `${baseSelect}
       WHERE s.id = ?
       LIMIT 1`,
      [id],
    );
    return rows[0] ?? null;
  }

  async updateStatus(id, status, previousStatus) {
    const [result] = await pool.execute(
      `UPDATE servicos
       SET status = ?
       WHERE id = ? AND status = ?`,
      [status, id, previousStatus],
    );
    if (result.affectedRows !== 1) return null;
    return this.findById(id);
  }

  async listForUser(user, filters, { limit, offset }) {
    const conditions = [];
    const params = [];

    if (user.tipo === 'CLIENTE') {
      conditions.push('s.cliente_id = ?');
      params.push(user.id);
    } else {
      conditions.push('s.prestador_id = ?');
      params.push(user.id);
    }

    if (filters.status) {
      conditions.push('s.status = ?');
      params.push(filters.status);
    }

    const where = conditions.join(' AND ');

    const [rows] = await pool.query(
      `${baseSelect}
       WHERE ${where}
       ORDER BY s.criado_em DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );

    const [countRows] = await pool.execute(
      `SELECT COUNT(*) AS total
       FROM servicos s
       WHERE ${where}`,
      params,
    );

    return {
      items: rows,
      total: Number(countRows[0]?.total ?? 0),
    };
  }

  async listOpenForProvider(providerId, { limit, offset }) {
    const [rows] = await pool.query(
      `${baseSelect}
       WHERE s.prestador_id = ? AND s.status = 'PENDENTE'
       ORDER BY s.criado_em DESC
       LIMIT ? OFFSET ?`,
      [providerId, limit, offset],
    );

    const [countRows] = await pool.execute(
      `SELECT COUNT(*) AS total
       FROM servicos
       WHERE prestador_id = ? AND status = 'PENDENTE'`,
      [providerId],
    );

    return {
      items: rows,
      total: Number(countRows[0]?.total ?? 0),
    };
  }
}

export const serviceRepository = new ServiceRepository();

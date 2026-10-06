import { pool } from '../config/database.js';

export class ProviderRepository {
  async createProfile(userId, connection = pool) {
    await connection.execute(
      `INSERT INTO perfis_prestadores (usuario_id)
       VALUES (?)
       ON DUPLICATE KEY UPDATE usuario_id = VALUES(usuario_id)`,
      [userId],
    );
  }

  async findByUserId(userId) {
    const [rows] = await pool.query(
      `SELECT
          p.id,
          p.usuario_id AS usuarioId,
          u.nome,
          u.email,
          u.telefone,
          p.descricao,
          p.cidade,
          p.uf,
          p.preco_hora AS precoHora,
          p.anos_experiencia AS anosExperiencia,
          COALESCE(ROUND(AVG(a.nota), 2), 0) AS mediaAvaliacoes,
          COUNT(DISTINCT a.id) AS totalAvaliacoes
       FROM perfis_prestadores p
       INNER JOIN usuarios u ON u.id = p.usuario_id
       LEFT JOIN servicos s ON s.prestador_id = u.id
       LEFT JOIN avaliacoes a ON a.servico_id = s.id
       WHERE p.usuario_id = ? AND u.ativo = 1
       GROUP BY p.id, u.id
       LIMIT 1`,
      [userId],
    );

    if (!rows[0]) return null;

    const profile = rows[0];
    profile.habilidades = await this.listSkillsByUserId(userId);
    return profile;
  }

  async findPublicById(providerUserId) {
    return this.findByUserId(providerUserId);
  }

  async update(userId, fields) {
    const map = {
      descricao: 'descricao',
      cidade: 'cidade',
      uf: 'uf',
      precoHora: 'preco_hora',
      anosExperiencia: 'anos_experiencia',
    };

    const entries = Object.entries(fields).filter(
      ([key, value]) => map[key] && value !== undefined,
    );

    if (entries.length === 0) {
      return this.findByUserId(userId);
    }

    const setSql = entries.map(([key]) => `${map[key]} = ?`).join(', ');
    const values = entries.map(([, value]) => value ?? null);

    await pool.execute(
      `UPDATE perfis_prestadores
       SET ${setSql}
       WHERE usuario_id = ?`,
      [...values, userId],
    );

    return this.findByUserId(userId);
  }

  async listSkillsByUserId(userId) {
    const [rows] = await pool.query(
      `SELECT h.id, h.nome, h.categoria
       FROM habilidades h
       INNER JOIN prestador_habilidades ph ON ph.habilidade_id = h.id
       INNER JOIN perfis_prestadores p ON p.id = ph.perfil_prestador_id
       WHERE p.usuario_id = ?
       ORDER BY h.nome`,
      [userId],
    );
    return rows;
  }

  async countSkillsByUserId(userId) {
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM prestador_habilidades ph
       INNER JOIN perfis_prestadores p ON p.id = ph.perfil_prestador_id
       WHERE p.usuario_id = ?`,
      [userId],
    );
    return Number(rows[0]?.total ?? 0);
  }

  async addSkill(userId, skillId) {
    const [profiles] = await pool.execute(
      `SELECT id FROM perfis_prestadores WHERE usuario_id = ? LIMIT 1`,
      [userId],
    );

    if (!profiles[0]) return false;

    await pool.execute(
      `INSERT IGNORE INTO prestador_habilidades (perfil_prestador_id, habilidade_id)
       VALUES (?, ?)`,
      [profiles[0].id, skillId],
    );

    return true;
  }

  async removeSkill(userId, skillId) {
    const [result] = await pool.execute(
      `DELETE ph
       FROM prestador_habilidades ph
       INNER JOIN perfis_prestadores p ON p.id = ph.perfil_prestador_id
       WHERE p.usuario_id = ? AND ph.habilidade_id = ?`,
      [userId, skillId],
    );
    return result.affectedRows > 0;
  }

  async search(filters, { limit, offset }) {
    const conditions = [
      'u.ativo = 1',
      `EXISTS (
        SELECT 1
        FROM prestador_habilidades ph0
        WHERE ph0.perfil_prestador_id = p.id
      )`,
    ];
    const params = [];

    if (filters.q) {
  conditions.push(`(
    u.nome LIKE ?
    OR p.descricao LIKE ?
    OR EXISTS (
      SELECT 1
      FROM prestador_habilidades phq
      INNER JOIN habilidades hq ON hq.id = phq.habilidade_id
      WHERE phq.perfil_prestador_id = p.id
        AND (hq.nome LIKE ? OR hq.categoria LIKE ?)
    )
  )`);

  const term = `%${filters.q}%`;
  params.push(term, term, term, term);
}
    if (filters.habilidade) {
      conditions.push(`EXISTS (
        SELECT 1
        FROM prestador_habilidades ph
        INNER JOIN habilidades h ON h.id = ph.habilidade_id
        WHERE ph.perfil_prestador_id = p.id
          AND (h.nome LIKE ? OR h.categoria LIKE ?)
      )`);
      const term = `%${filters.habilidade}%`;
      params.push(term, term);
    }

    if (filters.cidade) {
      conditions.push('p.cidade LIKE ?');
      params.push(`%${filters.cidade}%`);
    }

    if (filters.uf) {
      conditions.push('p.uf = ?');
      params.push(filters.uf);
    }

    if (filters.precoMax !== undefined) {
      conditions.push('(p.preco_hora IS NULL OR p.preco_hora <= ?)');
      params.push(filters.precoMax);
    }

    const where = conditions.join(' AND ');

    const [rows] = await pool.query(
      `SELECT
          p.id,
          p.usuario_id AS usuarioId,
          u.nome,
          p.descricao,
          p.cidade,
          p.uf,
          p.preco_hora AS precoHora,
          p.anos_experiencia AS anosExperiencia,
          COALESCE(ROUND(AVG(a.nota), 2), 0) AS mediaAvaliacoes,
          COUNT(DISTINCT a.id) AS totalAvaliacoes
       FROM perfis_prestadores p
       INNER JOIN usuarios u ON u.id = p.usuario_id
       LEFT JOIN servicos s ON s.prestador_id = u.id
       LEFT JOIN avaliacoes a ON a.servico_id = s.id
       WHERE ${where}
       GROUP BY p.id, u.id
       ORDER BY mediaAvaliacoes DESC, totalAvaliacoes DESC, u.nome ASC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );

    const [countRows] = await pool.execute(
      `SELECT COUNT(*) AS total
       FROM perfis_prestadores p
       INNER JOIN usuarios u ON u.id = p.usuario_id
       WHERE ${where}`,
      params,
    );

    for (const row of rows) {
      row.habilidades = await this.listSkillsByUserId(row.usuarioId);
    }

    return {
      items: rows,
      total: Number(countRows[0]?.total ?? 0),
    };
  }
}

export const providerRepository = new ProviderRepository();

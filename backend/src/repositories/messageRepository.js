import { pool } from '../config/database.js';

export class MessageRepository {
  async ensureConversation(clienteId, prestadorId) {
    await pool.execute(
      `INSERT INTO conversas (cliente_id, prestador_id) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE atualizado_em = atualizado_em`,
      [clienteId, prestadorId],
    );
    const [rows] = await pool.execute(
      'SELECT id, cliente_id AS clienteId, prestador_id AS prestadorId FROM conversas WHERE cliente_id=? AND prestador_id=? LIMIT 1',
      [clienteId, prestadorId],
    );
    return rows[0];
  }

  async listForUser(userId) {
    const [rows] = await pool.execute(
      `SELECT c.id, c.cliente_id AS clienteId, c.prestador_id AS prestadorId,
              uc.nome AS clienteNome, up.nome AS prestadorNome, c.atualizado_em AS atualizadoEm,
              (SELECT m.mensagem FROM mensagens m WHERE m.conversa_id=c.id ORDER BY m.id DESC LIMIT 1) AS ultimaMensagem,
              (SELECT m.criado_em FROM mensagens m WHERE m.conversa_id=c.id ORDER BY m.id DESC LIMIT 1) AS ultimaMensagemEm,
              (SELECT COUNT(*) FROM mensagens m WHERE m.conversa_id=c.id AND m.remetente_id<>? AND m.lida=0) AS naoLidas
       FROM conversas c
       JOIN usuarios uc ON uc.id=c.cliente_id
       JOIN usuarios up ON up.id=c.prestador_id
       WHERE c.cliente_id=? OR c.prestador_id=?
       ORDER BY COALESCE(ultimaMensagemEm,c.atualizado_em) DESC`,
      [userId, userId, userId],
    );
    return rows;
  }

  async findConversation(id) {
    const [rows] = await pool.execute(
      `SELECT c.id,c.cliente_id AS clienteId,c.prestador_id AS prestadorId,
              uc.nome AS clienteNome,up.nome AS prestadorNome
       FROM conversas c JOIN usuarios uc ON uc.id=c.cliente_id JOIN usuarios up ON up.id=c.prestador_id
       WHERE c.id=? LIMIT 1`, [id]);
    return rows[0] || null;
  }

  async listMessages(conversationId) {
    const [rows] = await pool.execute(
      `SELECT m.id,m.conversa_id AS conversaId,m.remetente_id AS remetenteId,u.nome AS remetenteNome,
              m.mensagem,m.lida,m.criado_em AS criadoEm
       FROM mensagens m JOIN usuarios u ON u.id=m.remetente_id
       WHERE m.conversa_id=? ORDER BY m.id ASC`, [conversationId]);
    return rows;
  }

  async markRead(conversationId, userId) {
    await pool.execute('UPDATE mensagens SET lida=1 WHERE conversa_id=? AND remetente_id<>?', [conversationId,userId]);
  }

  async send(conversationId, senderId, message) {
    const [result] = await pool.execute('INSERT INTO mensagens (conversa_id,remetente_id,mensagem) VALUES (?,?,?)',[conversationId,senderId,message]);
    await pool.execute('UPDATE conversas SET atualizado_em=CURRENT_TIMESTAMP WHERE id=?',[conversationId]);
    return result.insertId;
  }

  async isProvider(userId) {
    const [rows]=await pool.execute("SELECT id FROM usuarios WHERE id=? AND tipo='PRESTADOR' AND ativo=1 LIMIT 1",[userId]);
    return Boolean(rows[0]);
  }
}
export const messageRepository=new MessageRepository();

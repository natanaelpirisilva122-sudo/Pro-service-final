import bcrypt from 'bcryptjs';
import { pool } from '../config/database.js';
import { env } from '../config/env.js';
import { userRepository } from '../repositories/userRepository.js';
import { providerRepository } from '../repositories/providerRepository.js';
import { AppError } from '../utils/AppError.js';
import { signAccessToken } from '../utils/jwt.js';

export class AuthService {
  async register(data) {
    const existing = await userRepository.findByEmail(data.email);

    if (existing) {
      throw new AppError(
        'Já existe uma conta cadastrada com este e-mail.',
        409,
        'EMAIL_ALREADY_EXISTS',
      );
    }

    const senhaHash = await bcrypt.hash(data.senha, env.BCRYPT_ROUNDS);
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [result] = await connection.execute(
        `INSERT INTO usuarios (nome, email, telefone, senha_hash, tipo)
         VALUES (?, ?, ?, ?, ?)`,
        [data.nome, data.email, data.telefone ?? null, senhaHash, data.tipo],
      );

      if (data.tipo === 'PRESTADOR') {
        await providerRepository.createProfile(result.insertId, connection);
      }

      await connection.commit();

      const user = await userRepository.findById(result.insertId);
      return {
        usuario: user,
        token: signAccessToken(user),
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async login({ email, senha }) {
    const user = await userRepository.findByEmail(email);

    if (!user || !user.ativo) {
      throw new AppError(
        'E-mail ou senha incorretos.',
        401,
        'INVALID_CREDENTIALS',
      );
    }

    const passwordMatches = await bcrypt.compare(senha, user.senha_hash);

    if (!passwordMatches) {
      throw new AppError(
        'E-mail ou senha incorretos.',
        401,
        'INVALID_CREDENTIALS',
      );
    }

    const safeUser = {
      id: user.id,
      nome: user.nome,
      email: user.email,
      telefone: user.telefone,
      tipo: user.tipo,
    };

    return {
      usuario: safeUser,
      token: signAccessToken(safeUser),
    };
  }

  async me(userId) {
    const user = await userRepository.findById(userId);

    if (!user || !user.ativo) {
      throw new AppError('Usuário não encontrado.', 404, 'USER_NOT_FOUND');
    }

    return user;
  }
}

export const authService = new AuthService();

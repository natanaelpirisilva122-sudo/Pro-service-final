import { authService } from '../services/authService.js';

export class AuthController {
  async register(req, res) {
    const result = await authService.register(req.validated.body);
    res.status(201).json({
      mensagem: 'Usuário cadastrado com sucesso.',
      ...result,
    });
  }

  async login(req, res) {
    const result = await authService.login(req.validated.body);
    res.status(200).json({
      mensagem: 'Login realizado com sucesso.',
      ...result,
    });
  }

  async me(req, res) {
    const user = await authService.me(req.user.id);
    res.status(200).json({ usuario: user });
  }
}

export const authController = new AuthController();

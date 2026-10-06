import { providerService } from '../services/providerService.js';

export class ProviderController {
  async me(req, res) {
    const profile = await providerService.getOwnProfile(req.user.id);
    res.status(200).json({ prestador: profile });
  }

  async getById(req, res) {
    const profile = await providerService.getPublicProfile(
      Number(req.params.id),
    );
    res.status(200).json({ prestador: profile });
  }

  async updateMe(req, res) {
    const profile = await providerService.updateProfile(
      req.user.id,
      req.validated.body,
    );
    res.status(200).json({
      mensagem: 'Perfil atualizado com sucesso.',
      prestador: profile,
    });
  }

  async addSkill(req, res) {
    const profile = await providerService.addSkill(
      req.user.id,
      req.validated.body.habilidadeId,
    );
    res.status(200).json({
      mensagem: 'Habilidade adicionada com sucesso.',
      prestador: profile,
    });
  }

  async removeSkill(req, res) {
    const profile = await providerService.removeSkill(
      req.user.id,
      Number(req.params.id),
    );
    res.status(200).json({
      mensagem: 'Habilidade removida com sucesso.',
      prestador: profile,
    });
  }

  async search(req, res) {
    const result = await providerService.search(req.validated.query);
    res.status(200).json(result);
  }
}

export const providerController = new ProviderController();

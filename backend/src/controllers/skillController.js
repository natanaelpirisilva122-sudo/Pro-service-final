import { skillRepository } from '../repositories/skillRepository.js';

export class SkillController {
  async list(_req, res) {
    const skills = await skillRepository.listAll();
    res.status(200).json({ habilidades: skills });
  }
}

export const skillController = new SkillController();

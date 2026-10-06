import { providerRepository } from '../repositories/providerRepository.js';
import { skillRepository } from '../repositories/skillRepository.js';
import { reviewRepository } from '../repositories/reviewRepository.js';
import { AppError } from '../utils/AppError.js';
import { parsePagination } from '../utils/pagination.js';

export class ProviderService {
  async getOwnProfile(userId) {
    const profile = await providerRepository.findByUserId(userId);
    if (!profile) {
      throw new AppError(
        'Perfil de prestador não encontrado.',
        404,
        'PROVIDER_NOT_FOUND',
      );
    }
    return profile;
  }

  async getPublicProfile(providerUserId) {
    const profile = await providerRepository.findPublicById(providerUserId);
    if (!profile) {
      throw new AppError(
        'Prestador não encontrado.',
        404,
        'PROVIDER_NOT_FOUND',
      );
    }

    profile.avaliacoes = await reviewRepository.listByProviderId(providerUserId);
    return profile;
  }

  async updateProfile(userId, data) {
    await this.getOwnProfile(userId);
    return providerRepository.update(userId, data);
  }

  async addSkill(userId, skillId) {
    await this.getOwnProfile(userId);

    const skill = await skillRepository.findById(skillId);
    if (!skill) {
      throw new AppError(
        'Habilidade não encontrada.',
        404,
        'SKILL_NOT_FOUND',
      );
    }

    await providerRepository.addSkill(userId, skillId);
    return providerRepository.findByUserId(userId);
  }

  async removeSkill(userId, skillId) {
    await this.getOwnProfile(userId);

    const removed = await providerRepository.removeSkill(userId, skillId);
    if (!removed) {
      throw new AppError(
        'A habilidade informada não estava vinculada ao prestador.',
        404,
        'PROVIDER_SKILL_NOT_FOUND',
      );
    }

    return providerRepository.findByUserId(userId);
  }

  async search(query) {
    const pagination = parsePagination(query);
    const result = await providerRepository.search(query, pagination);

    return {
      dados: result.items,
      paginacao: {
        pagina: pagination.page,
        limite: pagination.limit,
        total: result.total,
        paginas: Math.ceil(result.total / pagination.limit),
      },
    };
  }
}

export const providerService = new ProviderService();

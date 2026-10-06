import { reviewRepository } from '../repositories/reviewRepository.js';
import { serviceRepository } from '../repositories/serviceRepository.js';
import { AppError } from '../utils/AppError.js';
import { SERVICE_STATUS } from '../utils/serviceStatus.js';

export class ReviewService {
  async create(clientId, data) {
    const service = await serviceRepository.findById(data.servicoId);

    if (!service) {
      throw new AppError('Serviço não encontrado.', 404, 'SERVICE_NOT_FOUND');
    }

    if (service.clienteId !== clientId) {
      throw new AppError(
        'Somente o cliente responsável pelo serviço pode avaliá-lo.',
        403,
        'REVIEW_NOT_ALLOWED',
      );
    }

    if (service.status !== SERVICE_STATUS.CONCLUIDO) {
      throw new AppError(
        'A avaliação só pode ser registrada depois que o serviço estiver concluído.',
        409,
        'SERVICE_NOT_COMPLETED',
      );
    }

    const existing = await reviewRepository.findByServiceId(data.servicoId);
    if (existing) {
      throw new AppError(
        'Este serviço já possui uma avaliação.',
        409,
        'SERVICE_ALREADY_REVIEWED',
      );
    }

    return reviewRepository.create({
      serviceId: data.servicoId,
      clientId,
      score: data.nota,
      comment: data.comentario,
    });
  }

  async listByProvider(providerId) {
    return reviewRepository.listByProviderId(providerId);
  }
}

export const reviewService = new ReviewService();

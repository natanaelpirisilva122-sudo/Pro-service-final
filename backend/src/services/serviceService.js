import { userRepository } from '../repositories/userRepository.js';
import { providerRepository } from '../repositories/providerRepository.js';
import { serviceRepository } from '../repositories/serviceRepository.js';
import { AppError } from '../utils/AppError.js';
import {
  SERVICE_STATUS,
  canTransitionServiceStatus,
} from '../utils/serviceStatus.js';
import { parsePagination } from '../utils/pagination.js';

export class ServiceService {
  async create(clientId, data) {
    if (clientId === data.prestadorId) {
      throw new AppError(
        'Cliente e prestador precisam ser usuários diferentes.',
        400,
        'INVALID_SERVICE_PARTIES',
      );
    }

    const provider = await userRepository.findById(data.prestadorId);

    if (!provider || !provider.ativo || provider.tipo !== 'PRESTADOR') {
      throw new AppError(
        'O prestador informado não existe ou está indisponível.',
        404,
        'PROVIDER_NOT_FOUND',
      );
    }

    const skills = await providerRepository.countSkillsByUserId(data.prestadorId);
    if (skills < 1) {
      throw new AppError(
        'Este prestador ainda não possui habilidades cadastradas.',
        409,
        'PROVIDER_WITHOUT_SKILLS',
      );
    }

    return serviceRepository.create({
      clienteId: clientId,
      ...data,
    });
  }

  async getById(requester, serviceId) {
    const service = await serviceRepository.findById(serviceId);

    if (!service) {
      throw new AppError('Serviço não encontrado.', 404, 'SERVICE_NOT_FOUND');
    }

    const belongsToUser =
      service.clienteId === requester.id ||
      service.prestadorId === requester.id;

    if (!belongsToUser) {
      throw new AppError(
        'Você não possui acesso a este serviço.',
        403,
        'SERVICE_ACCESS_DENIED',
      );
    }

    return service;
  }

  async listForUser(user, query) {
    const pagination = parsePagination(query);
    const result = await serviceRepository.listForUser(user, query, pagination);

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

  async listOpportunities(providerId, query) {
    const pagination = parsePagination(query);
    const result = await serviceRepository.listOpenForProvider(
      providerId,
      pagination,
    );

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

  async updateStatus(user, serviceId, nextStatus) {
    const service = await serviceRepository.findById(serviceId);

    if (!service) {
      throw new AppError('Serviço não encontrado.', 404, 'SERVICE_NOT_FOUND');
    }

    const canManage =
      service.clienteId === user.id || service.prestadorId === user.id;

    if (!canManage) {
      throw new AppError(
        'Você não possui permissão para alterar este serviço.',
        403,
        'SERVICE_ACCESS_DENIED',
      );
    }

    if (!canTransitionServiceStatus(service.status, nextStatus)) {
      throw new AppError(
        `Não é permitido alterar o serviço de ${service.status} para ${nextStatus}.`,
        409,
        'INVALID_STATUS_TRANSITION',
      );
    }

    if (
      nextStatus === SERVICE_STATUS.ACEITO &&
      (user.tipo !== 'PRESTADOR' || service.prestadorId !== user.id)
    ) {
      throw new AppError(
        'Somente o prestador responsável pode aceitar o serviço.',
        403,
        'ONLY_PROVIDER_CAN_ACCEPT',
      );
    }

    if (
      nextStatus === SERVICE_STATUS.CONCLUIDO &&
      (user.tipo !== 'PRESTADOR' || service.prestadorId !== user.id)
    ) {
      throw new AppError(
        'Somente o prestador responsável pode concluir o serviço.',
        403,
        'ONLY_PROVIDER_CAN_COMPLETE',
      );
    }

    const updated = await serviceRepository.updateStatus(serviceId, nextStatus, service.status);
    if (!updated) throw new AppError('O serviço foi alterado por outra sessão. Atualize a lista.', 409, 'CONCURRENT_STATUS_CHANGE');
    return updated;
  }
}

export const serviceService = new ServiceService();

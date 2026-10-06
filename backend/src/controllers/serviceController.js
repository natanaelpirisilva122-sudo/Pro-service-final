import { serviceService } from '../services/serviceService.js';

export class ServiceController {
  async create(req, res) {
    const service = await serviceService.create(
      req.user.id,
      req.validated.body,
    );
    res.status(201).json({
      mensagem: 'Solicitação de serviço criada com sucesso.',
      servico: service,
    });
  }

  async getById(req, res) {
    const service = await serviceService.getById(
      req.user,
      Number(req.params.id),
    );
    res.status(200).json({ servico: service });
  }

  async listMine(req, res) {
    const result = await serviceService.listForUser(
      req.user,
      req.validated.query,
    );
    res.status(200).json(result);
  }

  async opportunities(req, res) {
    const result = await serviceService.listOpportunities(
      req.user.id,
      req.validated.query,
    );
    res.status(200).json(result);
  }

  async updateStatus(req, res) {
    const service = await serviceService.updateStatus(
      req.user,
      req.validated.params.id,
      req.validated.body.status,
    );
    res.status(200).json({
      mensagem: 'Status atualizado com sucesso.',
      servico: service,
    });
  }
}

export const serviceController = new ServiceController();

import { reviewService } from '../services/reviewService.js';

export class ReviewController {
  async create(req, res) {
    const review = await reviewService.create(
      req.user.id,
      req.validated.body,
    );
    res.status(201).json({
      mensagem: 'Avaliação registrada com sucesso.',
      avaliacao: review,
    });
  }

  async listByProvider(req, res) {
    const reviews = await reviewService.listByProvider(
      Number(req.params.id),
    );
    res.status(200).json({ avaliacoes: reviews });
  }
}

export const reviewController = new ReviewController();

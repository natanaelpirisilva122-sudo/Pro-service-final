import { Router } from 'express';
import { authRoutes } from './authRoutes.js';
import { providerRoutes } from './providerRoutes.js';
import { serviceRoutes } from './serviceRoutes.js';
import { reviewRoutes } from './reviewRoutes.js';
import { skillRoutes } from './skillRoutes.js';
import { messageRoutes } from './messageRoutes.js';

export const apiRoutes = Router();

apiRoutes.use('/auth', authRoutes);
apiRoutes.use('/prestadores', providerRoutes);
apiRoutes.use('/servicos', serviceRoutes);
apiRoutes.use('/avaliacoes', reviewRoutes);
apiRoutes.use('/habilidades', skillRoutes);
apiRoutes.use('/mensagens', messageRoutes);

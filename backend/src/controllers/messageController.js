import { messageRepository } from '../repositories/messageRepository.js';
import { AppError } from '../utils/AppError.js';

function participant(c,userId){return c && (Number(c.clienteId)===Number(userId)||Number(c.prestadorId)===Number(userId));}
export class MessageController {
  async start(req,res){
    if(req.user.tipo!=='CLIENTE') throw new AppError('Somente clientes iniciam novas conversas.',403,'CHAT_ROLE');
    const prestadorId=Number(req.body?.prestadorId);
    if(!Number.isInteger(prestadorId)||prestadorId<=0) throw new AppError('Prestador inválido.',400,'CHAT_PROVIDER');
    if(!(await messageRepository.isProvider(prestadorId))) throw new AppError('Prestador não encontrado.',404,'CHAT_PROVIDER_NOT_FOUND');
    const conversa=await messageRepository.ensureConversation(req.user.id,prestadorId);
    res.status(200).json({conversa});
  }
  async list(req,res){res.json({dados:await messageRepository.listForUser(req.user.id)});}
  async get(req,res){
    const id=Number(req.params.id), conversa=await messageRepository.findConversation(id);
    if(!participant(conversa,req.user.id)) throw new AppError('Conversa não encontrada.',404,'CHAT_NOT_FOUND');
    await messageRepository.markRead(id,req.user.id);
    res.json({conversa,mensagens:await messageRepository.listMessages(id)});
  }
  async send(req,res){
    const id=Number(req.params.id), conversa=await messageRepository.findConversation(id);
    if(!participant(conversa,req.user.id)) throw new AppError('Conversa não encontrada.',404,'CHAT_NOT_FOUND');
    const mensagem=String(req.body?.mensagem||'').trim();
    if(!mensagem||mensagem.length>2000) throw new AppError('A mensagem deve ter entre 1 e 2000 caracteres.',400,'CHAT_MESSAGE');
    const messageId=await messageRepository.send(id,req.user.id,mensagem);
    res.status(201).json({mensagem:'Mensagem enviada.',id:messageId});
  }
}
export const messageController=new MessageController();

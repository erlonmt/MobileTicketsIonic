import { Request, Response } from 'express';
import { buscarProximaSenha } from '../app/services/senhas'; // Corrigido o caminho do serviço
import { db } from '../../backend/database/connections'; // Corrigido o caminho da conexão

export async function chamarSenha(req: Request, res: Response) {
  try {
    const senha = await buscarProximaSenha();

    if (!senha) {
      return res.status(404).json({ message: 'Nenhuma senha disponível' });
    }

    await db.query(
      'UPDATE senha SET status = "chamada" WHERE id_senha = ?',
      [senha.id_senha]
    );

    await db.query(
      'INSERT INTO painel_senhas (id_senha, data_hora_chamada) VALUES (?, NOW())',
      [senha.id_senha]
    );

    res.json(senha);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao chamar senha', error: error?.message || String(error) });
  }
}
import { Request, Response } from 'express';
import { db } from '../../backend/database/connections';

export async function chamarSenha(req: Request, res: Response) {
  try {
    // Busca a próxima senha disponível (status = 'emitida'), priorizando tipo SP > SE > SG
    const [rows]: any = await db.query(`
      SELECT * FROM senha
      WHERE status = 'emitida'
      ORDER BY 
        CASE 
          WHEN tipo = 'SP' THEN 1
          WHEN tipo = 'SE' THEN 2
          WHEN tipo = 'SG' THEN 3
        END,
        id_senha ASC
      LIMIT 1
    `);

    const senha = rows[0];

    if (!senha) {
      return res.status(404).json({ message: 'Nenhuma senha disponível' });
    }

    // Atualiza status da senha para "chamada"
    await db.query(
      'UPDATE senha SET status = "chamada" WHERE id_senha = ?',
      [senha.id_senha]
    );

    // Registra chamada no painel
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
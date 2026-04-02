import { Router } from 'express';
import { db } from '../database/connections';

const router = Router();


// 🚀 GERAR SENHA
router.post('/gerar-senha', async (req, res) => {
  try {
    const { tipo, id_cliente } = req.body;

    const [result]: any = await db.query(`
      INSERT INTO senha 
      (codigo_senha, tipo, data_emissao, hora_emissao, status, sequencial_dia, id_cliente)
      VALUES (?, ?, CURDATE(), CURTIME(), 'emitida', 1, ?)
    `, [
      `${Date.now()}-${tipo}`,
      tipo,
      id_cliente
    ]);

    res.json({ message: 'Senha criada', id: result.insertId });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao gerar senha' });
  }
});


// 📢 CHAMAR SENHA
router.get('/chamar-senha', async (req, res) => {
  try {
    const [rows]: any = await db.query(`
      SELECT * FROM senha
      WHERE status = 'emitida'
      ORDER BY 
        CASE 
          WHEN tipo = 'SP' THEN 1
          WHEN tipo = 'SE' THEN 2
          WHEN tipo = 'SG' THEN 3
        END
      LIMIT 1
    `);

    const senha = rows[0];

    if (!senha) {
      return res.json({ message: 'Nenhuma senha disponível' });
    }

    // atualizar status
    await db.query(
      'UPDATE senha SET status = "chamada" WHERE id_senha = ?',
      [senha.id_senha]
    );

    // registrar no painel
    await db.query(
      'INSERT INTO painel_senhas (id_senha, data_hora_chamada) VALUES (?, NOW())',
      [senha.id_senha]
    );

    res.json(senha);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao chamar senha' });
  }
});


// 📺 PAINEL
router.get('/painel', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.codigo_senha, p.data_hora_chamada
      FROM painel_senhas p
      JOIN senha s ON s.id_senha = p.id_senha
      ORDER BY p.data_hora_chamada DESC
      LIMIT 5
    `);

    res.json(rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro no painel' });
  }
});

export default router;
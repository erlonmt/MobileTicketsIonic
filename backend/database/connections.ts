import * as mysql from 'mysql2/promise';

export const db = mysql.createPool({
  host: 'localhost',
  user: 'app',        // ou root se não criou usuário
  password: '1234',   // sua senha
  database: 'controle_atendimento'
});
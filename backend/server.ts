import express from 'express';
import senhaRoutes from './routes/senhaRoutes';

const app = express();

app.use(express.json());
app.use(senhaRoutes);

app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});
import path from 'path';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { loggerService } from './services/logger.service.js';
import { toyService } from './services/toy.service.js';

const app = express();

const corsOptions = {
  origin: [
    'http://127.0.0.1:8080',
    'http://localhost:8080',

    'http://localhost:5173',
    'http://127.0.0.1:5173',

    'http://localhost:5174',
    'http://127.0.0.1:5174',
  ],
  credentials: true,
};

// App Configuration
app.use(express.static('public'));
app.use(cookieParser()); // for res.cookies
app.use(express.json()); // for req.body
app.use(cors(corsOptions));

// **************** Toys API ****************:
// GET toys
app.get('/api/toy', async (req, res) => {
  try {
    const { filterBy = {}, sortBy = {}, pageIdx } = req.query;
    const toys = await toyService.query(filterBy, sortBy, pageIdx);
    res.send(toys);
  } catch (err) {
    loggerService.error('Cannot load toys', err);
    res.status(400).send('Cannot load toys');
  }
});

app.get('/api/toy/:toyId', async (req, res) => {
  try {
    const { toyId } = req.params;
    const toy = await toyService.get(toyId);
    res.send(toy);
  } catch (err) {
    loggerService.error('Cannot get toy', err);
    res.status(400).send(err.message || 'Cannot get toy');
  }
});

app.post('/api/toy', async (req, res) => {
  try {
    const { name, price, labels } = req.body;
    const toy = {
      name,
      price: +price,
      labels,
    };
    const savedToy = await toyService.save(toy);
    res.send(savedToy);
  } catch (err) {
    loggerService.error('Cannot add toy', err);
    res.status(400).send('Cannot add toy');
  }
});

app.put('/api/toy', async (req, res) => {
  try {
    const { name, price, _id, labels } = req.body;
    const toy = {
      _id,
      name,
      price: +price,
      labels,
    };
    const savedToy = await toyService.save(toy);
    res.send(savedToy);
  } catch (err) {
    loggerService.error('Cannot update toy', err);
    res.status(400).send('Cannot update toy');
  }
});

app.delete('/api/toy/:toyId', async (req, res) => {
  try {
    const { toyId } = req.params;
    const msg = await toyService.remove(toyId);
    res.send({ msg, toyId });
  } catch (err) {
    loggerService.error('Cannot delete toy', err);
    res.status(400).send('Cannot delete toy, ' + err.message || 'Unknown error');
  }
});

// Fallback
app.get('/**', (req, res) => {
  res.sendFile(path.resolve('public/index.html'));
});

// Listen will always be the last line in our server!
const port = 3030;
app.listen(port, () => {
  loggerService.info(`Server listening on port http://127.0.0.1:${port}/`);
});


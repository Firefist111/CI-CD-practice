import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import Product from './models/Product.js';

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce';



app.use(cors());
app.use(express.json());

// GET all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create product
app.post('/api/products', async (req, res) => {
  try {
    const { title, price, description } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const product = await Product.create({
      title,
      price: Number(price) || 0,
      description: description || '',
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update product
app.put('/api/products/:id', async (req, res) => {
  try {
    const { title, price, description } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { title, price: Number(price) || 0, description: description || '' },
      { new: true, runValidators: true },
    );
    if (!product) return res.status(404).json({ error: 'Not found' });
    res.json(product);
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ error: 'Not found' });
    res.status(500).json({ error: err.message });
  }
});

// DELETE product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Not found' });
    res.json(product);
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ error: 'Not found' });
    res.status(500).json({ error: err.message });
  }
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(`MongoDB connected: ${MONGO_URI}`);
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });

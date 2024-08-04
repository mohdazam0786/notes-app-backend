// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('Could not connect to MongoDB...', err));

const noteSchema = new mongoose.Schema({
  title: String,
  content: String,
  category: String,
  createdAt: { type: Date, default: Date.now }
});

const Note = mongoose.model('Note', noteSchema);

app.post('/api/notes', async (req, res) => {
  try {
    const { title, content, category } = req.body;
    const note = new Note({
      title, content, category
    });
    await note.save();
    res.status(201).send(note);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

app.get('/api/notes', async (req, res) => {
  try {
    const { category, search } = req.query;
    let filter = {};
    if (category) filter.category = category;
    if (search) filter.$or = [{ title: new RegExp(search, 'i') }, { content: new RegExp(search, 'i') }];
    const notes = await Note.find(filter);
    res.send(notes);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

app.put('/api/notes/:id', async (req, res) => {
  try {
    const { title, content, category } = req.body;
    const note = await Note.findByIdAndUpdate(req.params.id, { title, content, category }, { new: true });
    if (!note) return res.status(404).send('Note not found');
    res.send(note);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

app.delete('/api/notes/:id', async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) return res.status(404).send('Note not found');
    res.send(note);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Bible Verse Schema
const verseSchema = new mongoose.Schema({
  reference: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: '30d' } // Auto-delete after 30 days
}, { timestamps: true });

const Verse = mongoose.model('Verse', verseSchema);

// API Endpoints
app.get('/api/verse', async (req, res) => {
  try {
    const { book, chapter, verse } = req.query;
    if (!book || !chapter || !verse) {
      return res.status(400).json({ error: 'Missing book, chapter, or verse' });
    }

    const reference = `${book} ${chapter}:${verse}`;
    
    // In production, replace this with actual Bible API call
    const mockText = `This would be the actual verse text for ${reference} from your Bible API. For God so loved the world that he gave his one and only Son...`;
    
    // Save to database
    const newVerse = new Verse({
      reference,
      text: mockText
    });
    await newVerse.save();
    
    res.json({
      text: mockText,
      reference
    });
  } catch (err) {
    console.error('Error in /api/verse:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/recent', async (req, res) => {
  try {
    const recentVerses = await Verse.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
      
    res.json(recentVerses);
  } catch (err) {
    console.error('Error in /api/recent:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

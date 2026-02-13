require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { runAgentFlow } = require('./services/agentService');
const UIVersion = require('./models/UIVersion');

const app = express();
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://your-frontend-project.vercel.app' 
    : 'http://localhost:5173'
}));
app.use(express.json());

app.get('/api/versions', async (req, res) => {
  try {
    const versions = await UIVersion.find().sort({ timestamp: -1 });
    res.json(versions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, currentCode } = req.body;
    
    // Explicitly passing currentCode for "Iteration & Edit Awareness"
    const result = await runAgentFlow(prompt, currentCode);

    const newVersion = new UIVersion({
      prompt,
      plan: result.plan,
      generatedCode: result.generatedCode,
      explanation: result.explanation
    });
    
    await newVersion.save();
    res.json(newVersion);
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/versions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await UIVersion.findByIdAndDelete(id);
    res.json({ message: "Version deleted successfully" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ error: "Failed to delete version" });
  }
});

mongoose.connect(process.env.MONGO_URI).then(() => {
  app.listen(5000, () => console.log("Server live on port 5000"));
});
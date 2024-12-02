import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';  // Import the cors package

dotenv.config();  // Load environment variables from .env

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());  // Enable CORS for all routes
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

// Channel schema
const channelSchema = new mongoose.Schema({
  channel_id: { type: String, required: true },
  alertCount: { type: Number, default: 0 },
});

const Channel = mongoose.model("Channel", channelSchema);

// Routes
app.get("/api/channels", async (req, res) => {
  try {
    const channels = await Channel.find();
    res.json(channels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/channels", async (req, res) => {
  try {
    const { channel_id } = req.body;
    const existingChannel = await Channel.findOne({ channel_id });
    if (existingChannel) {
      return res.status(400).send("Channel ID already exists.");
    }

    const newChannel = new Channel({ channel_id });
    await newChannel.save();
    res.status(201).json(newChannel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/channels/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedChannel = await Channel.findByIdAndDelete(id);
    if (!deletedChannel) {
      return res.status(404).send("Channel not found.");
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

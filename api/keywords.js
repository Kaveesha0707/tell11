import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();  // Load environment variables from .env

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());  // Enable CORS for all routes
app.use(express.json());  // Middleware to parse JSON bodies

// MongoDB connection
const connectToDatabase = async () => {
  if (mongoose.connection.readyState) return; // Avoid reconnecting if already connected

  const MONGO_URI = process.env.MONGO_URI;

  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw new Error("Database connection failed");
  }
};

// Channel schema and model
const channelSchema = new mongoose.Schema({
  channel_id: { type: String, required: true },
  alertCount: { type: Number, default: 0 },
});

const Channel = mongoose.model("Channel", channelSchema);

// Routes
// GET: Fetch all channels
app.get("/api/channels", async (req, res) => {
  try {
    await connectToDatabase();
    const channels = await Channel.find();
    res.status(200).json(channels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: Add a new channel
app.post("/api/channels", async (req, res) => {
  try {
    await connectToDatabase();
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

// DELETE: Delete a channel by ID
app.delete("/api/channels/:id", async (req, res) => {
  try {
    await connectToDatabase();
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

require('dotenv').config();
const express = require('express');
const { connectQueue, getChannel } = require('./queue');

const app = express();
app.use(express.json());
// app.use(express.text({ type: '*/*' }));

// Connect to CloudAMQP
connectQueue();

// Send message API
app.post('/send', async (req, res) => {
  const channel = getChannel();

  if (!channel) {
    return res.status(500).json({ error: 'Queue not ready' });
  }

  console.log('Received body:', req.body);
  const message = req.body?.message;

  channel.sendToQueue(
    process.env.QUEUE_NAME,
    Buffer.from(JSON.stringify({ message })),
    { persistent: true }
  );

  res.json({ status: 'Message sent', message });
});

// Health check
app.get('/', (req, res) => {
  res.send('Server running 🚀');
});

app.listen(3000, () => {
  console.log('Express server running on port 3000');
});
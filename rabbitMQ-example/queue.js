require('dotenv').config();
const amqp = require('amqplib');

let channel, connection;

async function connectQueue() {
  try {
    console.log(' Connecting to CloudAMQP...', process.env.CLOUDAMQP_URL);
    connection = await amqp.connect(process.env.CLOUDAMQP_URL);
    channel = await connection.createChannel();

    await channel.assertQueue(process.env.QUEUE_NAME, {
      durable: true,
    });

    console.log('✅ Connected to CloudAMQP');

    connection.on('close', () => {
      console.error('❌ Connection closed. Reconnecting...');
      setTimeout(connectQueue, 5000);
    });

  } catch (err) {
    console.error('Connection error:', err);
    setTimeout(connectQueue, 5000);
  }
}

function getChannel() {
  return channel;
}

module.exports = { connectQueue, getChannel };
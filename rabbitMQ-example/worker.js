require('dotenv').config();
const amqp = require('amqplib');

async function startWorker() {
  const connection = await amqp.connect(process.env.CLOUDAMQP_URL);
  const channel = await connection.createChannel();

  await channel.assertQueue(process.env.QUEUE_NAME, {
    durable: true,
  });

  console.log('Worker started, waiting for messages');

  channel.consume(process.env.QUEUE_NAME, (msg) => {
    if (msg !== null) {
      const data = JSON.parse(msg.content.toString());

      console.log('📩 Received:', data);

      // Simulate work
      setTimeout(() => {
        console.log('✅ Processed:', data.message);
        channel.ack(msg);
      }, 1000);
    }
  });
}

startWorker();
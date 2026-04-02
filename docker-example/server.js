const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

// folder where data will be stored
const dataDir = '/app/data/v1';
const filePath = path.join(dataDir, 'log.txt');

// ensure folder exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

app.get('/', (req, res) => {
  const message = `Request received at ${new Date().toISOString()}\n`;

  console.log(message.trim());
  // append data to file
  fs.appendFileSync(filePath, message);

  res.send('Data written to volume!');
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
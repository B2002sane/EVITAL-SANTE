const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const http = require('http');
const { Server } = require('socket.io');

const PORT = 5000;
const SERIAL_PORT = '/dev/ttyUSB0';

const app = express();
app.use(cors());
app.use(bodyParser.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:4200",
    methods: ["GET", "POST"]
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});

try {
  const arduinoPort = new SerialPort({ path: SERIAL_PORT, baudRate: 9600 });
  const parser = arduinoPort.pipe(new ReadlineParser({ delimiter: '\n' }));

  parser.on('data', (data) => {
    data = data.trim();
    console.log('📩 Données reçues depuis Arduino:', data);

    try {
      const jsonData = JSON.parse(data);

      if (jsonData.status === "Success" && jsonData.uid) {
        console.log('🆔 UID de la carte:', jsonData.uid);
        // Émettre uniquement l'UID vers le client
        io.emit('card_uid', jsonData.uid);
      }
    } catch (error) {
      console.error('❌ Erreur de parsing JSON:', error.message);
    }
  });
} catch (error) {
  console.error(`❌ Erreur d'ouverture du port série (${SERIAL_PORT}):`, error.message);
}
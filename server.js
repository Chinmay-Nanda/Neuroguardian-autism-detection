const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

const serviceAccount = require('./firebase-key.json'); // Firebase Service Account Key JSON file

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

app.post('/notify', (req, res) => {
  const message = {
    notification: {
      title: 'NeuroGuardian Alert',
      body: 'Unusual movement detected!'
    },
    topic: 'autismAlert'
  };

  admin.messaging().send(message)
    .then(response => {
      console.log('Successfully sent message:', response);
      res.send('Notification sent');
    })
    .catch(error => {
      console.error('Error sending message:', error);
      res.status(500).send('Failed to send notification');
    });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
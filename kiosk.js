const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const port = 3000;

// Middleware to handle form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve HTML file with a form
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint to change the URL on the Raspberry Pi
app.post('/change-url', (req, res) => {
  const newUrl = req.body.url;
  const serverUrl = 'http://192.168.0.156:3000/change-url'; // Ensure the correct URL of your Raspberry Pi server
  
  axios.post(serverUrl, { url: newUrl })
    .then(response => {
      res.send(`URL changed to: ${newUrl}`);
    })
    .catch(error => {
      res.status(500).send('Error: ' + error.message);
    });
});

app.listen(port, () => {
  console.log(`Client server running on port ${port}`);
});

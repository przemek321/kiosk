const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const axios = require('axios');

const app = express();
const port = 3000;

// Middleware to handle form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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

// Endpoint to take a screenshot
app.get('/screenshot', (req, res) => {
  const screenshotPath = '/home/n1copl/screenshot.png'; // Ścieżka do pliku zrzutu ekranu

  // Komenda do zrobienia zrzutu ekranu, zależnie od używanego środowiska (X11 lub Wayland)
  const screenshotCommand = `scrot ${screenshotPath}`;

  exec(screenshotCommand, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error taking screenshot: ${error.message}`);
      res.status(500).send('Failed to take screenshot.');
      return;
    }
    if (stderr) {
      console.error(`Stderr: ${stderr}`);
    }
    console.log('Screenshot taken:', screenshotPath);

    // Wysyłanie pliku zrzutu ekranu do przeglądarki
    res.sendFile(screenshotPath);
  });
});

app.listen(port, () => {
  console.log(`Client server running on port ${port}`);
});

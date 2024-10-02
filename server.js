const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const port = 3000;

// Ustawienie middleware do obsługi danych z formularza
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serwowanie pliku HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint do zmiany URL
app.post('/change-url', (req, res) => {
  const newUrl = req.body.url; // Pobiera nowy URL z formularza
  const serverUrl = 'http://raspberrypi.local:3000/change-url'; // Twój serwer docelowy

  // Wysyłanie żądania POST do serwera docelowego
  axios.post(serverUrl, { url: newUrl })
    .then(response => {
      res.send(`
        <html>
        <body>
          <h1>URL zmieniono na: ${newUrl}</h1>
          <p>Odpowiedź serwera: ${response.data}</p>
          <a href="/">Powrót</a>
        </body>
        </html>
      `);
    })
    .catch(error => {
      res.status(500).send(`
        <html>
        <body>
          <h1>Wystąpił błąd</h1>
          <p>${error.message}</p>
          <a href="/">Powrót</a>
        </body>
        </html>
      `);
    });
});

app.listen(port, () => {
  console.log(`Serwer działa na porcie ${port}`);
});

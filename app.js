const express = require('express');
const ping = require('ping');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const port = 3001;

const devicesFilePath = path.join(__dirname, 'devices.json');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/public', express.static(path.join(__dirname, 'screenshots')));


function loadDevices() {
    if (fs.existsSync(devicesFilePath)) {
        return JSON.parse(fs.readFileSync(devicesFilePath, 'utf8'));dob
    }
    return [];
}

function saveDevices(devices) {
    fs.writeFileSync(devicesFilePath, JSON.stringify(devices, null, 2));
}

let devices = loadDevices();

const axios = require('axios'); // Dodaj axios do wysyłania żądań HTTP

async function pingDevices() {
    for (let device of devices) {
        const res = await ping.promise.probe(device.ip, {
            timeout: 10
        });

        device.status = res.alive ? 'Online' : 'Offline';
        device.lastPing = new Date().toLocaleString();

        if (res.alive) {
            try {
                //console.log(`Fetching URL for device ${device.ip}`);
                const response = await axios.get(`http://${device.ip}:3000/showurl`);
                
               // console.log(`URL fetched for device ${device.ip}:`, response.data.currentUrl);
                device.currentUrl = response.data.currentUrl;

                // const screenResponse = await axios.get(`http://${device.ip}:3000/screen`);
                // console.log(`Screenshot endpoint response for device ${device.ip}:`, screenResponse.data);

            } catch (error) {
                console.error(`Error fetching URL for TV ${device.ip}:`, error.message);
                device.currentUrl = 'Error fetching URL';
            }
        } else {
            device.currentUrl = 'TV offline';
        }
    }
    saveDevices(devices);
}

setInterval(pingDevices, 5000);

app.get('/', (req, res) => {
    res.render('index', { devices });
});

app.get('/devices/add', (req, res) => {
    res.render('device-form', { device: {} });
});

app.post('/devices/add', (req, res) => {
    const { name, ip, screenshot } = req.body;
    const id = Date.now().toString();
    const newDevice = {
        id,
        name,
        ip,
        screenshot,
        status: 'unknown',
        lastPing: 'N/A'
    };
    devices.push(newDevice);
    saveDevices(devices);
    res.redirect('/');
});

app.get('/devices/edit/:id', (req, res) => {
    const device = devices.find(d => d.id === req.params.id);
    console.log('device');
    if (device) {
        res.render('device-form', { device });
    } else {
        res.status(404).send('Device not found');
    }
});

app.post('/devices/update', (req, res) => {
    const { id, name, ip, screenshot } = req.body;
    const index = devices.findIndex(d => d.id === id);
    if (index !== -1) {
        devices[index] = { id, name, ip, screenshot, status: 'unknown', lastPing: 'N/A' };
        saveDevices(devices);
    }
    res.redirect('/');
});

app.post('/devices/update-device', (req, res) => {
    const { id, newName, newIp, newScreenshot } = req.body;
  
    // Znajdź urządzenie w pliku devices.json
    const device = devices.find(d => d.id === id);
    
    if (device) {
      // Zaktualizuj dane urządzenia lokalnie
      device.name = newName;
      device.ip = newIp;
      device.screenshot = newScreenshot;
  
      // Zapisz zaktualizowane dane w pliku devices.json
      saveDevices(devices);
  
      res.json({ message: `Device ${newName} updated successfully` });
    } else {
      res.status(404).json({ message: 'Device not found' });
    }
  });

app.post('/devices/update-url', (req, res) => {
  const { id, newUrl } = req.body;
  
  // Znajdź urządzenie w pliku devices.json
  const device = devices.find(d => d.id === id);
  console.log(newUrl);
  if (device) {
    // Wysyłamy żądanie do maliny, aby zaktualizować URL
    axios.post(`http://${device.ip}:3000/change-url`, {
      url: newUrl
      
    })
    .then(response => {
      // Zaktualizuj URL na serwerze zarządzającym
      device.currentUrl = newUrl;
      saveDevices(devices);  // Zapisz nowe ustawienia lokalnie
      res.json({ message: `URL for device ${id} updated to ${newUrl}` });
    })
    .catch(error => {
      console.error(`Error updating URL for device ${id}:`, error.message);
      res.status(500).json({ message: `Error updating URL for device ${id}` });
    });
  } else {
    res.status(404).json({ message: 'Device not found' });
  }
});


app.post('/update-ip', (req, res) => {
    const { deviceId, ip } = req.body;
    console.log(deviceId,ip);
    // Zaktualizuj IP urządzenia w bazie danych lub w pliku
    updateDeviceIp(deviceId, ip);
    res.send({ message: 'IP updated' });
  });

// Funkcja do aktualizacji IP
function updateDeviceIp(deviceId, newIp) {
    const serverUrl = 'http://localhost:3001/devices/update-device'; // Dodaj pełną ścieżkę URL

    // Znajdź urządzenie na podstawie ID przed wysłaniem zapytania
    const device = devices.find(d => d.id === deviceId);

    if (!device) {
        console.error('Device not found.');
        return;
    }

    // Przekazujemy wszystkie istniejące dane urządzenia, w tym aktualizowane IP
    fetch(serverUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: deviceId,
        newName: device.name, // Upewnij się, że name jest zachowane
        newIp: newIp,         // Tylko IP jest aktualizowane
        newScreenshot: device.screenshot // Zachowanie innych pól
      })
    })
    .then(response => response.json())
    .then(data => {
      console.log(`Device IP updated: ${data.message}`);
    })
    .catch(error => {
      console.error('Error updating device IP:', error);
    });
}


 
  

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

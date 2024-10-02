const express = require('express');
const ping = require('ping');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const axios = require('axios'); // Biblioteka do zapytań HTTP
const app = express();
const port = 3001;
//test cos tam 
const devicesFilePath = path.join(__dirname, 'devices.json');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/public', express.static(path.join(__dirname, 'screenshots')));

// Funkcja ładowania urządzeń z pliku devices.json
function loadDevices() {
    if (fs.existsSync(devicesFilePath)) {
        return JSON.parse(fs.readFileSync(devicesFilePath, 'utf8'));
    }
    return [];PDodanie 
}

// Funkcja zapisywania urządzeń do pliku devices.json
function saveDevices(devices) {
    fs.writeFileSync(devicesFilePath, JSON.stringify(devices, null, 2));
}

let devices = loadDevices();

// Funkcja do pingowania urządzeń oraz pobierania URL i interwału odświeżania
async function pingDevices() {
    for (let device of devices) {
        const res = await ping.promise.probe(device.ip, {
            timeout: 10
        });

        device.status = res.alive ? 'Online' : 'Offline';
        device.lastPing = new Date().toLocaleString();

        // Jeśli urządzenie jest online, pobierz aktualny URL i interwał odświeżania
        if (res.alive) {
            try {
                console.log(`Fetching URL and refresh interval for device ${device.ip}`);
                const response = await axios.get(`http://${device.ip}:3000/showurl`);
                console.log(`Data fetched for device ${device.ip}:`, response.data);
                device.currentUrl = response.data.currentUrl;
                device.refreshInterval = response.data.refreshInterval;
            } catch (error) {
                console.error(`Error fetching data for device ${device.ip}:`, error.message);
                device.currentUrl = 'Error fetching URL';
                device.refreshInterval = 'Error fetching interval';
            }
        } else {
            device.currentUrl = 'Device offline';
            device.refreshInterval = 'Device offline';
        }
    }
    saveDevices(devices);
}

// Uruchamiaj pingowanie urządzeń co 5 sekund
setInterval(pingDevices, 5000);

// Strona główna wyświetlająca status urządzeń
app.get('/', (req, res) => {
    res.render('index', { devices });
});

// Dodawanie nowego urządzenia
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
        lastPing: 'N/A',
        currentUrl: 'N/A',
        refreshInterval: 'N/A'
    };
    devices.push(newDevice);
    saveDevices(devices);
    res.redirect('/');
});

// Edycja istniejącego urządzenia
app.get('/devices/edit/:id', (req, res) => {
    const device = devices.find(d => d.id === req.params.id);
    if (device) {
        res.render('device-form', { device });
    } else {
        res.status(404).send('Device not found');
    }
});

// Aktualizacja danych urządzenia
app.post('/devices/update', (req, res) => {
    const { id, name, ip, screenshot } = req.body;
    const index = devices.findIndex(d => d.id === id);
    if (index !== -1) {
        devices[index] = { 
            id, 
            name, 
            ip, 
            screenshot, 
            status: 'unknown', 
            lastPing: 'N/A', 
            currentUrl: 'N/A', 
            refreshInterval: 'N/A' 
        };
        saveDevices(devices);
    }
    res.redirect('/');
});

// Uruchomienie serwera
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

app.use(express.json({ limit: '30mb' }));

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'state.json');

function nowStr() {
  const d = new Date();
  return d.toLocaleDateString('es-MX') + ' ' + d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function h(action, detail, user = 'Sistema') {
  return { date: nowStr(), user, action, detail };
}

function getInitialState() {
  return {
    orderSeq: 0,
    orders: [],
    allocations: [],
    lots: [],
    inspections: [],
    deliveries: [],
    customProducts: [],
    updatedAt: Date.now(),
    version: 10
  };
}

let serverState = null;

function loadState() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      serverState = JSON.parse(raw);
      if (!serverState.customProducts) {
        serverState.customProducts = [];
      }
      // Migrate or reset if demo orders exist
      if (serverState.orders && serverState.orders.some(o => o.id === 'OC-DEMO-001' || (o.id||'').includes('DEMO'))) {
        console.log('Clearing demo data for pilot launch...');
        serverState = getInitialState();
        saveStateToFile();
      }
    } else {
      serverState = getInitialState();
      saveStateToFile();
    }
  } catch (err) {
    console.error('Error loading state:', err);
    serverState = getInitialState();
  }
}

function saveStateToFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(serverState, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving state:', err);
  }
}

loadState();

// API Endpoints
app.get('/api/state', (req, res) => {
  res.json(serverState);
});

app.post('/api/state', (req, res) => {
  if (req.body && typeof req.body === 'object') {
    const nextVer = (serverState.version || 0) + 1;
    serverState = {
      ...req.body,
      updatedAt: Date.now(),
      version: nextVer
    };
    saveStateToFile();
    res.json({ success: true, version: serverState.version, updatedAt: serverState.updatedAt });
  } else {
    res.status(400).json({ error: 'Invalid state payload' });
  }
});

app.post('/api/reset', (req, res) => {
  const nextVer = (serverState && serverState.version ? serverState.version : 0) + 1;
  serverState = getInitialState();
  serverState.version = nextVer;
  saveStateToFile();
  res.json({ success: true, state: serverState });
});

// Serve static assets from root and subdirectories
app.use(express.static(__dirname));

// Ensure /assets/ and /docs/ route properly
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/docs', express.static(path.join(__dirname, 'docs')));

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`CAMPAR SGC Digital server running at http://${HOST}:${PORT}`);
});

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración general
const CONFIG_FILE = path.join(__dirname, 'config.json');
const DEFAULT_CONFIG = {
  sheetId: '1LLjq5dvk6-jGYYjodozsk7x1BFPhHKje9jNGM68GpQM',
  sheetName: 'Accounts available',
  pollIntervalSeconds: 15, // intervalo de sondeo a Google Sheets
  discordWebhookUrl: '',
  customWebhookUrls: [],
  soundAlerts: true
};

function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
      return { ...DEFAULT_CONFIG, ...data };
    }
  } catch (err) {
    console.error('Error al leer config.json, usando valores por defecto:', err.message);
  }
  return { ...DEFAULT_CONFIG };
}

function saveConfig(cfg) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error al guardar config.json:', err.message);
  }
}

let config = loadConfig();

// Estado en memoria
let currentCatalog = []; // lista de cuentas con info estática + disponibilidad
let availabilityMapByRow = {}; // { [row]: available }
let availabilityMapById = {};  // { [id]: available }
let lastSyncTime = null;
let lastSyncSuccess = false;
let lastError = null;
let changeLog = []; // historial de cambios recientes
const sseClients = new Set(); // conexiones Server-Sent Events

/**
 * Obtener y parsear los datos en vivo de Google Sheets mediante la API de visualización
 */
async function fetchSheetData() {
  const url = `https://docs.google.com/spreadsheets/d/${config.sheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(config.sheetName)}`;
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) OSRS-Availability-Monitor/1.0'
    },
    signal: AbortSignal.timeout(12000)
  });

  if (!response.ok) {
    throw new Error(`Google Sheets respondió con código HTTP ${response.status}`);
  }

  const text = await response.text();
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}') + 1;
  if (start === -1 || end === 0) {
    throw new Error('Respuesta de Google GViz inválida o sin objeto JSON');
  }

  const rawJson = JSON.parse(text.substring(start, end));
  const rows = rawJson.table?.rows || [];

  let currentCategory = 'General';
  let accountId = 1;
  const parsedAccounts = [];

  for (let i = 0; i < rows.length; i++) {
    const sheetRowNumber = i + 2; // Fila 1 es el encabezado en Google Sheets
    const c = rows[i]?.c || [];

    const col0 = c[0]?.v != null ? String(c[0].v).trim() : '';
    const col1 = c[1]?.v != null ? String(c[1].v).trim() : '';
    const col2 = c[2]?.v != null ? c[2].v : null;
    const col3 = c[3]?.v != null ? c[3].v : 0;

    // Detectar si la fila es un encabezado de categoría (ej: "Zerkers", "Piety", etc.)
    const isCategoryHeader = 
      col1.toLowerCase() === 'max supplies' || 
      (col0 && !col1 && col2 === null && (col3 === 0 || col3 === null) && !col0.toLowerCase().includes(':'));

    if (isCategoryHeader) {
      currentCategory = col0;
      continue;
    }

    // Fila vacía
    if (!col0 && !col1 && col2 === null && !col3) {
      continue;
    }

    // Parsear disponibilidad como entero seguro
    let available = 0;
    try {
      const num = Number(col3);
      if (!isNaN(num) && num > 0) {
        available = Math.floor(num);
      }
    } catch {
      available = 0;
    }

    // Precio formateado
    let priceFormatted = col2 != null ? (typeof col2 === 'number' ? `$${col2}` : String(col2)) : 'N/A';
    if (c[2]?.f) {
      priceFormatted = c[2].f;
    }

    const account = {
      id: accountId++,
      row: sheetRowNumber,
      category: currentCategory,
      build: col0,
      supplies: col1,
      price: col2,
      priceFormatted: priceFormatted,
      available: available
    };

    parsedAccounts.push(account);
  }

  return parsedAccounts;
}

/**
 * Comparar estado anterior con el nuevo para detectar cambios y disparar webhooks
 */
async function processSync() {
  try {
    const freshAccounts = await fetchSheetData();
    const now = new Date();
    const newAvailByRow = {};
    const newAvailById = {};
    const detectedChanges = [];

    for (const acc of freshAccounts) {
      newAvailByRow[acc.row] = acc.available;
      newAvailById[acc.id] = acc.available;

      // Si teníamos un estado previo registrado, comparar
      if (lastSyncTime !== null && availabilityMapByRow[acc.row] !== undefined) {
        const oldVal = availabilityMapByRow[acc.row];
        const newVal = acc.available;

        if (oldVal !== newVal) {
          const diff = newVal - oldVal;
          const changeEvent = {
            id: acc.id,
            row: acc.row,
            category: acc.category,
            build: acc.build,
            price: acc.priceFormatted,
            oldAvailable: oldVal,
            newAvailable: newVal,
            diff: diff,
            type: diff > 0 ? (oldVal === 0 ? 'NEW_STOCK' : 'STOCK_INCREASED') : (newVal === 0 ? 'SOLD_OUT' : 'STOCK_DECREASED'),
            timestamp: now.toISOString()
          };
          detectedChanges.push(changeEvent);
          changeLog.unshift(changeEvent);
        }
      }
    }

    // Limitar log a los últimos 150 eventos
    if (changeLog.length > 150) {
      changeLog = changeLog.slice(0, 150);
    }

    currentCatalog = freshAccounts;
    availabilityMapByRow = newAvailByRow;
    availabilityMapById = newAvailById;
    lastSyncTime = now.toISOString();
    lastSyncSuccess = true;
    lastError = null;

    // Si hubo cambios y no era la primera sincronización, disparar Webhooks y SSE
    if (detectedChanges.length > 0) {
      console.log(`[${now.toLocaleTimeString()}] ¡${detectedChanges.length} cambio(s) detectado(s) en disponibilidad!`);
      broadcastSSE('stock_change', {
        changes: detectedChanges,
        timestamp: lastSyncTime
      });

      // Disparar Webhooks en segundo plano
      dispatchWebhooks(detectedChanges).catch(err => {
        console.error('Error al despachar webhooks:', err.message);
      });
    }

    // Guardar una copia estática del catálogo en JSON para cruzar datos
    saveStaticCatalogFile(currentCatalog);

    return {
      success: true,
      totalAccounts: currentCatalog.length,
      availableCount: currentCatalog.filter(a => a.available > 0).length,
      changes: detectedChanges
    };
  } catch (err) {
    lastSyncSuccess = false;
    lastError = err.message;
    console.error(`[${new Date().toLocaleTimeString()}] Error al sincronizar con Google Sheets:`, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Guarda el archivo estático accounts_catalog.json en el disco
 */
function saveStaticCatalogFile(catalog) {
  try {
    const filePath = path.join(__dirname, 'accounts_catalog.json');
    fs.writeFileSync(filePath, JSON.stringify(catalog, null, 2), 'utf-8');
  } catch (e) {
    // ignorar fallo secundario
  }
}

/**
 * Disparador de Webhooks (Discord y Webhooks personalizados)
 */
async function dispatchWebhooks(changes) {
  // 1. Discord Webhook
  if (config.discordWebhookUrl && config.discordWebhookUrl.startsWith('https://discord.com/api/webhooks/')) {
    try {
      const embeds = changes.slice(0, 10).map(ch => {
        let color = 0xF1C40F; // Amarillo / Gold por defecto
        let titlePrefix = '📦 Cambio de Stock';

        if (ch.type === 'NEW_STOCK') {
          color = 0x2ECC71; // Verde brillante
          titlePrefix = '🔥 ¡NUEVO STOCK DISPONIBLE!';
        } else if (ch.type === 'STOCK_INCREASED') {
          color = 0x27AE60; // Verde
          titlePrefix = '📈 Stock Aumentado';
        } else if (ch.type === 'SOLD_OUT') {
          color = 0xE74C3C; // Rojo
          titlePrefix = '❌ Cuentas Agotadas';
        } else if (ch.type === 'STOCK_DECREASED') {
          color = 0xE67E22; // Naranja
          titlePrefix = '📉 Stock Disminuido';
        }

        return {
          title: `${titlePrefix} | Fila #${ch.row} (ID #${ch.id})`,
          description: `**Categoría:** ${ch.category}\n**Build:** ${ch.build.length > 250 ? ch.build.substring(0, 247) + '...' : ch.build}`,
          color: color,
          fields: [
            {
              name: 'Disponibles Ahora',
              value: `**${ch.newAvailable}** (antes: ${ch.oldAvailable} | ${ch.diff > 0 ? '+' : ''}${ch.diff})`,
              inline: true
            },
            {
              name: 'Precio Estimado',
              value: `${ch.price || 'N/A'}`,
              inline: true
            }
          ],
          footer: {
            text: 'OSRS Account Availability Monitor • En vivo'
          },
          timestamp: ch.timestamp
        };
      });

      await fetch(config.discordWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: changes.some(c => c.newAvailable > 0) ? '🔔 **¡Alerta de Disponibilidad OSRS!**' : undefined,
          embeds: embeds
        })
      });
      console.log(`[Webhook] Notificación enviada exitosamente a Discord (${changes.length} cambios).`);
    } catch (err) {
      console.error('[Webhook] Error al enviar a Discord:', err.message);
    }
  }

  // 2. Custom Webhook URLs
  if (Array.isArray(config.customWebhookUrls) && config.customWebhookUrls.length > 0) {
    for (const hookUrl of config.customWebhookUrls) {
      try {
        await fetch(hookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'availability_update',
            timestamp: new Date().toISOString(),
            changes: changes,
            current_available_rows: Object.entries(availabilityMapByRow)
              .filter(([_, v]) => v > 0)
              .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {})
          })
        });
      } catch (err) {
        console.error(`[Webhook] Error al enviar a ${hookUrl}:`, err.message);
      }
    }
  }
}

/**
 * Enviar mensaje a clientes SSE
 */
function broadcastSSE(event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
}

// Iniciar aplicación Express
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// ENDPOINTS DE LA API (REST & SSE)
// ==========================================

/**
 * 1. GET /api/availability
 * Retorna exactamente la disponibilidad requerida.
 * Parámetros opcionales:
 * - format=simple: Retorna mapa puro { [row]: available }
 * - format=ids:    Retorna mapa puro { [id]: available }
 * - format=pairs:  Retorna array de tuplas [[row, available], ...]
 * - only_in_stock=true: Filtra solo las que tienen stock > 0
 */
app.get('/api/availability', (req, res) => {
  const { format, only_in_stock, by } = req.query;
  const filterStock = only_in_stock === 'true' || only_in_stock === '1';
  const useId = by === 'id';

  // Si piden formato mapa simple
  if (format === 'simple' || format === 'map') {
    const sourceMap = useId ? availabilityMapById : availabilityMapByRow;
    if (!filterStock) {
      return res.json(sourceMap);
    }
    const filtered = {};
    for (const [k, v] of Object.entries(sourceMap)) {
      if (v > 0) filtered[k] = v;
    }
    return res.json(filtered);
  }

  // Si piden lista de pares [[8, 1], [10, 11]]
  if (format === 'pairs') {
    const list = currentCatalog
      .filter(a => !filterStock || a.available > 0)
      .map(a => [useId ? a.id : a.row, a.available]);
    return res.json(list);
  }

  // Respuesta completa por defecto
  const items = currentCatalog
    .filter(a => !filterStock || a.available > 0)
    .map(a => ({
      row: a.row,
      id: a.id,
      category: a.category,
      available: a.available,
      price: a.priceFormatted,
      supplies: a.supplies,
      build: a.build
    }));

  const activeStockMap = {};
  for (const [row, qty] of Object.entries(availabilityMapByRow)) {
    if (qty > 0) activeStockMap[row] = qty;
  }

  return res.json({
    status: lastSyncSuccess ? 'ok' : 'stale_or_error',
    lastSync: lastSyncTime,
    totalAccounts: currentCatalog.length,
    inStockAccountsCount: items.filter(i => i.available > 0).length,
    totalUnitsAvailable: items.reduce((acc, curr) => acc + curr.available, 0),
    // Mapas directos para cruzar rápidamente con otra base de datos:
    stockByRow: activeStockMap,
    stockById: Object.entries(availabilityMapById)
      .filter(([_, v]) => v > 0)
      .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {}),
    items: items
  });
});

/**
 * 2. GET /api/accounts
 * Catálogo completo de cuentas con todas las columnas estáticas y el stock actual
 */
app.get('/api/accounts', (req, res) => {
  const { category, search, only_available } = req.query;
  let result = [...currentCatalog];

  if (only_available === 'true' || only_available === '1') {
    result = result.filter(a => a.available > 0);
  }

  if (category && category !== 'All') {
    result = result.filter(a => a.category.toLowerCase() === category.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(a => 
      a.build.toLowerCase().includes(q) ||
      a.supplies.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q) ||
      String(a.row) === q ||
      String(a.id) === q
    );
  }

  res.json({
    count: result.length,
    accounts: result
  });
});

/**
 * 3. GET /api/accounts/:identifier
 * Búsqueda puntual por número de Fila (row) o por ID secuencial
 */
app.get('/api/accounts/:identifier', (req, res) => {
  const num = parseInt(req.params.identifier, 10);
  if (isNaN(num)) {
    return res.status(400).json({ error: 'Identificador inválido' });
  }

  const account = currentCatalog.find(a => a.row === num || a.id === num);
  if (!account) {
    return res.status(404).json({ error: `No se encontró cuenta con Fila o ID #${num}` });
  }

  res.json(account);
});

/**
 * 4. GET /api/changes
 * Historial de cambios recientes de disponibilidad
 */
app.get('/api/changes', (req, res) => {
  res.json({
    count: changeLog.length,
    changes: changeLog
  });
});

/**
 * 5. POST /api/poll
 * Fuerza una sincronización manual inmediata con Google Sheets
 */
app.post('/api/poll', async (req, res) => {
  const result = await processSync();
  res.json(result);
});

/**
 * 6. GET /api/status
 * Estado de salud del monitor
 */
app.get('/api/status', (req, res) => {
  res.json({
    online: true,
    lastSyncTime: lastSyncTime,
    lastSyncSuccess: lastSyncSuccess,
    lastError: lastError,
    pollIntervalSeconds: config.pollIntervalSeconds,
    totalAccounts: currentCatalog.length,
    inStockAccounts: currentCatalog.filter(a => a.available > 0).length,
    connectedSseClients: sseClients.size,
    hasDiscordWebhook: Boolean(config.discordWebhookUrl)
  });
});

/**
 * 7. GET /api/config y POST /api/config
 * Configuración del sondeo y webhooks
 */
app.get('/api/config', (req, res) => {
  // Ocultar parte del webhook por privacidad si se desea
  res.json({
    sheetId: config.sheetId,
    sheetName: config.sheetName,
    pollIntervalSeconds: config.pollIntervalSeconds,
    discordWebhookUrl: config.discordWebhookUrl,
    customWebhookUrls: config.customWebhookUrls || []
  });
});

app.post('/api/config', (req, res) => {
  const { discordWebhookUrl, pollIntervalSeconds, customWebhookUrls } = req.body;

  if (pollIntervalSeconds != null) {
    const interval = parseInt(pollIntervalSeconds, 10);
    if (!isNaN(interval) && interval >= 3) {
      config.pollIntervalSeconds = interval;
      resetPollingTimer();
    }
  }

  if (discordWebhookUrl !== undefined) {
    config.discordWebhookUrl = String(discordWebhookUrl).trim();
  }

  if (Array.isArray(customWebhookUrls)) {
    config.customWebhookUrls = customWebhookUrls.map(u => String(u).trim()).filter(Boolean);
  }

  saveConfig(config);
  res.json({ success: true, config });
});

/**
 * 8. POST /api/webhooks/test
 * Envía un mensaje de prueba al webhook de Discord configurado
 */
app.post('/api/webhooks/test', async (req, res) => {
  const targetUrl = req.body.url || config.discordWebhookUrl;
  if (!targetUrl) {
    return res.status(400).json({ error: 'No hay URL de Discord Webhook configurada' });
  }

  try {
    const testPayload = {
      content: '✅ **Test de Conexión OSRS Availability Monitor**',
      embeds: [{
        title: '🔔 Notificación de Prueba',
        description: 'La integración de Webhook está funcionando correctamente y lista para recibir alertas de stock.',
        color: 0x3498DB,
        fields: [
          { name: 'Sincronizador', value: 'Activo (Google Sheets Poller)', inline: true },
          { name: 'Hora Local', value: new Date().toLocaleTimeString(), inline: true }
        ],
        footer: { text: 'OSRS Accounts Monitor' },
        timestamp: new Date().toISOString()
      }]
    };

    const resp = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload)
    });

    if (resp.ok || resp.status === 204) {
      return res.json({ success: true, message: 'Mensaje de prueba enviado exitosamente a Discord' });
    } else {
      const errText = await resp.text();
      return res.status(resp.status).json({ success: false, error: `Discord respondió: ${errText}` });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 9. GET /api/stream
 * Conexión Server-Sent Events (SSE) para recibir cambios en tiempo real
 */
app.get('/api/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  sseClients.add(res);

  // Enviar estado inicial de bienvenida
  res.write(`event: connected\ndata: ${JSON.stringify({ 
    message: 'Conectado al monitor en tiempo real', 
    lastSync: lastSyncTime,
    inStockCount: currentCatalog.filter(a => a.available > 0).length
  })}\n\n`);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

/**
 * 10. GET /api/export/catalog.csv
 * Descargar CSV con el catálogo y mapeo estático de cuentas
 */
app.get('/api/export/catalog.csv', (req, res) => {
  let csv = 'Row,ID,Category,Price,Supplies,Available,Build\n';
  for (const a of currentCatalog) {
    const cleanBuild = `"${(a.build || '').replace(/"/g, '""')}"`;
    const cleanSupplies = `"${(a.supplies || '').replace(/"/g, '""')}"`;
    const cleanCat = `"${(a.category || '').replace(/"/g, '""')}"`;
    csv += `${a.row},${a.id},${cleanCat},${a.price || ''},${cleanSupplies},${a.available},${cleanBuild}\n`;
  }
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="osrs_accounts_catalog.csv"');
  res.send(csv);
});

// ==========================================
// PROGRAMADOR DE POLLING
// ==========================================
let pollingTimer = null;

function resetPollingTimer() {
  if (pollingTimer) {
    clearInterval(pollingTimer);
  }
  const intervalMs = Math.max(3, config.pollIntervalSeconds || 15) * 1000;
  pollingTimer = setInterval(async () => {
    await processSync();
  }, intervalMs);
  console.log(`[Timer] Sondeo automático configurado cada ${config.pollIntervalSeconds} segundos.`);
}

// Middleware para inicialización diferida (esencial para Vercel Serverless)
app.use(async (req, res, next) => {
  if (currentCatalog.length === 0) {
    try {
      await processSync();
    } catch (e) {
      console.error('Lazy sync error:', e.message);
    }
  }
  next();
});

// Inicialización del servidor
const PORT = process.env.PORT || 3000;

async function start() {
  console.log('Iniciando OSRS Account Availability Monitor...');
  await processSync();
  resetPollingTimer();

  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 SERVIDOR OSRS MONITOR ACTIVO`);
    console.log(`👉 Panel Web:      http://localhost:${PORT}`);
    console.log(`👉 API Simple:     http://localhost:${PORT}/api/availability?format=simple`);
    console.log(`👉 API Completa:   http://localhost:${PORT}/api/availability`);
    console.log(`👉 SSE En Vivo:    http://localhost:${PORT}/api/stream`);
    console.log(`======================================================\n`);
  });
}

// Exportar para Vercel Serverless y ejecutar localmente si no es Vercel
export default app;

if (!process.env.VERCEL) {
  start();
}

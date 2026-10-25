// ========================================================
// LuckyCharmGold (LCG) - OSRS Accounts Monitor Controller
// Default Language: English (EN) with Spanish (ES) Option
// ========================================================

const i18n = {
  en: {
    pageBrowserTitle: 'LuckyCharm Accounts • OSRS Live Availability Monitor',
    announcementText: 'Real-time live synchronization with Google Sheets • Automatic stock update feeds',
    siteTitle: 'LUCKY CHARM',
    siteSub: 'Account Availability Monitor • Google Sheets Live Sync',
    live: 'Live',
    reconnecting: 'Reconnecting...',
    soundOn: '🔊 Sound enabled',
    soundOff: '🔇 Sound muted',
    refresh: 'Refresh',
    refreshing: 'Fetching...',
    webhookApiBtn: '⚙️ Webhook & API',
    tabAccounts: '🛡️ Accounts & Availability',
    tabHistory: '📜 Change History',
    tabWebhooks: '⚙️ Webhook & API Settings',
    
    // Main View
    pageTitle: 'Account Availability',
    heroDescription: 'Live inquiry of available accounts ready for fast purchase and immediate delivery in Old School RuneScape.',
    lastSync: 'Last sync',
    accountsInStock: 'Accounts in stock',
    totalUnits: 'Available Units',
    sumStockLabel: 'Total accumulated stock',
    catalogedText: 'cataloged',
    dataNotice: '<strong>Data notice:</strong> Stats, supplies, and pricing columns are static. The <strong>Available</strong> column updates periodically from the shared Google Spreadsheet. Click <strong>Copy Order</strong> on any row to copy the preformatted text ready to negotiate on Discord.',
    newStockAlert: 'New stock detected!',
    searchPlaceholder: 'Search by build, stats (e.g. 99 strength, 94 magic, barrows gloves), row or ID...',
    inStockOnly: 'In stock only',
    allCategories: 'All categories',
    sortRowAsc: 'Sort by: Sheet Row (default)',
    sortStockDesc: 'Sort by: Highest Stock',
    sortPriceDesc: 'Sort by: Highest Price',
    sortPriceAsc: 'Sort by: Lowest Price',
    thRow: 'Row',
    thId: 'ID',
    thCategory: 'Category',
    thBuild: 'Build / Stats / Quests',
    thSupplies: 'Max Supplies',
    thPrice: 'Price',
    thAvailable: 'Available',
    thAction: 'Action',
    btnCopyOrder: '📋 Copy Order',
    orderCopied: '📋 Copied to clipboard: Row #',
    orderFormat: (row, id, category, price, available) => 
      `Order: Row #${row} (ID #${id}) | ${category} | Price: ${price} | Available in stock: ${available}`,
    loadingAccounts: 'Loading accounts from Google Sheets...',
    noAccountsFound: 'No accounts found with current filters. Uncheck "In stock only" to view all rows.',
    
    // History
    historyTitle: 'Stock Change History',
    historyDesc: 'Real-time audit log of every stock increase or decrease detected in the availability column.',
    thTime: 'Time',
    thSheetRow: 'Sheet Row',
    thBefore: 'Before',
    thNew: 'New',
    thDiff: 'Diff',
    noHistory: 'No changes recorded yet since monitor started. Future updates will appear here automatically.',
    
    // Webhooks & API Settings
    settingsTitle: '⚙️ Webhook & API Integration',
    settingsDesc: 'Simulate webhooks for real-time Discord notifications or integrate live availability into your custom backend.',
    webhookTitle: '🔔 Discord Webhook',
    webhookDesc: 'Whenever the monitor detects that the <strong>Available</strong> column changes (e.g. new accounts added or sold out), an automated message is dispatched to your configured Discord channel.',
    discordUrlLabel: 'Discord Webhook URL',
    discordUrlHelp: 'Get this URL from your Discord server channel integrations settings.',
    pollIntervalLabel: 'Polling Interval (seconds)',
    pollIntervalHelp: 'How often Google Sheets is queried (recommended: 10 to 20 seconds).',
    btnSaveConfig: '💾 Save Configuration',
    btnTestWebhook: '🧪 Test Discord Webhook',
    configSaved: '✅ Configuration saved successfully',
    testSending: 'Sending test message to Discord...',
    testSuccess: '✅ Test message successfully delivered to your Discord channel!',
    testMissingUrl: '⚠️ Please enter a Discord Webhook URL first.',
    
    apiTitle: '🔌 API Endpoints',
    apiDesc: 'You can make <code>GET</code> or <code>POST</code> requests from your backend in Python, Node.js, PHP, or any programming language:',
    apiSimpleDesc: 'Returns directly the lightweight map with sheet row numbers and their available quantity:',
    apiPairsDesc: 'Returns an array of pairs <code>[[row, quantity], ...]</code>:',
    apiAccountsDesc: 'Returns the complete accounts database with static columns (build, supplies, price) and live stock.',
    apiSseDesc: 'Server-Sent Events (SSE) connection to receive real-time push events whenever stock changes without polling.',
    
    stockUpdatedToast: (count) => `🔔 Stock updated (${count} change(s))`
  },
  es: {
    pageBrowserTitle: 'LuckyCharm Accounts • Monitor de Disponibilidad OSRS',
    announcementText: 'Sincronización en tiempo real directa con Google Sheets • Actualizaciones de stock automáticas',
    siteTitle: 'LUCKY CHARM',
    siteSub: 'Monitor de Disponibilidad de Cuentas • Sincronización Google Sheets',
    live: 'En vivo',
    reconnecting: 'Reconectando...',
    soundOn: '🔊 Sonido activado',
    soundOff: '🔇 Sonido silenciado',
    refresh: 'Refrescar',
    refreshing: 'Consultando...',
    webhookApiBtn: '⚙️ Webhook & API',
    tabAccounts: '🛡️ Cuentas & Disponibilidad',
    tabHistory: '📜 Historial de Cambios',
    tabWebhooks: '⚙️ Configuración de Webhook & API',
    
    // Vista Principal
    pageTitle: 'Disponibilidad de Cuentas',
    heroDescription: 'Consulta en vivo las cuentas disponibles para compra y asignación inmediata en Old School RuneScape.',
    lastSync: 'Última sinc',
    accountsInStock: 'Cuentas con stock',
    totalUnits: 'Unidades Disponibles',
    sumStockLabel: 'Stock total acumulado',
    catalogedText: 'catalogadas',
    dataNotice: '<strong>Aviso de datos:</strong> Los datos de estadísticas, suministros y precios son estáticos. La columna <strong>Disponibles</strong> se actualiza periódicamente desde la hoja compartida de Google Sheets. Haz clic en <strong>Copiar Orden</strong> en cualquier fila para copiar el formato listo para negociar en Discord.',
    newStockAlert: '¡Nuevo stock detectado!',
    searchPlaceholder: 'Buscar por build, estadísticas (ej: 99 strength, 94 magic, barrows gloves), fila o ID...',
    inStockOnly: 'Solo en stock',
    allCategories: 'Todas las categorías',
    sortRowAsc: 'Ordenar: Fila Sheet (por defecto)',
    sortStockDesc: 'Ordenar: Mayor Disponibilidad',
    sortPriceDesc: 'Ordenar: Mayor Precio',
    sortPriceAsc: 'Ordenar: Menor Precio',
    thRow: 'Fila',
    thId: 'ID',
    thCategory: 'Categoría',
    thBuild: 'Build / Estadísticas / Quests',
    thSupplies: 'Max Supplies',
    thPrice: 'Precio',
    thAvailable: 'Disponibles',
    thAction: 'Acción',
    btnCopyOrder: '📋 Copiar Orden',
    orderCopied: '📋 Copiado al portapapeles: Fila #',
    orderFormat: (row, id, category, price, available) => 
      `Orden: Fila #${row} (ID #${id}) | ${category} | Precio: ${price} | Disponibles en stock: ${available}`,
    loadingAccounts: 'Cargando cuentas desde Google Sheets...',
    noAccountsFound: 'No se encontraron cuentas con los filtros actuales. Desmarca "Solo en stock" para ver todas las filas.',
    
    // Historial
    historyTitle: 'Historial de Cambios de Stock',
    historyDesc: 'Registro en tiempo real de cada incremento o reducción detectada en la columna de disponibilidad.',
    thTime: 'Hora',
    thSheetRow: 'Fila Sheet',
    thBefore: 'Antes',
    thNew: 'Nuevo',
    thDiff: 'Variación',
    noHistory: 'Aún no se han registrado cambios desde que el monitor inició. Los cambios futuros aparecerán aquí automáticamente.',
    
    // Configuración Webhooks & API
    settingsTitle: '⚙️ Integración de Webhook & API',
    settingsDesc: 'Simulación de webhooks para alertar a Discord o consultar la disponibilidad en vivo desde tu propio backend.',
    webhookTitle: '🔔 Discord Webhook',
    webhookDesc: 'Cada vez que el monitor detecta que la columna <strong>Available</strong> cambia (por ejemplo cuando se agregan cuentas o se agotan), se envía un mensaje automático al canal de Discord configurado.',
    discordUrlLabel: 'URL del Webhook de Discord',
    discordUrlHelp: 'Obtén esta URL en la configuración de integraciones de tu servidor de Discord.',
    pollIntervalLabel: 'Frecuencia de Sondeo (segundos)',
    pollIntervalHelp: 'Cada cuántos segundos se consulta Google Sheets (recomendado: 10 a 20 seg).',
    btnSaveConfig: '💾 Guardar Configuración',
    btnTestWebhook: '🧪 Probar Webhook en Discord',
    configSaved: '✅ Configuración guardada correctamente',
    testSending: 'Enviando mensaje de prueba a Discord...',
    testSuccess: '✅ ¡Mensaje de prueba recibido con éxito en tu canal de Discord!',
    testMissingUrl: '⚠️ Por favor ingresa primero la URL del Webhook de Discord.',
    
    apiTitle: '🔌 Endpoints de la API',
    apiDesc: 'Puedes hacer peticiones <code>GET</code> o <code>POST</code> desde tu backend en Python, Node.js, PHP o cualquier lenguaje:',
    apiSimpleDesc: 'Retorna directamente el mapa simple con solo los números de fila y su cantidad disponible:',
    apiPairsDesc: 'Retorna un array de pares <code>[[fila, cantidad], ...]</code>:',
    apiAccountsDesc: 'Retorna la base de datos completa de cuentas con datos estáticos (build, supplies, precio) y stock en vivo.',
    apiSseDesc: 'Conexión Server-Sent Events (SSE) para recibir eventos push en tiempo real cada vez que cambia el stock sin hacer polling.',
    
    stockUpdatedToast: (count) => `🔔 Stock actualizado (${count} cambio(s))`
  }
};

const state = {
  lang: localStorage.getItem('osrs_lang') || 'en', // DEFAULT: ENGLISH
  accounts: [],
  categories: [],
  changes: [],
  selectedCategory: 'All',
  searchQuery: '',
  onlyStock: true,
  sortBy: 'row_asc',
  soundEnabled: true,
  pollInterval: 15,
  countdownSeconds: 15,
  countdownTimer: null,
  eventSource: null
};

function t(key, ...args) {
  const dict = i18n[state.lang] || i18n.en;
  const val = dict[key];
  if (typeof val === 'function') {
    return val(...args);
  }
  return val || key;
}

// ========================================================
// Audio Alert (Web Audio API)
// ========================================================
let audioCtx = null;

function playStockAlertSound() {
  if (!state.soundEnabled) return;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(659.25, now);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  } catch (e) {
    console.warn('Audio:', e);
  }
}

// ========================================================
// Initialization
// ========================================================
document.addEventListener('DOMContentLoaded', () => {
  setupBottomTabs();
  setupUIEventListeners();
  applyLanguage(state.lang);
  fetchInitialData();
  fetchChangeHistory();
  setupSSE();
  startCountdown();
});

// ========================================================
// Language Switcher (Select Dropdown)
// ========================================================
function setLanguage(newLang) {
  if (newLang !== 'es' && newLang !== 'en') return;
  state.lang = newLang;
  localStorage.setItem('osrs_lang', newLang);
  applyLanguage(newLang);
}

function applyLanguage(lang) {
  document.documentElement.lang = lang;
  document.title = t('pageBrowserTitle');

  // Update language select element
  const langSelect = document.getElementById('langSelect');
  if (langSelect && langSelect.value !== lang) {
    langSelect.value = lang;
  }

  // Update all [data-i18n] elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const translation = t(key);
    if (translation) {
      if (
        key === 'dataNotice' || 
        key === 'webhookDesc' || 
        key === 'apiDesc' || 
        key === 'apiSimpleDesc' || 
        key === 'apiPairsDesc' || 
        key === 'apiAccountsDesc' || 
        key === 'apiSseDesc'
      ) {
        el.innerHTML = translation;
      } else {
        el.innerText = translation;
      }
    }
  });

  // Update placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    const translation = t(key);
    if (translation) {
      el.placeholder = translation;
    }
  });

  // Update sort dropdown texts
  const sortSelect = document.getElementById('selectSort');
  if (sortSelect && sortSelect.options.length >= 4) {
    sortSelect.options[0].text = t('sortRowAsc');
    sortSelect.options[1].text = t('sortStockDesc');
    sortSelect.options[2].text = t('sortPriceDesc');
    sortSelect.options[3].text = t('sortPriceAsc');
  }

  populateCategorySelect();
  renderAccounts();
  renderChanges();
  updateLivePill(true);
}

// ========================================================
// Bottom Tabs (Webhook, API, History)
// ========================================================
function setupBottomTabs() {
  const tabs = document.querySelectorAll('.bottom-tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.dataset.bottomTab;
      tabs.forEach(t => t.classList.toggle('active', t === tab));
      document.querySelectorAll('.bottom-tab-content').forEach(content => {
        content.style.display = content.id === targetId ? 'block' : 'none';
      });

      if (targetId === 'tab-discord-webhook') {
        loadWebhookConfig();
      }
    });
  });
}

// ========================================================
// Data Fetching
// ========================================================
async function fetchInitialData() {
  try {
    const res = await fetch('/api/accounts');
    const data = await res.json();
    state.accounts = data.accounts || [];

    const catSet = new Set(['All']);
    state.accounts.forEach(a => {
      if (a.category) catSet.add(a.category);
    });
    state.categories = Array.from(catSet);

    populateCategorySelect();
    renderAccounts();
    updateHeaderMeta();
  } catch (err) {
    showToast(`Error: ${err.message}`);
  }
}

async function fetchChangeHistory() {
  try {
    const res = await fetch('/api/changes');
    const data = await res.json();
    state.changes = data.changes || [];
    renderChanges();
    const countEl = document.getElementById('changesCount');
    if (countEl) countEl.innerText = state.changes.length;
  } catch {}
}

function populateCategorySelect() {
  const select = document.getElementById('selectCategory');
  if (!select) return;

  const currentVal = state.selectedCategory;
  select.innerHTML = `<option value="All">${t('allCategories')}</option>`;
  state.categories.forEach(cat => {
    if (cat === 'All') return;
    const opt = document.createElement('option');
    opt.value = cat;
    opt.innerText = cat;
    if (cat === currentVal) opt.selected = true;
    select.appendChild(opt);
  });
}

function updateHeaderMeta() {
  const inStock = state.accounts.filter(a => a.available > 0);
  const totalUnits = inStock.reduce((acc, curr) => acc + curr.available, 0);

  const syncEl = document.getElementById('metaLastSync');
  if (syncEl) syncEl.innerText = new Date().toLocaleTimeString();

  const inStockEl = document.getElementById('metaInStock');
  if (inStockEl) inStockEl.innerText = inStock.length;

  const inStockTotalEl = document.getElementById('metaInStockTotal');
  if (inStockTotalEl) inStockTotalEl.innerText = state.accounts.length;

  const totalUnitsEl = document.getElementById('metaTotalUnits');
  if (totalUnitsEl) totalUnitsEl.innerText = totalUnits;

  const countBadgeEl = document.getElementById('countStockBadge');
  if (countBadgeEl) countBadgeEl.innerText = inStock.length;
}

// ========================================================
// Render Accounts Table
// ========================================================
function renderAccounts() {
  const tbody = document.getElementById('accountsTableBody');
  if (!tbody) return;

  let filtered = state.accounts.filter(acc => {
    if (state.onlyStock && acc.available <= 0) return false;
    if (state.selectedCategory !== 'All' && acc.category !== state.selectedCategory) return false;

    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      const match = 
        acc.build.toLowerCase().includes(q) ||
        acc.supplies.toLowerCase().includes(q) ||
        acc.category.toLowerCase().includes(q) ||
        String(acc.row) === q ||
        String(acc.id) === q;
      if (!match) return false;
    }
    return true;
  });

  filtered.sort((a, b) => {
    if (state.sortBy === 'stock_desc') return b.available - a.available;
    if (state.sortBy === 'price_desc') {
      const pA = typeof a.price === 'number' ? a.price : 0;
      const pB = typeof b.price === 'number' ? b.price : 0;
      return pB - pA;
    }
    if (state.sortBy === 'price_asc') {
      const pA = typeof a.price === 'number' ? a.price : 0;
      const pB = typeof b.price === 'number' ? b.price : 0;
      return pA - pB;
    }
    return a.row - b.row;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="lcg-empty-row">
          ${t('noAccountsFound')}
        </td>
      </tr>
    `;
    return;
  }

  const rowLabel = state.lang === 'en' ? 'Row' : 'Fila';

  tbody.innerHTML = filtered.map(acc => {
    const inStock = acc.available > 0;

    return `
      <tr class="${inStock ? 'row-in-stock' : ''}">
        <td style="text-align: center;">
          <span class="badge-sheet-row" title="Google Sheets ${rowLabel}">${rowLabel} ${acc.row}</span>
        </td>
        <td style="text-align: center;">
          <span class="badge-id">#${acc.id}</span>
        </td>
        <td>
          <span class="cat-text">${escapeHtml(acc.category)}</span>
        </td>
        <td>
          <div class="build-desc">${escapeHtml(acc.build)}</div>
        </td>
        <td>
          <span class="supplies-val">${escapeHtml(acc.supplies || 'N/A')}</span>
        </td>
        <td>
          <span class="price-val">${escapeHtml(acc.priceFormatted)}</span>
        </td>
        <td style="text-align: center;">
          <span class="stock-pill ${inStock ? 'in-stock' : 'out-stock'}">
            ${acc.available}
          </span>
        </td>
        <td style="text-align: center;">
          <button 
            class="btn-order-copy" 
            onclick="copyOrder(${acc.row}, ${acc.id}, '${escapeQuote(acc.category)}', ${acc.available}, '${escapeQuote(acc.priceFormatted)}')"
            title="${t('btnCopyOrder')}"
          >
            ${t('btnCopyOrder')}
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// ========================================================
// Render Change History
// ========================================================
function renderChanges() {
  const tbody = document.getElementById('changesTableBody');
  if (!tbody) return;

  if (state.changes.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="lcg-empty-row">
          ${t('noHistory')}
        </td>
      </tr>
    `;
    return;
  }

  const rowLabel = state.lang === 'en' ? 'Row' : 'Fila';

  tbody.innerHTML = state.changes.map(ch => {
    const timeStr = ch.timestamp ? new Date(ch.timestamp).toLocaleTimeString() : '--';
    const isGain = ch.diff > 0;
    const diffColor = isGain ? 'var(--lcg-green)' : 'var(--lcg-red)';
    const diffSign = isGain ? `+${ch.diff}` : `${ch.diff}`;

    return `
      <tr>
        <td><span class="font-mono" style="font-size: 11.5px;">${timeStr}</span></td>
        <td style="text-align: center;"><span class="badge-sheet-row">${rowLabel} ${ch.row}</span></td>
        <td><strong class="text-gold">${escapeHtml(ch.category)}</strong></td>
        <td><span class="build-desc">${escapeHtml(ch.build ? ch.build.substring(0, 110) + '...' : '')}</span></td>
        <td style="text-align: center;">${ch.oldAvailable}</td>
        <td style="text-align: center;"><strong>${ch.newAvailable}</strong></td>
        <td style="text-align: center; color: ${diffColor}; font-weight: 800;">${diffSign}</td>
      </tr>
    `;
  }).join('');
}

// ========================================================
// Server-Sent Events (SSE) Live Connection
// ========================================================
function setupSSE() {
  if (state.eventSource) state.eventSource.close();

  const sse = new EventSource('/api/stream');
  state.eventSource = sse;

  sse.addEventListener('open', () => updateLivePill(true));
  sse.addEventListener('connected', () => updateLivePill(true));

  sse.addEventListener('stock_change', (e) => {
    try {
      const payload = JSON.parse(e.data);
      const changes = payload.changes || [];
      handleStockChange(changes);
    } catch (err) {
      console.error(err);
    }
  });

  sse.onerror = () => updateLivePill(false);
}

function updateLivePill(online) {
  const pill = document.getElementById('livePill');
  const txt = document.getElementById('liveText');
  if (!pill || !txt) return;

  if (online) {
    pill.style.borderColor = 'rgba(32, 212, 32, 0.35)';
    pill.style.color = 'var(--lcg-green)';
    txt.innerText = `${t('live')} (${state.countdownSeconds}s)`;
  } else {
    pill.style.borderColor = 'rgba(255, 77, 77, 0.35)';
    pill.style.color = 'var(--lcg-red)';
    txt.innerText = t('reconnecting');
  }
}

function handleStockChange(changes) {
  if (!changes || changes.length === 0) return;

  for (const ch of changes) {
    const acc = state.accounts.find(a => a.row === ch.row);
    if (acc) {
      acc.available = ch.newAvailable;
    }
    state.changes.unshift(ch);
  }

  if (state.changes.length > 100) state.changes = state.changes.slice(0, 100);

  if (changes.some(c => c.diff > 0)) {
    playStockAlertSound();
  }

  const first = changes[0];
  const sign = first.diff > 0 ? `+${first.diff}` : `${first.diff}`;
  const banner = document.getElementById('liveStockBanner');
  const bannerText = document.getElementById('liveAlertText');
  const rowLabel = state.lang === 'en' ? 'Row' : 'Fila';

  if (banner && bannerText) {
    bannerText.innerText = `${t('newStockAlert')} ${rowLabel} #${first.row} (${first.category}): ${sign} (${first.newAvailable})`;
    banner.style.display = 'flex';
  }

  renderAccounts();
  renderChanges();
  updateHeaderMeta();
  const countEl = document.getElementById('changesCount');
  if (countEl) countEl.innerText = state.changes.length;
  showToast(t('stockUpdatedToast', changes.length));
}

// ========================================================
// Polling Countdown Timer
// ========================================================
function startCountdown() {
  if (state.countdownTimer) clearInterval(state.countdownTimer);

  state.countdownSeconds = state.pollInterval;
  state.countdownTimer = setInterval(() => {
    state.countdownSeconds--;
    if (state.countdownSeconds <= 0) {
      state.countdownSeconds = state.pollInterval;
      syncSilent();
    }
    updateLivePill(true);
  }, 1000);
}

async function syncSilent() {
  try {
    const res = await fetch('/api/availability?format=simple');
    const data = await res.json();
    if (data) {
      for (const acc of state.accounts) {
        if (data[acc.row] !== undefined) {
          acc.available = data[acc.row];
        }
      }
      renderAccounts();
      updateHeaderMeta();
    }
  } catch {}
}

// ========================================================
// Webhook Settings
// ========================================================
async function loadWebhookConfig() {
  try {
    const res = await fetch('/api/config');
    const data = await res.json();
    document.getElementById('inputDiscordUrl').value = data.discordWebhookUrl || '';
    document.getElementById('inputPollInterval').value = data.pollIntervalSeconds || 15;
  } catch {}
}

async function saveWebhookConfig() {
  const discordUrl = document.getElementById('inputDiscordUrl').value.trim();
  const pollInterval = parseInt(document.getElementById('inputPollInterval').value, 10) || 15;

  try {
    const res = await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        discordWebhookUrl: discordUrl,
        pollIntervalSeconds: pollInterval
      })
    });
    const data = await res.json();
    if (data.success) {
      state.pollInterval = pollInterval;
      state.countdownSeconds = pollInterval;
      showToast(t('configSaved'));
    }
  } catch (err) {
    showToast(`Error: ${err.message}`);
  }
}

async function testDiscordWebhook() {
  const discordUrl = document.getElementById('inputDiscordUrl').value.trim();
  const msgEl = document.getElementById('webhookTestMsg');

  if (!discordUrl) {
    msgEl.className = 'lcg-feedback-msg error';
    msgEl.innerText = t('testMissingUrl');
    msgEl.style.display = 'block';
    return;
  }

  msgEl.className = 'lcg-feedback-msg';
  msgEl.innerText = t('testSending');
  msgEl.style.display = 'block';

  try {
    const res = await fetch('/api/webhooks/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: discordUrl })
    });
    const data = await res.json();
    if (data.success) {
      msgEl.className = 'lcg-feedback-msg success';
      msgEl.innerText = t('testSuccess');
    } else {
      msgEl.className = 'lcg-feedback-msg error';
      msgEl.innerText = `❌ Error: ${data.error}`;
    }
  } catch (err) {
    msgEl.className = 'lcg-feedback-msg error';
    msgEl.innerText = `❌ Error: ${err.message}`;
  }
}

// ========================================================
// Copy Order Action
// ========================================================
window.copyOrder = function(row, id, category, available, price) {
  const text = t('orderFormat', row, id, category, price, available);
  navigator.clipboard.writeText(text).then(() => {
    showToast(`${t('orderCopied')}${row}`);
  }).catch(() => {
    showToast(`Row #${row}`);
  });
};

function setupUIEventListeners() {
  // Language Select Dropdown Listener
  const langSelect = document.getElementById('langSelect');
  if (langSelect) {
    langSelect.addEventListener('change', (e) => {
      setLanguage(e.target.value);
    });
  }

  // Search input
  const searchInput = document.getElementById('searchInput');
  const btnClear = document.getElementById('btnClearSearch');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.trim();
      if (btnClear) btnClear.style.display = state.searchQuery ? 'block' : 'none';
      renderAccounts();
    });
  }

  if (btnClear) {
    btnClear.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      state.searchQuery = '';
      btnClear.style.display = 'none';
      renderAccounts();
    });
  }

  // Toggle in stock only
  const toggleStock = document.getElementById('toggleOnlyStock');
  if (toggleStock) {
    toggleStock.addEventListener('change', (e) => {
      state.onlyStock = e.target.checked;
      renderAccounts();
    });
  }

  // Category select
  const selectCat = document.getElementById('selectCategory');
  if (selectCat) {
    selectCat.addEventListener('change', (e) => {
      state.selectedCategory = e.target.value;
      renderAccounts();
    });
  }

  // Sort select
  const selectSort = document.getElementById('selectSort');
  if (selectSort) {
    selectSort.addEventListener('change', (e) => {
      state.sortBy = e.target.value;
      renderAccounts();
    });
  }

  // Refresh icon button
  const btnSync = document.getElementById('btnSyncNow');
  if (btnSync) {
    btnSync.addEventListener('click', async () => {
      btnSync.classList.add('spinning');
      btnSync.disabled = true;
      try {
        const res = await fetch('/api/poll', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          showToast(`✅ ${t('live')}: ${data.availableCount} stock`);
          await fetchInitialData();
          await fetchChangeHistory();
          state.countdownSeconds = state.pollInterval;
        }
      } catch (err) {
        showToast(`Error: ${err.message}`);
      } finally {
        setTimeout(() => {
          btnSync.classList.remove('spinning');
          btnSync.disabled = false;
        }, 500);
      }
    });
  }

  // Webhook action buttons
  const btnSaveWebhook = document.getElementById('btnSaveWebhookConfig');
  if (btnSaveWebhook) btnSaveWebhook.addEventListener('click', saveWebhookConfig);

  const btnTestWebhook = document.getElementById('btnTestDiscordWebhook');
  if (btnTestWebhook) btnTestWebhook.addEventListener('click', testDiscordWebhook);
}

function showToast(msg) {
  const toast = document.getElementById('wikiToast');
  if (!toast) return;
  toast.innerText = msg;
  toast.style.display = 'block';
  setTimeout(() => {
    toast.style.display = 'none';
  }, 3000);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeQuote(str) {
  if (!str) return '';
  return String(str).replace(/'/g, "\\'");
}

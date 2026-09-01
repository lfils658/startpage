function checkViewport() {
  if (window.innerWidth > window.innerHeight) {
    document.body.style.backgroundImage = "url('https://picsum.photos/1280/720/')";
  } else {
    document.body.style.backgroundImage = "url('https://picsum.photos/720/1280/')";
  }
}

window.addEventListener('load', checkViewport);

function updateClock() {
  const now = new Date();

  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  document.getElementById('time').textContent = `${hours}:${minutes}:${seconds}`;

  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];

  const dayName = days[now.getDay()];
  const monthName = months[now.getMonth()];
  const dateNum = String(now.getDate()).padStart(2, '0');
  const year = now.getFullYear();

  document.getElementById('date').textContent = `${dayName}, ${monthName} ${dateNum}, ${year}`;
}

updateClock();
setInterval(updateClock, 1000);

function updateTimeOfDay() {
  const tod = document.getElementById('tod');
  const hour = new Date().getHours();

  let label;
  if (hour >= 5 && hour < 12) {
    label = 'morning!';
  } else if (hour >= 12 && hour < 18) {
    label = 'afternoon';
  } else {
    label = 'evening.';
  }

  tod.textContent = label;
}

updateTimeOfDay();
setInterval(updateTimeOfDay, 60000);

const outputDiv = document.getElementById('weather-output');
const DEFAULT_LAT = 40.7128;
const DEFAULT_LON = -74.0060;
const DEFAULT_LABEL = 'New York (Fallback)';

const weatherCodes = {
  0: 'Clear', 1: 'Mostly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
  45: 'Fog', 48: 'Depositing Rime Fog', 51: 'Light Drizzle', 53: 'Moderate Drizzle',
  55: 'Dense Drizzle', 56: 'Light Freezing Drizzle', 57: 'Dense Freezing Drizzle',
  61: 'Slight Rain', 63: 'Moderate Rain', 65: 'Heavy Rain', 66: 'Light Freezing Rain',
  67: 'Heavy Freezing Rain', 71: 'Slight Snow Fall', 73: 'Moderate Snow Fall',
  75: 'Heavy Snow Fall', 77: 'Snow Grains', 80: 'Slight Rain Showers',
  81: 'Moderate Rain Showers', 82: 'Violent Rain Showers', 85: 'Slight Snow Showers',
  86: 'Heavy Snow Showers', 95: 'Thunderstorm', 96: 'Thunderstorm with Slight Hail',
  99: 'Thunderstorm with Heavy Hail'
};

async function fetchWeather(lat, lon, locationLabel) {
  try {
    outputDiv.innerText = `Fetching weather for ${locationLabel}...`;

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&temperature_unit=fahrenheit&precipitation_unit=inch&timezone=auto&_nocache=${Date.now()}`;

    const response = await fetch(url, { method: 'GET', mode: 'cors' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    const current = data.current;
    const weatherDesc = weatherCodes[current.weather_code] || `Code ${current.weather_code}`;

    outputDiv.innerText = `Conditions for ${locationLabel}: ${current.temperature_2m}°F ${weatherDesc}`;
  } catch (error) {
    outputDiv.innerText = `API Error: ${error.message}. Your browser or extension is blocking outbound requests.`;
  }
}

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      fetchWeather(lat, lon, `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`);
    },
    (error) => {
      console.warn('Geolocation denied/failed, using fallback.', error);
      fetchWeather(DEFAULT_LAT, DEFAULT_LON, DEFAULT_LABEL);
    },
    { timeout: 4000 }
  );
} else {
  fetchWeather(DEFAULT_LAT, DEFAULT_LON, DEFAULT_LABEL);
}

const bookmarkCookieName = 'cfe_csvFormData';
const searchEngineCookieName = 'cfe_selectedSearchEngine';
const searchEngines = {
  Google: 'https://www.google.com/search?q=',
  DuckDuckGo: 'https://duckduckgo.com/?q=',
  Bing: 'https://www.bing.com/search?q='
};

let records = [];
let matches = [];
let selectedIndex = -1;

const searchInput = document.getElementById('searchInput');
const searchStatus = document.getElementById('status');
const results = document.getElementById('results');

function setSearchStatus(message) {
  if (searchStatus) {
    searchStatus.textContent = message;
  }
}

function getCookie(name) {
  const cookies = document.cookie ? document.cookie.split('; ') : [];

  for (const cookie of cookies) {
    const separator = cookie.indexOf('=');

    if (separator === -1) {
      continue;
    }

    const key = cookie.substring(0, separator);
    const value = cookie.substring(separator + 1);

    if (key === name) {
      return decodeURIComponent(value);
    }
  }

  return null;
}

function getSelectedSearchEngine() {
  const savedEngine = getCookie(searchEngineCookieName);
  return Object.prototype.hasOwnProperty.call(searchEngines, savedEngine)
    ? savedEngine
    : 'Google';
}

function isLikelyUrl(value) {
  const trimmed = value.trim();

  if (!trimmed || /\s/.test(trimmed)) {
    return false;
  }

  if (/^(?:[a-z][a-z0-9+.-]*:\/\/)/i.test(trimmed)) {
    return true;
  }

  return /^(?:localhost|127(?:\.\d{1,3}){3}|(?:[a-z0-9-]+\.)+[a-z]{2,})(?::\d+)?(?:[/?#].*)?$/i.test(trimmed);
}

function normalizeUrl(value) {
  const trimmed = value.trim();

  if (!trimmed) {
    return '';
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

function openUrl(value) {
  const url = normalizeUrl(value);
  if (url) {
    window.open(url, '_self');
  }
}

function openSearch(query) {
  if (isLikelyUrl(query)) {
    openUrl(query);
    return;
  }

  const engine = getSelectedSearchEngine();
  const url = (searchEngines[engine] || searchEngines.Google) + encodeURIComponent(query);
  window.open(url, '_self');
}

function loadRecordsFromCookie() {
  const savedData = getCookie(bookmarkCookieName);

  if (!savedData) {
    records = [];
    searchInput.disabled = false;
    setSearchStatus('No saved bookmarks found.');
    return;
  }

  try {
    const rows = JSON.parse(savedData);

    if (!Array.isArray(rows)) {
      throw new Error('Saved bookmark data is not an array.');
    }

    records = rows
      .filter(item => item && (item.name || item.altName || item.url))
      .map(item => ({
        NAME: String(item.name || '').trim(),
        ALTNAME: String(item.altName || '').trim(),
        URL: String(item.url || '').trim()
      }))
      .filter(record => record.NAME || record.ALTNAME || record.URL);

    searchInput.disabled = false;
    setSearchStatus(
      `${records.length} saved bookmark${records.length === 1 ? '' : 's'} loaded.`
    );
  } catch (error) {
    records = [];
    setSearchStatus('Could not load saved bookmarks.');
  }
}

if (searchInput) {
  loadRecordsFromCookie();

  searchInput.addEventListener('input', updateResults);

  searchInput.addEventListener('keydown', event => {
    const query = searchInput.value.trim();

    if (!query) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();

      if (selectedIndex < matches.length) {
        selectedIndex++;
      } else {
        selectedIndex = 0;
      }

      updateSelection();
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();

      if (selectedIndex > 0) {
        selectedIndex--;
      } else {
        selectedIndex = matches.length;
      }

      updateSelection();
      return;
    }

    if (event.key === 'Tab') {
      if (matches.length > 0) {
        event.preventDefault();

        const index = selectedIndex >= 0 && selectedIndex < matches.length
          ? selectedIndex
          : 0;

        searchInput.value = matches[index].NAME;
        updateResults();
      }

      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();

      if (isLikelyUrl(query)) {
        openUrl(query);
        return;
      }

      if (selectedIndex === matches.length) {
        openSearch(query);
        return;
      }

      if (selectedIndex >= 0 && matches[selectedIndex]) {
        openRecord(matches[selectedIndex]);
        return;
      }

      if (matches.length > 0) {
        openRecord(matches[0]);
      } else {
        openSearch(query);
      }
    }
  });
}

function updateResults() {
  const query = searchInput.value.trim().toLowerCase();

  selectedIndex = -1;

  if (!query) {
    matches = [];
    results.innerHTML = '';
    setSearchStatus(`${records.length} saved bookmark${records.length === 1 ? '' : 's'} loaded.`);
    return;
  }

  matches = records.filter(record =>
    (record.NAME || '').toLowerCase().includes(query) ||
    (record.ALTNAME || '').toLowerCase().includes(query)
  );

  results.innerHTML = matches.map((record, index) => `
    <div class="result" data-index="${index}">
      <strong>${escapeHTML(record.NAME || record.ALTNAME || 'Untitled')}</strong>
      ${record.ALTNAME ? ` - ${escapeHTML(record.ALTNAME)}` : ''}
    </div>
  `).join('');

  const engineName = getSelectedSearchEngine();
  const directUrlQuery = searchInput.value.trim();
  const urlActionLabel = isLikelyUrl(directUrlQuery) ? 'Open URL' : `Search ${engineName}`;

  results.innerHTML += `
    <div class="result duck-result" data-index="${matches.length}">
      ${escapeHTML(directUrlQuery)} - ${escapeHTML(urlActionLabel)}
    </div>
  `;

  setSearchStatus(
    `${matches.length} match${matches.length === 1 ? '' : 'es'} found.`
  );

  document.querySelectorAll('.result').forEach(result => {
    const index = Number(result.dataset.index);

    result.addEventListener('mouseenter', () => {
      selectedIndex = index;
      updateSelection();
    });

    result.addEventListener('click', event => {
      event.preventDefault();
      selectedIndex = index;
      openSelectedResult();
    });
  });
}

function updateSelection() {
  document.querySelectorAll('.result').forEach((result, index) => {
    result.classList.toggle('selected', index === selectedIndex);
  });
}

function openSelectedResult() {
  const query = searchInput.value.trim();

  if (isLikelyUrl(query)) {
    openUrl(query);
  } else if (selectedIndex === matches.length) {
    openSearch(query);
  } else if (matches[selectedIndex]) {
    openRecord(matches[selectedIndex]);
  }
}

function openRecord(record) {
  if (record.URL) {
    const url = normalizeUrl(record.URL);
    if (url) {
      window.open(url, '_self');
      return;
    }
  }

  openSearch(record.NAME || record.ALTNAME || '');
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[character]));
}

const formRows = document.getElementById('cfe-form-rows');
const csvOutput = document.getElementById('cfe-csv-output');
const bookmarkStatus = document.getElementById('cfe-status');
const searchEngine = document.getElementById('cfe-search-engine');
const searchForm = document.getElementById('cfe-search-form');

const cookieLifetime = 60 * 60 * 24 * 30;

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeCsv(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function addRow(name = '', altName = '', url = '') {
  const row = document.createElement('div');
  row.className = 'cfe-row';

  row.innerHTML = `
    <input
      class="cfe-name cfe-input"
      type="text"
      placeholder="NAME"
      value="${escapeHtml(name)}"
    >

    <input
      class="cfe-altname cfe-input"
      type="text"
      placeholder="ALTNAME"
      value="${escapeHtml(altName)}"
    >

    <input
      class="cfe-url cfe-input"
      type="url"
      placeholder="URL"
      value="${escapeHtml(url)}"
    >

    <button
      type="button"
      class="cfe-remove-button cfe-button">
      Remove
    </button>
  `;

  row.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', () => {
      updateCsv();
      saveBookmarks();
    });
  });

  row.querySelector('.cfe-remove-button').addEventListener('click', () => {
    row.remove();

    if (document.querySelectorAll('.cfe-row').length === 0) {
      addRow();
    }

    updateCsv();
    saveBookmarks();
  });

  formRows.appendChild(row);
}

function getFormData() {
  return [...document.querySelectorAll('.cfe-row')].map(row => ({
    name: row.querySelector('.cfe-name').value,
    altName: row.querySelector('.cfe-altname').value,
    url: row.querySelector('.cfe-url').value
  }));
}

function updateCsv() {
  const lines = ['NAME,ALTNAME,URL'];

  getFormData().forEach(item => {
    lines.push([
      escapeCsv(item.name),
      escapeCsv(item.altName),
      escapeCsv(item.url)
    ].join(','));
  });

  csvOutput.value = lines.join('\n');
}

function setCookie(name, value) {
  document.cookie =
    `${name}=${encodeURIComponent(value)}; ` +
    `path=/; max-age=${cookieLifetime}; SameSite=Lax`;
}

function getCookieBookmark(name) {
  const cookies = document.cookie.split('; ');

  for (const cookie of cookies) {
    const separator = cookie.indexOf('=');

    if (separator === -1) {
      continue;
    }

    const key = cookie.substring(0, separator);
    const value = cookie.substring(separator + 1);

    if (key === name) {
      return decodeURIComponent(value);
    }
  }

  return null;
}

function deleteCookie(name) {
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

function saveBookmarks() {
  const data = JSON.stringify(getFormData());

  setCookie(bookmarkCookieName, data);
  if (bookmarkStatus) {
    bookmarkStatus.textContent = 'Bookmarks saved';
  }
}

function loadBookmarks() {
  const savedData = getCookieBookmark(bookmarkCookieName);

  if (!savedData) {
    addRow();
    updateCsv();
    return;
  }

  try {
    const rows = JSON.parse(savedData);

    if (Array.isArray(rows) && rows.length > 0) {
      rows.forEach(item => {
        addRow(item.name || '', item.altName || '', item.url || '');
      });
    } else {
      addRow();
    }

    updateCsv();
    if (bookmarkStatus) {
      bookmarkStatus.textContent = 'Bookmarks loaded';
    }
  } catch {
    addRow();
    updateCsv();
    if (bookmarkStatus) {
      bookmarkStatus.textContent = 'Could not load bookmarks';
    }
  }
}

function saveSearchEngine() {
  setCookie(searchEngineCookieName, searchEngine.value);
  if (bookmarkStatus) {
    bookmarkStatus.textContent = 'Search engine saved';
  }
}

function loadSearchEngine() {
  const savedSearchEngine = getCookieBookmark(searchEngineCookieName);

  if (!savedSearchEngine) {
    return;
  }

  const optionExists = [...searchEngine.options].some(option => option.value === savedSearchEngine);

  if (optionExists) {
    searchEngine.value = savedSearchEngine;
  }
}

function clearAll() {
  formRows.innerHTML = '';
  deleteCookie(bookmarkCookieName);
  addRow();
  updateCsv();

  if (bookmarkStatus) {
    bookmarkStatus.textContent = 'Bookmarks cleared';
  }
}

if (formRows && csvOutput && bookmarkStatus && searchEngine && searchForm) {
  document.getElementById('cfe-add-row-button').addEventListener('click', () => {
    addRow();
    updateCsv();
    saveBookmarks();
  });

  document.getElementById('cfe-save-button').addEventListener('click', saveBookmarks);
  document.getElementById('cfe-clear-button').addEventListener('click', clearAll);

  searchEngine.addEventListener('change', saveSearchEngine);

  searchForm.addEventListener('submit', event => {
    event.preventDefault();
    saveSearchEngine();
  });

  loadSearchEngine();
  loadBookmarks();
}

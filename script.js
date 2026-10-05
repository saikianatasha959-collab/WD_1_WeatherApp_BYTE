// Weatherline — fetches current weather + forecast from the OpenWeather API.
// Current weather docs: https://openweathermap.org/current
// 5 day / 3 hour forecast docs: https://openweathermap.org/forecast5

const STORAGE_KEY = 'weatherline_api_key';

const els = {
  card: document.getElementById('card'),
  form: document.getElementById('search-form'),
  input: document.getElementById('city-input'),
  idle: document.getElementById('state-idle'),
  loading: document.getElementById('state-loading'),
  error: document.getElementById('state-error'),
  errorMessage: document.getElementById('error-message'),
  result: document.getElementById('state-result'),
  city: document.getElementById('result-city'),
  condition: document.getElementById('result-condition'),
  caption: document.getElementById('result-caption'),
  temp: document.getElementById('result-temp'),
  humidity: document.getElementById('result-humidity'),
  wind: document.getElementById('result-wind'),
  pressure: document.getElementById('result-pressure'),
  updated: document.getElementById('result-updated'),
  toggleDay: document.getElementById('toggle-day'),
  toggleWeek: document.getElementById('toggle-week'),
  forecastStrip: document.getElementById('forecast-strip'),
  keyToggle: document.getElementById('key-toggle'),
  keyPanel: document.getElementById('key-panel'),
  keyInput: document.getElementById('api-key-input'),
  keySave: document.getElementById('key-save'),
};

let lastForecastList = null; // raw 3-hour forecast entries, cached per search
let currentMode = 'day';

function getApiKey() {
  return localStorage.getItem(STORAGE_KEY) || '';
}

function setApiKey(key) {
  localStorage.setItem(STORAGE_KEY, key);
}

function showState(name) {
  ['idle', 'loading', 'error', 'result'].forEach((s) => {
    els[s].hidden = s !== name;
  });
}

function formatWind(speedMs) {
  const kmh = speedMs * 3.6;
  return `${Math.round(kmh)} km/h`;
}

// Maps an OpenWeather condition group + day/night flag to a mood key
// used to pick the card's gradient and caption.
function moodFromWeather(main, icon) {
  const isNight = icon && icon.endsWith('n');
  switch (main) {
    case 'Clear': return isNight ? 'clear-night' : 'clear-day';
    case 'Clouds': return 'clouds';
    case 'Rain':
    case 'Drizzle': return 'rain';
    case 'Thunderstorm': return 'thunder';
    case 'Snow': return 'snow';
    case 'Mist':
    case 'Haze':
    case 'Fog': return 'mist';
    default: return 'clouds';
  }
}

const CAPTIONS = {
  'clear-day': 'Good day for sunglasses.',
  'clear-night': 'Clear skies for stargazing.',
  clouds: 'A bit of cover overhead today.',
  rain: 'Grab an umbrella on your way out.',
  thunder: 'Stay indoors if you can.',
  snow: 'Bundle up out there.',
  mist: 'Visibility is a little low today.',
};

async function fetchWeather(city) {
  const apiKey = getApiKey();

  if (!apiKey) {
    showState('error');
    els.errorMessage.textContent = 'Add your OpenWeather API key below to start searching.';
    els.keyPanel.hidden = false;
    return;
  }

  showState('loading');

  try {
    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`;
    const currentRes = await fetch(currentUrl);

    if (currentRes.status === 404) {
      showState('error');
      els.errorMessage.textContent = `We couldn't find "${city}". Check the spelling and try again.`;
      return;
    }

    if (currentRes.status === 401) {
      showState('error');
      els.errorMessage.textContent = 'That API key was rejected. Double-check it below (new keys can take a few minutes to activate).';
      els.keyPanel.hidden = false;
      return;
    }

    if (!currentRes.ok) {
      showState('error');
      els.errorMessage.textContent = 'Something went wrong reaching the weather service. Please try again.';
      return;
    }

    const current = await currentRes.json();

    // Fetch the 5-day/3-hour forecast using the same coordinates for consistency.
    const { lat, lon } = current.coord;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    const forecastRes = await fetch(forecastUrl);
    const forecast = forecastRes.ok ? await forecastRes.json() : null;

    lastForecastList = forecast ? forecast.list : null;
    renderResult(current);
    renderForecast(currentMode);
  } catch (err) {
    showState('error');
    els.errorMessage.textContent = 'Network error — check your connection and try again.';
  }
}

function renderResult(data) {
  const main = data.weather[0].main;
  const icon = data.weather[0].icon;
  const mood = moodFromWeather(main, icon);

  els.card.dataset.mood = mood;
  els.city.textContent = `${data.name}, ${data.sys.country}`;
  els.condition.textContent = data.weather[0].description;
  els.caption.textContent = CAPTIONS[mood] || '';
  els.temp.textContent = Math.round(data.main.temp);
  els.humidity.textContent = `${data.main.humidity}%`;
  els.wind.textContent = formatWind(data.wind.speed);
  els.pressure.textContent = `${data.main.pressure} hPa`;

  const now = new Date();
  els.updated.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  showState('result');
}

function renderForecast(mode) {
  els.forecastStrip.innerHTML = '';
  if (!lastForecastList) return;

  if (mode === 'day') {
    // Next 8 entries = next 24 hours (3-hour steps)
    lastForecastList.slice(0, 8).forEach((entry) => {
      const time = new Date(entry.dt * 1000).toLocaleTimeString([], { hour: 'numeric' });
      addForecastItem(time, entry.weather[0].icon, Math.round(entry.main.temp));
    });
  } else {
    // Group by calendar date, take the midday-ish reading for each of the next 5 days
    const byDate = {};
    lastForecastList.forEach((entry) => {
      const date = entry.dt_txt.split(' ')[0];
      if (!byDate[date]) byDate[date] = [];
      byDate[date].push(entry);
    });

    Object.keys(byDate).slice(0, 5).forEach((date) => {
      const entries = byDate[date];
      const midday = entries.find((e) => e.dt_txt.includes('12:00:00')) || entries[Math.floor(entries.length / 2)];
      const label = new Date(date).toLocaleDateString([], { weekday: 'short' });
      addForecastItem(label, midday.weather[0].icon, Math.round(midday.main.temp));
    });
  }
}

function addForecastItem(label, icon, temp) {
  const item = document.createElement('div');
  item.className = 'forecast-item';
  item.innerHTML = `
    <p class="forecast-item__label">${label}</p>
    <img class="forecast-item__icon" src="https://openweathermap.org/img/wn/${icon}.png" alt="">
    <p class="forecast-item__temp">${temp}&deg;</p>
  `;
  els.forecastStrip.appendChild(item);
}

els.form.addEventListener('submit', (e) => {
  e.preventDefault();
  const city = els.input.value.trim();
  if (city) fetchWeather(city);
});

els.toggleDay.addEventListener('click', () => setMode('day'));
els.toggleWeek.addEventListener('click', () => setMode('week'));

function setMode(mode) {
  currentMode = mode;
  els.toggleDay.classList.toggle('is-active', mode === 'day');
  els.toggleWeek.classList.toggle('is-active', mode === 'week');
  els.toggleDay.setAttribute('aria-selected', mode === 'day');
  els.toggleWeek.setAttribute('aria-selected', mode === 'week');
  renderForecast(mode);
}

els.keyToggle.addEventListener('click', () => {
  els.keyPanel.hidden = !els.keyPanel.hidden;
  if (!els.keyPanel.hidden) els.keyInput.value = getApiKey();
});

els.keySave.addEventListener('click', () => {
  setApiKey(els.keyInput.value.trim());
  els.keyPanel.hidden = true;
});

if (getApiKey()) els.keyInput.value = getApiKey();

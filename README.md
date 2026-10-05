# 🌤️ Weatherline

**Current conditions, anywhere.** Weatherline is a small, dependency-free weather web app. Search any city and get the current temperature, a day or week forecast, and key stats, all on a card whose colors change with the weather.

Built with plain HTML, CSS and JavaScript. No frameworks, no build step. Powered by the [OpenWeather API](https://openweathermap.org/api).

<p align="center">
  <img src="screenshots/clear-day.png" alt="Weatherline showing clear weather in Amritsar" width="300">
</p>

---

## ✨ Features

- 🔍 **City search**: look up current weather for any city in the world
- 🎨 **Mood-based design**: the card gradient and caption change with the weather (clear day, clear night, clouds, rain, thunderstorm, snow, mist)
- 🕒 **Day / Week toggle**: next 24 hours in 3-hour steps, or a 5-day outlook
- 📊 **At-a-glance stats**: humidity, wind speed (km/h) and pressure (hPa)
- 🔑 **Bring your own API key**: saved only in your browser's `localStorage`
- ⚠️ **Friendly states**: idle, loading, and clear error messages for unknown cities, bad API keys and network failures
- ♿ **Accessible**: semantic HTML, ARIA roles for the toggle, visible focus styles, visually hidden form labels
- 📱 **Responsive**: works from phones to desktops

## 🚀 Getting Started

### 1. Get a free API key

Sign up at [openweathermap.org/api](https://openweathermap.org/api) and copy your key. New keys can take a few minutes to activate.

### 2. Run the app

```bash
git clone https://github.com/<your-username>/weatherline.git
cd weatherline
```

Then open `index.html` in your browser. No install or build step is needed.

Prefer a local server? Any static server works:

```bash
# Python
python3 -m http.server 8000

# or Node
npx serve .
```

### 3. Add your key

Click **API key settings** at the bottom of the card, paste your OpenWeather key, and hit **Save key**. Then search for a city.

## 🧠 How It Works

1. On search, the app calls the [Current Weather](https://openweathermap.org/current) endpoint with the city name (metric units).
2. It uses the returned coordinates to call the [5 day / 3 hour Forecast](https://openweathermap.org/forecast5) endpoint, so both results refer to the same place.
3. **Day** view shows the next 8 forecast entries (24 hours). **Week** view groups entries by date and picks the midday reading for each of the next 5 days.
4. The weather group and day/night flag from the API pick a "mood", which sets the card gradient and the caption.

### Weather moods

| Condition | Mood | Caption |
| --- | --- | --- |
| Clear (day) | `clear-day` | Good day for sunglasses. |
| Clear (night) | `clear-night` | Clear skies for stargazing. |
| Clouds | `clouds` | A bit of cover overhead today. |
| Rain / Drizzle | `rain` | Grab an umbrella on your way out. |
| Thunderstorm | `thunder` | Stay indoors if you can. |
| Snow | `snow` | Bundle up out there. |
| Mist / Haze / Fog | `mist` | Visibility is a little low today. |

## 📁 Project Structure

```
weatherline/
├── index.html      # Markup and UI states (idle, loading, error, result)
├── style.css       # Styling, mood gradients and responsive rules
├── script.js       # API calls, rendering and key storage
└── screenshots/    # Images used in this README
```

## 🔒 Privacy

Your API key is stored only in your browser's `localStorage` and is sent only to OpenWeather. There is no backend and no tracking.

## 🛠️ Built With

- HTML5
- CSS3 (custom properties, grid, flexbox)
- Vanilla JavaScript (ES6+, `fetch`, `async/await`)
- [OpenWeather API](https://openweathermap.org/api)
- Fonts: [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk) and [Inter](https://fonts.google.com/specimen/Inter)

## 🙏 Acknowledgements

Weather data and icons provided by [OpenWeather](https://openweathermap.org/).

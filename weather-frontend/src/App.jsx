import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from "chart.js";
import "./App.css";
import PropTypes from "prop-types";
import axios from "axios";

/* Images */
import searchIcon from "./assets/search.png";
import clearIcon from "./assets/clear.png";
import cloudIcon from "./assets/cloud.png";
import drizzleIcon from "./assets/drizzle.png";
import humidityIcon from "./assets/humidity.png";
import rainIcon from "./assets/rain.png";
import snowIcon from "./assets/snow.png";
import windIcon from "./assets/wind.png";

// Register chart.js components
ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);

const WeatherDetails = ({ icon, temp, isCelsius, city, country, lat, lon, humidity, wind, toggleUnit, chartData }) => {
  return (
    <>
      <div className="image">
        <img src={icon} alt="Weather Icon" />
      </div>
      <div className="temp">
        {isCelsius ? temp : (temp * 9/5 + 32).toFixed(1)}°{isCelsius ? "C" : "F"}
      </div>
      <button className="toggle-btn" onClick={toggleUnit}>
        Switch to {isCelsius ? "°F" : "°C"}
      </button>
      <div className="location">{city}</div>
      <div className="country">{country}</div>
      <div className="cord">
        <div>
          <span className="lat">Latitude:</span>
          <span>{lat}</span>
        </div>
        <div>
          <span className="lon">Longitude:</span>
          <span>{lon}</span>
        </div>
      </div>
      <div className="data-container">
        <div className="element">
          <img src={humidityIcon} alt="Humidity" className="icon" />
          <div className="data">
            <div className="humidity-percent">{humidity}%</div>
            <div className="text">Humidity</div>
          </div>
        </div>
        <div className="element">
          <img src={windIcon} alt="Wind Speed" className="icon" />
          <div className="data">
            <div className="wind-percent">{wind} km/h</div>
            <div className="text">Wind Speed</div>
          </div>
        </div>
      </div>
      
      {/* Temperature and Humidity Chart */}
      <div className="chart-container">
        <h3>Temperature and Humidity Over Time</h3>
        <Line data={chartData} />
      </div>
    </>
  );
};

WeatherDetails.propTypes = {
  icon: PropTypes.string.isRequired,
  temp: PropTypes.number.isRequired,
  isCelsius: PropTypes.bool.isRequired,
  city: PropTypes.string.isRequired,
  country: PropTypes.string.isRequired,
  humidity: PropTypes.number.isRequired,
  wind: PropTypes.number.isRequired,
  lat: PropTypes.number.isRequired,
  lon: PropTypes.number.isRequired,
  toggleUnit: PropTypes.func.isRequired,
  chartData: PropTypes.object.isRequired,
};

function App() {
  const [text, setText] = useState("");
  const [icon, setIcon] = useState(snowIcon);
  const [temp, setTemp] = useState(0);
  const [isCelsius, setIsCelsius] = useState(true);
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("IN");
  const [lat, setLat] = useState(0);
  const [lon, setLon] = useState(0);
  const [humidity, setHumidity] = useState(0);
  const [wind, setWind] = useState(0);
  const [cityNotFound, setCityNotFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [temperatureHistory, setTemperatureHistory] = useState([]);
  const [humidityHistory, setHumidityHistory] = useState([]);

  const weatherIconMap = {
    "01d": clearIcon,
    "01n": clearIcon,
    "02d": cloudIcon,
    "02n": cloudIcon,
    "03d": drizzleIcon,
    "03n": drizzleIcon,
    "04d": drizzleIcon,
    "04n": drizzleIcon,
    "09d": rainIcon,
    "09n": rainIcon,
    "10d": rainIcon,
    "10n": rainIcon,
    "13d": snowIcon,
    "13n": snowIcon,
  };

  const search = async () => {
    setLoading(true);
    setError(null);
    setCityNotFound(false);

    try {
      const res = await axios.get(`http://localhost:8000/getWeather/${text}`);
      const data = res.data.data;

      setHumidity(data.main.humidity);
      setWind(data.wind.speed);
      setTemp(Math.floor(data.main.temp));
      setCity(data.name);
      setCountry(data.sys.country);
      setLat(data.coord.lat);
      setLon(data.coord.lon);

      const weatherIconCode = data.weather[0].icon;
      setIcon(weatherIconMap[weatherIconCode] || clearIcon);

      // Update the temperature and humidity history
      setTemperatureHistory((prevHistory) => [...prevHistory, Math.floor(data.main.temp)]);
      setHumidityHistory((prevHistory) => [...prevHistory, data.main.humidity]);

      fetchHistory();
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 404) {
        setCityNotFound(true);
      } else {
        setError("An error occurred while fetching weather data.");
      }
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    try {
      await axios.delete("http://localhost:8000/delete");
      setSearchHistory([]);
    } catch (err) {
      console.error("Failed to clear history:", err);
    }
  };

  const handleCity = (e) => setText(e.target.value);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") search();
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await axios.get("http://localhost:8000/getHistory");
      setSearchHistory(response.data.weather);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const toggleUnit = () => {
    setIsCelsius((prev) => !prev);
  };

  // Prepare chart data
  const chartData = {
    labels: temperatureHistory.map((_, index) => `Point ${index + 1}`),
    datasets: [
      {
        label: "Temperature (°C)",
        data: temperatureHistory,
        borderColor: "rgba(255, 99, 132, 1)",
        fill: false,
      },
      {
        label: "Humidity (%)",
        data: humidityHistory,
        borderColor: "rgba(54, 162, 235, 1)",
        fill: false,
      },
    ],
  };

  return (
    <div className="Container">
      <div className="input-container">
        <input
          type="text"
          className="cityInput"
          placeholder="Search City"
          onChange={handleCity}
          value={text}
          onKeyDown={handleKeyDown}
        />
        <div className="search-icon" onClick={search}>
          <img src={searchIcon} alt="search" />
        </div>
      </div>

      {loading && <div className="loading-message">Loading...</div>}
      {error && <div className="error-message">{error}</div>}
      {cityNotFound && <div className="city-not-found">City not found</div>}

      {!loading && !cityNotFound && city && (
        <WeatherDetails
          icon={icon}
          temp={temp}
          isCelsius={isCelsius}
          city={city}
          country={country}
          lat={lat}
          lon={lon}
          humidity={humidity}
          wind={wind}
          toggleUnit={toggleUnit}
          chartData={chartData}
        />
      )}

      <div className="history-container">
        <h3>Search History</h3>
        {searchHistory.length > 0 ? (
          <>
            <ul className="history-list">
              {searchHistory.map((entry) => (
                <li key={entry._id}>
                  {entry.city_name} - {new Date(entry.timestamp).toLocaleString()}
                </li>
              ))}
            </ul>
            <button className="clear-history-btn" onClick={clearHistory}>
              Clear History
            </button>
          </>
        ) : (
          <p>No Search history available</p>
        )}
      </div>

      <p className="copyright">
        Designed by <span> Niranjana M </span>
      </p>
    </div>
  );
}

export default App;

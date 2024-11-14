import { ref } from 'vue';

export function useWeather(apiKey: string) {
  const city = ref('');
  const temperature = ref('');
  const description = ref('');
  const iconUrl = ref('');
  const aqi = ref(null);
  const humidity = ref('');
  const windSpeed = ref('');
  const hourlyForecast = ref([]);
  const dailyForecast = ref([]);
  const isCelsius = ref(true);

  // Toggle unit between Celsius and Fahrenheit
  const toggleUnit = () => {
    isCelsius.value = !isCelsius.value;
    fetchWeather();
  };

  // Fetch weather and AQI data
  const fetchWeather = async (inputCity: string) => {
    try {
      const unit = isCelsius.value ? 'metric' : 'imperial';
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${inputCity}&appid=${apiKey}&units=${unit}`
      );
      const weatherData = await weatherResponse.json();

      city.value = weatherData.name;
      temperature.value = weatherData.main.temp.toFixed(1);
      description.value = weatherData.weather[0].description;
      iconUrl.value = `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`;
      humidity.value = weatherData.main.humidity;
      windSpeed.value = weatherData.wind.speed;

      // Fetch AQI data
      const aqiResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&appid=${apiKey}`
      );
      const aqiData = await aqiResponse.json();
      aqi.value = aqiData.list[0].main.aqi;

      // Fetch Forecast Data
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${inputCity}&appid=${apiKey}&units=${unit}`
      );
      const forecastData = await forecastResponse.json();

      hourlyForecast.value = forecastData.list.slice(0, 6); // First 6 for 3-hour intervals
      dailyForecast.value = forecastData.list.filter((_, index) => index % 8 === 0); // Roughly daily forecast
    } catch (error) {
      console.error("Error fetching weather data:", error.message);
    }
  };

  return {
    city,
    temperature,
    description,
    iconUrl,
    aqi,
    humidity,
    windSpeed,
    hourlyForecast,
    dailyForecast,
    isCelsius,
    toggleUnit,
    fetchWeather,
  };
}

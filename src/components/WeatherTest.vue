<template>
    <div style="color: black;" class="weather-container">
      <!-- City Name and Temperature -->
      <h1 class="city-name" v-if="city">{{ city }}</h1>
      
       <!-- Date and Time -->
        <p class="date-time">
            {{ formattedDate }}
        </p>


      <div class="temperature" v-if="temperature">
        {{ temperature }}°<span>{{ isCelsius ? 'C' : 'F' }}</span>
        
        <!-- Button to switch between Celsius and Fahrenheit -->
        <button @click="toggleCelsiusFahrenheit">
            Switch to {{ isCelsius ? 'Fahrenheit' : 'Celsius' }}
        </button>

        <!-- Button to switch between Metric and Imperial units -->
        <button @click="toggleMetricImperial">
            Switch to {{ isMetric ? 'Imperial' : 'Metric' }}
        </button>
        </div>

  
      <!-- AQI Tooltip -->
      <div class="aqi" v-if="aqi !== null">
        AQI: {{ aqi }}
        <span class="tooltip">Air Quality Index</span>
      </div>
  
      <!-- Weather Conditions -->
      <div class="description" v-if="description">{{ description }}</div>
      <img :src="iconUrl" alt="weather icon" v-if="iconUrl" />
  
      <!-- Weather Stats -->
      <div class="weather-stats">
        <div v-if="humidity !== null">Humidity: {{ humidity }}%</div>
        <div v-if="windSpeed !== null">Wind: {{ windSpeed }} {{ isCelsius ? 'm/s' : 'mph' }}</div>
      </div>
  
      <!-- Hourly Forecast -->
      <div class="forecast" v-if="hourlyForecast && hourlyForecast.length">
        <h2>Hourly Forecast</h2>
        <div v-for="hour in hourlyForecast" :key="hour.dt" class="hour">
          <div>{{ formatTime(hour.dt) }}</div>
          <div>{{ hour.main.temp ? hour.main.temp.toFixed(1) : 'N/A' }}°</div>
  
          <!-- Icon for Hourly Forecast -->
          <img :src="getIconUrl(hour)" alt="Weather icon" class="weather-icon" />
        </div>
      </div>
  
      <!-- Daily Forecast -->
      <div class="forecast" v-if="dailyForecast && dailyForecast.length">
        <h2>Daily Forecast</h2>
        <div v-for="day in dailyForecast" :key="day.dt" class="day">
          <div>{{ formatDay(day.dt) }}</div>
          <div>{{ day.main.temp ? day.main.temp.toFixed(1) : 'N/A' }}°</div>
  
          <!-- Icon for Daily Forecast -->
          <img :src="getIconUrl(day)" alt="Weather icon" class="weather-icon" />
        </div>
      </div>
  
      <!-- Search Field -->
      <input 
        type="text" 
        placeholder="Enter city" 
        v-model="inputCity" 
        @keyup.enter="fetchWeather"
      />
      <button @click="fetchWeather">Get Weather</button>
    </div>
</template>
  
  
<script lang="ts">
import { defineComponent, ref, onMounted, watch, onUnmounted } from 'vue';
import sunnyIcon from '../assets/icons/sunny.svg';
import cloudyIcon from '../assets/icons/cloudy.svg';
import rainyIcon from '../assets/icons/rainy.svg';

export default defineComponent({
  name: 'WeatherDisplay',
  setup() {
    const city = ref<string>('London');
    const temperature = ref<string>('');
    const description = ref<string>('');
    const iconUrl = ref<string>('');
    const inputCity = ref<string>('London'); // Default city
    const isCelsius = ref<boolean>(true);  // Celsius/Fahrenheit toggle
    const isMetric = ref<boolean>(true);   // Metric/Imperial toggle
    const aqi = ref<number | null>(null);
    const humidity = ref<number | null>(null);
    const windSpeed = ref<number | null>(null);
    const hourlyForecast = ref<Array<any>>([]);
    const dailyForecast = ref<Array<any>>([]);

    const apiKey = '49befacf77554625942263287bc33286';
    
    const formattedDate = ref<string>('');
    
    // Function to update date and time
    const updateDateTime = () => {
      const currentDate = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true, // For 12-hour format
      };
      formattedDate.value = currentDate.toLocaleString('en-US', options);
    };

    // Toggle between Celsius and Fahrenheit
    const toggleCelsiusFahrenheit = () => {
      isCelsius.value = !isCelsius.value;
      fetchWeather(); // Re-fetch weather after toggling the temperature unit
    };

    // Toggle between Metric and Imperial
    const toggleMetricImperial = () => {
      isMetric.value = !isMetric.value;
      fetchWeather(); // Re-fetch weather after toggling the measurement unit
    };

    // Function to get the icon URL based on weather condition
    const getIconUrl = (weatherData: any) => {
      const weatherDescription = weatherData.weather && weatherData.weather[0] && weatherData.weather[0].main.toLowerCase();

      switch (weatherDescription) {
        case 'clear':
          return sunnyIcon; // Sunny icon
        case 'clouds':
          return cloudyIcon; // Cloudy icon
        case 'rain':
          return rainyIcon; // Rainy icon
        default:
          return sunnyIcon; // Default to sunny if no match
      }
    };

    // Fetch weather and AQI data
    const fetchWeather = async () => {
      if (!inputCity.value.trim()) return; // Prevent fetching with an empty city

      try {
        const unit = isCelsius.value ? 'metric' : 'imperial';
        const weatherResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${inputCity.value}&appid=${apiKey}&units=${unit}`
        );
        const weatherData = await weatherResponse.json();

        if (weatherData.cod !== 200) {
          alert('City not found');
          city.value = 'Error';
          temperature.value = '';
          return;
        }

        // Successfully fetched weather data
        city.value = weatherData.name;
        temperature.value = weatherData.main.temp.toFixed(1);
        description.value = weatherData.weather[0].description;
        humidity.value = weatherData.main.humidity;
        windSpeed.value = weatherData.wind.speed;
        iconUrl.value = getIconUrl(weatherData);

        // Fetch AQI data
        const aqiResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/air_pollution?lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&appid=${apiKey}`
        );
        const aqiData = await aqiResponse.json();
        aqi.value = aqiData.list[0].main.aqi;

        // Fetch Forecast Data
        const forecastResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${inputCity.value}&appid=${apiKey}&units=${unit}`
        );
        const forecastData = await forecastResponse.json();

        hourlyForecast.value = forecastData.list;
        dailyForecast.value = forecastData.list.reduce((acc: any[], curr: any) => {
          const dayTimestamp = new Date(curr.dt * 1000).setHours(0, 0, 0, 0);
          const existingDay = acc.find((item) => new Date(item.dt * 1000).setHours(0, 0, 0, 0) === dayTimestamp);

          if (!existingDay) {
            acc.push(curr);
          }

          return acc;
        }, []);
      } catch (error) {
        console.error('Error fetching weather data:', error);
      }
    };

    // Fetch data when component is mounted
    onMounted(() => {
      updateDateTime();
      // Update date-time every minute
      const interval = setInterval(updateDateTime, 60000);
      
      // Clean up the interval when component is unmounted
      onUnmounted(() => {
        clearInterval(interval);
      });

      // Fetch weather data on component mount
      fetchWeather();
    });

    // Helper methods to format date
    const formatTime = (timestamp: number) => {
      return new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDay = (timestamp: number) => {
      return new Date(timestamp * 1000).toLocaleDateString([], { weekday: 'long' });
    };

    return {
      city,
            formattedDate,

      temperature,
      description,
      iconUrl,
      inputCity,
      isCelsius,
      isMetric,
      toggleCelsiusFahrenheit,
      toggleMetricImperial,
      fetchWeather,
      aqi,
      humidity,
      windSpeed,
      hourlyForecast,
      dailyForecast,
      formatTime,
      formatDay,
      getIconUrl,
    };
  },
});
</script>

  
  <style scoped>
  .weather-container { /* Layout styles */ }
  .city-name { /* City name styles */ }
  .temperature { /* Temperature styles */ }
  .aqi { /* AQI tooltip styles */ }
  .weather-stats { /* Weather stats styles */ }
  .forecast { /* Forecast styles */ }
  .day, .hour { /* Daily/hourly forecast styles */ }
  .weather-icon { /* Icon styles */ }
  </style>
  


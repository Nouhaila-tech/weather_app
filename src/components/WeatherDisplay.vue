<template>
    <div  class="weather-container">
        <div class="header-1">
            <!-- City Name and Temperature -->
            <h1 class="city-name" v-if="city">{{ city }}</h1>
            <!-- Date -->
            <p class="date-time">{{ formattedDate }}</p>
                <!-- Time -->
            <p class="time">{{ formattedTime }}</p> 
        </div>
        
        <div class="header-2">
            <div 
                class="settings-button" 
                :class="{ 'settings-button-active': isCardVisible }" 
                @click="toggleCardVisibility">
                <img 
                    class="settings-icon" 
                    :class="{ 'settings-icon-active': isCardVisible }" 
                    src="../assets/icons/settings.svg" 
                    alt="Settings Icon">
                </div>

            <!-- Settings Card -->
            <div v-show="isCardVisible" class="settings-card">
                <p class="">Temperature</p>
                <div class="switch-toggle">
                    <!-- Celsius option, active when isCelsius is true -->
                    <div
                        :class="{'switch-toggle-item-active': isCelsius, 'switch-toggle-item': !isCelsius}"
                        @click="setActive('celsius')"
                    >
                        <span>°C</span>
                    </div>

                    <!-- Fahrenheit option, active when isCelsius is false -->
                    <div
                        :class="{'switch-toggle-item-active': !isCelsius, 'switch-toggle-item': isCelsius}"
                        @click="setActive('fahrenheit')"
                    >
                        <span>°F</span>
                    </div>
                </div>



                <p>Measurements</p>
                <div class="switch-toggle">
                    <!-- Metric option, active when isMetric is true -->
                    <div
                        :class="{'switch-toggle-item-active': isMetric, 'switch-toggle-item': !isMetric}"
                        @click="setMeasurementUnit('metric')"
                    >
                        <span>Metric</span>
                    </div>

                    <!-- Imperial option, active when isMetric is false -->
                    <div
                        :class="{'switch-toggle-item-active': !isMetric, 'switch-toggle-item': isMetric}"
                        @click="setMeasurementUnit('imperial')"
                    >
                        <span>Imperial</span>
                    </div>
                </div>

            </div>


            
        </div>

        

    </div>

    <div class="weather-overview">
        <div class="weather-icon-container">
            <img :src="iconUrl" alt="weather icon" v-if="iconUrl" />
            <h1>
                {{ temperature }}°
            </h1>
        </div>
        <div class="weather-details">
            <div class="description" v-if="description">
                {{ description }}
            </div>
            <div class="feels-like" v-if="feelsLike !== null">
                Feels like: {{ feelsLike }}°
            </div>
        </div>
    </div>

    <div class="weather-stats">
        <div class="weather-stats-container">
            <div class="weather-stats-item">
                <img src="../assets/icons/humidity-icon.svg" alt="">
                <p>Humidity</p>
                <div class="weather-stats-value" v-if="humidity !== null">
                    {{ humidity }}%
                </div>
            </div>
            <div class="weather-stats-item">
                <img src="../assets/icons/wind-icon.svg" alt="">
                <p>Wind</p>
                <div class="weather-stats-value" v-if="windSpeed !== null">
                    {{ windSpeed }} {{ isCelsius ? 'm/s' : 'mph' }}
                </div>
            </div>
        </div>
        <div class="weather-stats-container">
            <div class="weather-stats-item">
                <img src="../assets/icons/precipitation-icon.svg" alt="">
                <p>Precipitation</p>
                <div class="weather-stats-value" v-if="precipitation !== null">
                    {{ precipitation.toFixed(0) }}%  
                </div>
            </div>
            <div class="weather-stats-item">
                <img src="../assets/icons/aqi-icon.svg" alt="">
                <p>AQI</p>
                <div class="weather-stats-value"v-if="aqi !== null">
                    {{ aqi }}%
                </div>
            </div>
        </div>
    </div>

    <div>
        <div class="progress">
            <p>AQI</p>
            <p style="display: flex; align-items: center;">
                300
                <img
                    src="../assets/icons/tooltip-info.svg"
                    alt="tooltip"
                    @click="toggleTooltip"
                    @mouseover="showTooltip"
                    @mouseleave="hideTooltip"
                    class="tooltip-trigger"
                />
                <!-- Tooltip visible on hover and click -->
                <div v-if="isTooltipVisible" class="tooltip">
                    <span>300+ AQI is considered hazardous</span>            
                </div>
                </p>       
             </div>
        <div class="aqi-progress-bar-container">

            <div class="aqi-progress-bar" :style="{'width': aqiPercentage() + '%'}"></div>
        </div>
    </div>

    <div class="forecast-container">
        <div class="switch-toggle">
                    <!-- Celsius option, active when isCelsius is true -->
                    <div
                        :class="{'switch-toggle-item-active': isCelsius, 'switch-toggle-item': !isCelsius}"
                        @click="setActive('celsius')"
                    >
                        <span>Hourly Forecast</span>
                    </div>

                    <!-- Fahrenheit option, active when isCelsius is false -->
                    <div
                        :class="{'switch-toggle-item-active': !isCelsius, 'switch-toggle-item': isCelsius}"
                        @click="setActive('fahrenheit')"
                    >
                        <span>7-Day Forecast</span>
                    </div>
                </div>
    </div>

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
</template>  
  
<script lang="ts">
import { defineComponent, ref, onMounted, watch, onUnmounted } from 'vue';
import sunnyIcon from '../assets/icons/sunny.svg';
import cloudyIcon from '../assets/icons/cloudy.svg';
import rainyIcon from '../assets/icons/rainy.svg';
import { defineConfig } from 'vite';

export default defineComponent({
  name: 'WeatherDisplay',
  setup() {
    const city = ref<string>('London');
    const temperature = ref<string>('');
    const description = ref<string>('');
    const feelsLike = ref<number | null>(null);
    const iconUrl = ref<string>('');
    const inputCity = ref<string>('London'); // Default city
    const isCelsius = ref<boolean>(true);  // Celsius/Fahrenheit toggle
    const isMetric = ref<boolean>(true);   // Metric/Imperial toggle
    const aqi = ref<number | null>(null);
    const humidity = ref<number | null>(null);
    const windSpeed = ref<number | null>(null);
    const rain = ref<number | null>(null);
    const precipitation = ref<number | null>(null);
    const maxPrecipitation = ref<number>(100);
    const hourlyForecast = ref<Array<any>>([]);
    const dailyForecast = ref<Array<any>>([]);


    const apiKey = '49befacf77554625942263287bc33286';
    
    const formattedDate = ref<string>(''); 
    const formattedTime = ref<string>(''); 
    const isCardVisible = ref<boolean>(false); 
    const activeToggle = ref<'celsius' | 'fahrenheit'>('celsius');

    const capitalizeWords = (text: string): string => {
        return text
            .toLowerCase()
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
        };

    
    // Function to update date and time
    const updateDateTime = () => {
      const currentDate = new Date();
      const dateOptions: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };
      const timeOptions: Intl.DateTimeFormatOptions = {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true, // For 12-hour format
      };

      formattedDate.value = currentDate.toLocaleDateString('en-US', dateOptions); // Date
      formattedTime.value = currentDate.toLocaleTimeString('en-US', timeOptions); // Time
    };

    const toggleCardVisibility = () => {
      isCardVisible.value = !isCardVisible.value;
    };

    // Method to toggle between Celsius and Fahrenheit
    const toggleCelsiusFahrenheit = () => {
        isCelsius.value = !isCelsius.value;
        
        // Convert temperature if needed
        if (!isCelsius.value) {
            // Convert to Fahrenheit, rounded to 2 decimal places
            temperature.value = ((temperature.value * 9/5) + 32).toFixed(2);
        } else {
            // Convert to Celsius, rounded to 2 decimal places
            temperature.value = ((temperature.value - 32) * 5/9).toFixed(2);
        }

        // Optionally, convert back to a number if you want to perform any further calculations
        temperature.value = parseFloat(temperature.value);
    };

    

    // Method to set the active temperature unit (Celsius or Fahrenheit)
    const setActive = (toggle: 'celsius' | 'fahrenheit') => {
      if (toggle === 'celsius' && !isCelsius.value) {
        toggleCelsiusFahrenheit(); // Convert to Celsius if it's not already
      } else if (toggle === 'fahrenheit' && isCelsius.value) {
        toggleCelsiusFahrenheit(); // Convert to Fahrenheit if it's not already
      }
    };


    // Toggle between Metric and Imperial units
    const toggleMetricImperial = () => {
    isMetric.value = !isMetric.value;
    fetchWeather(); // Re-fetch weather data after toggling the unit
    };

    // Method to set the active measurement unit (Metric or Imperial)
    const setMeasurementUnit = (unit: 'metric' | 'imperial') => {
    if (unit === 'metric' && !isMetric.value) {
        toggleMetricImperial(); // Switch to Metric if it's not already
    } else if (unit === 'imperial' && isMetric.value) {
        toggleMetricImperial(); // Switch to Imperial if it's not already
    }
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

    const aqiPercentage = (): number => {
      return (aqi.value / 100) * 300;
    };

    const isTooltipVisible = ref(false);

    // Show the tooltip on hover or click
    const showTooltip = () => {
    isTooltipVisible.value = true;
    };

    // Hide the tooltip when mouse leaves or on click again
    const hideTooltip = () => {
    isTooltipVisible.value = false;
    };

    // Toggle the tooltip visibility on click
    const toggleTooltip = () => {
    isTooltipVisible.value = !isTooltipVisible.value;
    };

    

    // Fetch weather and AQI data
   // Fetch weather and AQI data
const fetchWeather = async () => {
  if (!inputCity.value.trim()) return; // Prevent fetching with an empty city

  try {
    const unit = isCelsius.value ? 'metric' : 'imperial'; // Determine whether the units are Metric or Imperial

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
    temperature.value = weatherData.main.temp.toFixed(1);  // Temperature is in the `main.temp`
    description.value = capitalizeWords(weatherData.weather[0].description);
    feelsLike.value = weatherData.main.feels_like;
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

    

    if (weatherData.rain && weatherData.rain['1h']) {
          precipitation.value = (weatherData.rain['1h'] / this.maxPrecipitation) * 100;
        } else {
          precipitation.value = 0; // No rain data, set to 0%
        }

    // Adjust data based on Metric or Imperial
    if (isMetric.value) {
      // Convert Fahrenheit to Celsius and miles to kilometers for Metric
      temperature.value = ((weatherData.main.temp - 32) * 5 / 9).toFixed(1);  // Convert Fahrenheit to Celsius
      windSpeed.value = (windSpeed.value * 1.60934).toFixed(2);  // Convert mph to km/h
    } else {
      // Convert Celsius to Fahrenheit and kilometers to miles for Imperial
      temperature.value = ((weatherData.main.temp * 9 / 5) + 32).toFixed(1);  // Convert Celsius to Fahrenheit
      windSpeed.value = (windSpeed.value / 1.60934).toFixed(2);  // Convert km/h to mph
    }

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
      formattedTime,
      temperature,
      description,
      feelsLike,
      iconUrl,
      inputCity,
      isCelsius,
      isMetric,
      toggleCelsiusFahrenheit,
      toggleMetricImperial,
      fetchWeather,
      aqi,
      aqiPercentage,
      humidity,
      windSpeed,
      precipitation,
      isTooltipVisible,
      showTooltip,
      hideTooltip,
      toggleTooltip,
      hourlyForecast,
      dailyForecast,
      formatTime,
      formatDay,
      getIconUrl,
      isCardVisible,
      toggleCardVisibility, 
      activeToggle,
      setActive,
      setMeasurementUnit,
    };
  },

  
});



</script>

  
  <style scoped>
  .weather-container { 
    display: flex;
    justify-content: space-between;
    align-items: center; 
  }

  .city-name {
    font-weight: bold;
    color: #0E121B;
    font-size: 40px;
}

.weather-details {
  text-align: left; /* Align text to the left */
}

.description {
    width: 230px;
    gap: 6px;
    color: #0E121B;
    font-size: 20px;
    font-weight: bold;
    text-align: end;
}

.feels-like {
    width: 230px;
    height: 20px;
    color: #525866;
    font-size: 15px;
    text-align: end;
    font-weight: 500;
}


  .header-1 {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .header-2 {
    display: flex;
    justify-content: flex-end;
    position: relative;
  }

 .date-time, .time {
    color: #525866;
    font-size: 16px;
    line-height: 24px;
 }

 .settings-button {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 36px;
    height: 36px;
    opacity: 0px;
    background-color: #FFFFFF;
    border-radius: 8px;
    border: #E1E4EA;
    border: 1px solid var(--stroke-soft-200, #E1E4EA);
    box-shadow: 0px 1px 2px 0px #0A0D1408;
    cursor: pointer;
    transition: border 200ms ease-out, box-shadow 200ms ease-out;
 }

 .settings-button-active {
  border: 1px solid #0E121B;
  box-shadow: 0px 0px 0px 4px #99A0AE29, 0px 0px 0px 2px #FFFFFF;

}

.settings-icon-active {
  filter: brightness(0) saturate(100%) invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0) contrast(100%);
  transition: filter 200ms ease-out;
}


.settings-button-active img{
    color: #0E121B;
}


 .settings-button img {
    justify-content: center;
    align-items: center;
 }

 .settings-button:hover:not(.settings-button-active) {
  background-color: #E1E4EA;
}


.settings-button:hover:not(.settings-button-active) .settings-icon {
  filter: brightness(0) saturate(100%) invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0) contrast(100%);
}


.settings-card {
  position: absolute;
  top: 45px; 
  right: 0;
  padding: 20px;
  background-color: #FFFFFF;
  border-radius: 8px;
  width: 262px;
  height: 180px;
  z-index: 100; 
  transition: opacity 0.3s ease; 
  border: 1px solid #E1E4EA;
  box-shadow: 0px 16px 32px -12px #0E121B1A;
}

.settings-card p {
  margin: 0 0 10px;
  color:#0E121B;
  font-size: 14px;
  line-height: 20px;

}

.switch-toggle {
    margin-top: 10px;
    margin-bottom: 10px;
    width: 100%;
    height: 36px;
    padding: 4px 4px 4px 4px;
    gap: 4px;
    border-radius: 10px;
    background: #F5F7FA;
    display: flex;
    opacity: 1; 
}

.switch-toggle-item-active {
    width: 50%;
    height: 28px;
    padding: 4px 0px 0px 0px;
    gap: 6px;
    border-radius: 6px;
    background: #FFFFFF;
    box-shadow: 0px 6px 10px 0px #0E121B0F;
    display: flex;
    justify-content: center;
    align-items: center;
    
    opacity: 1; /* Make sure the active item is visible */
}

.switch-toggle-item-active span {
    text-decoration: none;
    color: #0E121B;
    height: 14px;
    font-weight: 500;
    gap: 0px;
    opacity: 0px;
    display: flex;
    justify-content: center;
    align-items: center;

}

.switch-toggle-item {
    width: 50%;
    height: 28px;
    padding: 4px 0px 0px 0px;
    gap: 6px;
    border-radius: 6px;
    background: transparent;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 1; /* Ensure inactive items are visible */
}

.switch-toggle-item span {
    text-decoration: none;
    color: #99A0AE;
    height: 14px;
    font-weight: 500;
    gap: 0px;
    opacity: 0px;
    display: flex;
    justify-content: center;
    align-items: center;

}

.switch-toggle-item:hover {
    background-color: #e6e6e6; /* Optional: Adds a hover effect */
}

.weather-overview{
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.weather-icon-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.weather-icon-container img {
    width: 74px;
    height: 74px;
    padding: 14.8px 6.42px 12.02px 6.48px;
    gap: 0px;
    opacity: 0px;

}

.weather-icon-container h1 {
    width: 100px;
    height: 64px;
    opacity: 0px;
    font-weight: bold;
    color: #0E121B;
    font-size: 56px;
    font-weight: 700;
    line-height: 64px;
    text-align: left;
    margin-left: 15px;

}

.weather-stats {
    display: flex;
    justify-content: space-between; /* Distribute containers across the row */
    width: 100%;
}

.weather-stats-container {
    display: block; /* Keep it block-level for stacking items vertically */
    width: 50%;
    margin-left: 2%;
    margin-right: 2%;

}

.weather-stats-item {
    display: flex;
    justify-content: space-between; /* Distribute items across the container */
    align-items: center; /* Vertically align the items in the center */
    width: 100%; /* Ensure the container stretches across the available width */
}

.weather-stats-item img {
    margin-right: 10px; /* Space between image and text */
}

.weather-stats-item p {
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
    color: #0E121B;
    margin: 0; /* Remove any default margin */
    flex: 1; /* Allow the <p> tag to take available space and push the value to the right */
}

.weather-stats-value {
    font-size: 14px;
    line-height: 20px;
    color: #0E121B;
    font-weight: bold;
    text-align: right; /* Align the value to the right */
    white-space: nowrap; /* Prevent the value from wrapping to the next line */
}

.aqi-progress-bar-container {
    width: 100%;
    height: 6px;
    padding: 0px 382.8px 0px 0px;
    gap: 0px;
    border-radius: 8px;
    opacity: 0px;
    background:  #E1E4EA;
}

.aqi-progress-bar {
    height: 6px;
    gap: 0px;
    opacity: 0px;
    height: 100%;
    background-color: red;
    border-radius: 8px;
}

.progress {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}
.progress p {
    font-weight: 500;
    line-height: 20px;
    text-align: left;
    color: #0E121B;
}

.tooltip-trigger {
  cursor: pointer;
  margin-left: 8px; /* Space between the text and icon */
}

.tooltip {
    margin-left: -250%;
    position: absolute;
    width: 220px;
height: 20px;
padding: 2px 6px 2px 6px;
gap: 6px;
border-radius: 4px;
border: 1px 0px 0px 0px;
opacity: 0px;
background: #FFFFFF;
border: 1px solid #E1E4EA;
box-shadow: 0px 1px 2px 0px #0E121B08;
box-shadow: 0px 12px 24px 0px #0E121B0F;
margin-bottom: 45px;
text-align: center;
align-items: center;
display: flex;
flex-direction: column;
justify-content: center;

}

.tooltip::after {
  content: '';  /* Create an empty content for the arrow */
  position: absolute;
  top: 100%;  /* Position the arrow at the bottom of the tooltip */
  left: 50%;  /* Center the arrow */
  margin-left: 33.3%;  /* Center the arrow */
  width: 0;
  height: 0;
  
  /* Create a triangle pointing upwards with the inside white and border gray */
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid #E1E4EA;  /* Border color (gray) */
  
  /* Create the inside white part of the arrow */
  box-shadow: 0 0 0 2px white inset;
  
  opacity: 1;
  transition: opacity 0.3s;  /* Fade-in effect for the arrow */
}



.tooltip span {
  font-size: 12px;
  font-weight: 400;
  color: #0E121B;
  text-align: center;
  line-height: 16px;
  margin: 0; /* Ensure no margin is applied to the span */
}

p {
  position: relative;
}

.tooltip-trigger:hover + .tooltip,
.tooltip-trigger:focus + .tooltip {
  display: block;
}

.tooltip {
  display: none;
}
  .temperature { /* Temperature styles */ }
  .aqi { /* AQI tooltip styles */ }
  .weather-stats { /* Weather stats styles */ }
  .forecast { /* Forecast styles */ }
  .day, .hour { /* Daily/hourly forecast styles */ }
  .weather-icon { /* Icon styles */ }
  </style>
  
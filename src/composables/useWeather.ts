import { defineComponent, ref, onMounted, watch, onUnmounted } from 'vue';
import sunnyIcon from '../assets/icons/sunny.svg';
import cloudyIcon from '../assets/icons/cloudy.svg';
import rainyIcon from '../assets/icons/rainy.svg';
import { defineConfig } from 'vite';

export default defineComponent({
  name: 'WeatherDisplay',
  setup() {
    const city = ref<string>('Casablanca');
    const temperature = ref<string | number>(''); 
    const description = ref<string>('');
    const feelsLike = ref<number | null>(null);
    const iconUrl = ref<string>('');
    const inputCity = ref<string>('Casablanca'); 
    const isCelsius = ref<boolean>(true);  
    const isMetric = ref<boolean>(true);   
    const aqi = ref<number | null>(null);       
    const humidity = ref<number | null>(null);
    const windSpeed = ref<number | null>(null);
    const rain = ref<number | null>(null);
    const precipitation = ref<number | null>(null);
    const maxPrecipitation = ref<number>(100);
    const hourlyForecast = ref<Array<any>>([]);
    const dailyForecast = ref<Array<any>>([]);
    const forecastType = ref<'hourly' | 'daily'>('hourly');  


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
        hour12: true, 
      };

      formattedDate.value = currentDate.toLocaleDateString('en-US', dateOptions); 
      formattedTime.value = currentDate.toLocaleTimeString('en-US', timeOptions); 
    };

    const setActiveToggle = (type: 'hourly' | 'daily') => {
      forecastType.value = type;  
    }



    const toggleCardVisibility = () => {
      isCardVisible.value = !isCardVisible.value;
    };


    // Method to toggle between Celsius and Fahrenheit
    const toggleCelsiusFahrenheit = () => {
    let temp: number;

    // Ensure temperature is converted to a number for calculations
    if (typeof temperature.value === 'string' && temperature.value.trim() !== '') {
        temp = parseFloat(temperature.value);
    } else if (typeof temperature.value === 'number') {
        temp = temperature.value;
    } else {
        // Handle cases where temperature is not a valid number (e.g., empty string)
        console.error('Invalid temperature value. Conversion skipped.');
        return;
    }

    // Toggle the unit
    isCelsius.value = !isCelsius.value;

    // Perform the conversion
    if (isCelsius.value) {
        // Convert to Celsius
        temp = (temp - 32) * 5 / 9;
    } else {
        // Convert to Fahrenheit
        temp = (temp * 9 / 5) + 32;
    }

    // Update temperature, rounded to 2 decimal places
    temperature.value = parseFloat(temp.toFixed(2));
};

    const formatTemperature = (temp: number, isCelsius: boolean) => {
        if (isCelsius) {
            // Return the temperature rounded to the nearest integer (no decimals)
            return Math.round(temp).toString(); // Using Math.round() to round to nearest integer
        } else {
            // Convert from Celsius to Fahrenheit and round to nearest integer
            return Math.round(((temp * 9/5) + 32)).toString();
        }
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
        fetchWeather(); 
    };

    // Method to set the active measurement unit (Metric or Imperial)
    const setMeasurementUnit = (unit: 'metric' | 'imperial') => {
    if (unit === 'metric' && !isMetric.value) {
        toggleMetricImperial(); 
    } else if (unit === 'imperial' && isMetric.value) {
        toggleMetricImperial(); 
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
      const aqiValue = aqi.value ?? 0; 
      return (aqiValue / 100) * 300;
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
const fetchWeather = async () => {
  if (!inputCity.value.trim()) return; 

  try {
    const unit = isMetric.value ? 'metric' : 'imperial';

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

    hourlyForecast.value = forecastData.list.slice(0, 11);
    dailyForecast.value = forecastData.list.reduce((acc: any[], curr: any) => {
      const dayTimestamp = new Date(curr.dt * 1000).setHours(0, 0, 0, 0);
      const existingDay = acc.find((item) => new Date(item.dt * 1000).setHours(0, 0, 0, 0) === dayTimestamp);

      if (!existingDay) {
        acc.push(curr);
      }

      return acc;
    }, []);



    const defaultMaxPrecipitation = 50; 

  if (weatherData.rain && weatherData.rain['1h']) {
      precipitation.value = (weatherData.rain['1h'] / defaultMaxPrecipitation) * 100;
  } else {
      precipitation.value = 0; 
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
        return new Date(timestamp * 1000).toLocaleDateString([], { weekday: 'short' });
        };

    const formatTimeFrensh = (timestamp: number) => {
      const date = new Date(timestamp * 1000); // Convert Unix timestamp to milliseconds
      const hours = date.getHours().toString().padStart(2, '0'); // 24-hour format with padding
      const minutes = date.getMinutes().toString().padStart(2, '0'); // Pad minutes to 2 digits
      return `${hours}:${minutes}`;
    };

    return {
      city,
      formattedDate,
      formattedTime,
      formatTimeFrensh,
      temperature,
      formatTemperature,
      forecastType,
      description,
      feelsLike,
      iconUrl,
      inputCity,
      isCelsius,
      isMetric,
      toggleCelsiusFahrenheit,
      setActiveToggle,
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




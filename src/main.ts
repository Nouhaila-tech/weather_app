import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')

import { defineComponent } from 'vue';
import WeatherDisplay from './components/WeatherDisplay.vue'; // Ensure this path is correct

export default defineComponent({
  name: 'App',
  components: {
    WeatherDisplay
  }
});

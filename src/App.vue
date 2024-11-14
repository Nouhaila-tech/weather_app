<template>
  <div id="app" class="app-container">
    <WeatherTest />
  </div>

  <div id="app" class="app-container">
    <WeatherDisplay />
  </div>
  
  <footer class="brand-footer">
    <img src="./assets/brand.svg" alt="">
  </footer>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import WeatherDisplay from './components/WeatherDisplay.vue'; 
import WeatherTest from './components/WeatherTest.vue'; 


export default defineComponent({
  name: 'App',
  components: {
    WeatherTest,
    WeatherDisplay
  }
});
</script>

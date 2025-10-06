import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Toast from "vue-toastification"
import "vue-toastification/dist/index.css"
import axios from 'axios';

import App from './App.vue'
import router from './router'

axios.defaults.baseURL = import.meta.env.VITE_API_URL;

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Toast, { position: "top-right" })

app.mount('#app')

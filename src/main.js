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
// ✅ Toast configuration (only one toast visible at a time)
app.use(Toast, {
    position: "top-right",
    timeout: 2000,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    transition: "Vue-Toastification__fade",
    maxToasts: 1,         // ✅ show only one toast at a time
    newestOnTop: true,    // ✅ prioritize the latest toast
})

app.mount('#app')

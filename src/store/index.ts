import { createPinia } from 'pinia'
import { markRaw } from 'vue'
import router from '../router'

// Create the pinia instance
const pinia = createPinia()

// Add router to pinia context
pinia.use(({ store }) => {
  store.$router = markRaw(router)
})

export default pinia

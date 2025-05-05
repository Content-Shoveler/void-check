import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './store'
import { useTasksStore } from './store/modules/tasks'
import { registerSW } from 'virtual:pwa-register'
import { loadSampleTasks } from './utils/sampleTasks'
import taskRepository from './services/taskRepository'

// Initialize service worker for PWA
const updateSW = registerSW({
  onNeedRefresh() {
    // We could show a user-friendly notification that an update is available
    console.log('New content is available, please refresh.')
  },
  onOfflineReady() {
    // We could show a user-friendly notification that the app is ready for offline use
    console.log('App is ready for offline use.')
  },
})

// Create and mount the app
const app = createApp(App)

// Use plugins
app.use(router)
app.use(pinia)

// Mount the app
app.mount('#app')

// Initialize task store after app is mounted
const tasksStore = useTasksStore()
tasksStore.initializeTasks()

// Initialize database (without automatically loading sample data)
setTimeout(async () => {
  const taskCount = await taskRepository.getAll().then(tasks => tasks.length)
  console.log(`Database initialized with ${taskCount} tasks`)
}, 1000) // Wait for DB initialization

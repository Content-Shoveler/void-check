import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUIStore = defineStore('ui', () => {
  // Modal state
  const isTaskModalOpen = ref(false)
  const activeTaskId = ref<string | null>(null)
  
  // Loading states
  const isLoading = ref(false)
  const loadingMessage = ref('')
  
  // Sidebar state (for responsive design)
  const isSidebarOpen = ref(false)
  
  // Notification state
  const notifications = ref<Array<{
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    message: string;
    duration?: number;
  }>>([])
  
  // View state
  const taskViewMode = ref<'list' | 'card'>('list')
  
  // Actions - Modal
  function openTaskModal(taskId?: string) {
    activeTaskId.value = taskId || null
    isTaskModalOpen.value = true
  }
  
  function closeTaskModal() {
    isTaskModalOpen.value = false
    setTimeout(() => {
      activeTaskId.value = null
    }, 300) // Delay clearing taskId until after animation
  }
  
  // Actions - Loading
  function startLoading(message = 'Loading...') {
    loadingMessage.value = message
    isLoading.value = true
  }
  
  function stopLoading() {
    isLoading.value = false
    loadingMessage.value = ''
  }
  
  // Actions - Sidebar
  function toggleSidebar() {
    isSidebarOpen.value = !isSidebarOpen.value
  }
  
  function openSidebar() {
    isSidebarOpen.value = true
  }
  
  function closeSidebar() {
    isSidebarOpen.value = false
  }
  
  // Actions - Notifications
  function addNotification({ 
    type = 'info',
    message,
    duration = 5000
  }: {
    type?: 'info' | 'success' | 'warning' | 'error';
    message: string;
    duration?: number;
  }) {
    const id = Date.now().toString()
    
    notifications.value.push({
      id,
      type,
      message,
      duration
    })
    
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }
    
    return id
  }
  
  function removeNotification(id: string) {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index !== -1) {
      notifications.value.splice(index, 1)
    }
  }
  
  function clearNotifications() {
    notifications.value = []
  }
  
  // Actions - View
  function setTaskViewMode(mode: 'list' | 'card') {
    taskViewMode.value = mode
  }
  
  function toggleTaskViewMode() {
    taskViewMode.value = taskViewMode.value === 'list' ? 'card' : 'list'
  }
  
  return {
    // State
    isTaskModalOpen,
    activeTaskId,
    isLoading,
    loadingMessage,
    isSidebarOpen,
    notifications,
    taskViewMode,
    
    // Actions
    openTaskModal,
    closeTaskModal,
    startLoading,
    stopLoading,
    toggleSidebar,
    openSidebar,
    closeSidebar,
    addNotification,
    removeNotification,
    clearNotifications,
    setTaskViewMode,
    toggleTaskViewMode
  }
})

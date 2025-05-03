import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { Task } from '../../types'
import db from '../../services/database'
import taskRepository from '../../services/taskRepository'

/**
 * Tasks Store - Manages the application's tasks state
 * 
 * Uses IndexedDB for persistence via the taskRepository service
 */
export const useTasksStore = defineStore('tasks', () => {
  // State
  const tasks = ref<Task[]>([])
  const isLoading = ref(false)
  const isInitialized = ref(false)
  const error = ref<string | null>(null)
  const activeFilter = ref<string | null>(null)
  const activeSort = ref<{field: string, direction: 'asc' | 'desc'}>({
    field: 'dueDate',
    direction: 'asc'
  })
  const searchQuery = ref('')

  // Getters
  const allTasks = computed(() => tasks.value)
  
  const activeTasks = computed(() => 
    tasks.value.filter(task => !task.completed)
  )
  
  const completedTasks = computed(() => 
    tasks.value.filter(task => task.completed)
  )
  
  const overdueTasks = computed(() => {
    const now = new Date()
    return tasks.value.filter(task => 
      !task.completed && new Date(task.dueDate) < now
    )
  })

  const tasksDueToday = computed(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    return tasks.value.filter(task => {
      const dueDate = new Date(task.dueDate)
      return !task.completed && dueDate >= today && dueDate < tomorrow
    })
  })

  const tasksDueThisWeek = computed(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfWeek = new Date(today)
    endOfWeek.setDate(today.getDate() + (7 - today.getDay()))
    
    return tasks.value.filter(task => {
      const dueDate = new Date(task.dueDate)
      return !task.completed && dueDate >= today && dueDate <= endOfWeek
    })
  })
  
  const getTaskById = computed(() => 
    (id: string) => tasks.value.find(task => task.id === id)
  )

  const filteredTasks = computed(() => {
    let result = [...tasks.value]
    
    // Apply search filter
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter(task => 
        task.title.toLowerCase().includes(query) || 
        task.description.toLowerCase().includes(query)
      )
    }
    
    // Apply active filter if set
    if (activeFilter.value) {
      switch (activeFilter.value) {
        case 'active':
          result = result.filter(task => !task.completed)
          break
        case 'completed':
          result = result.filter(task => task.completed)
          break
        case 'overdue':
          const now = new Date()
          result = result.filter(task => !task.completed && new Date(task.dueDate) < now)
          break
        case 'today':
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          const tomorrow = new Date(today)
          tomorrow.setDate(tomorrow.getDate() + 1)
          result = result.filter(task => {
            const dueDate = new Date(task.dueDate)
            return !task.completed && dueDate >= today && dueDate < tomorrow
          })
          break
        // Add more filters as needed
      }
    }
    
    // Apply sorting
    if (activeSort.value) {
      result.sort((a, b) => {
        let aValue: any = null
        let bValue: any = null
        
        switch (activeSort.value.field) {
          case 'dueDate':
            aValue = new Date(a.dueDate).getTime()
            bValue = new Date(b.dueDate).getTime()
            break
          case 'priority':
            const priorityOrder: Record<string, number> = { 'low': 0, 'medium': 1, 'high': 2, 'critical': 3 }
            aValue = priorityOrder[a.priority] ?? 0
            bValue = priorityOrder[b.priority] ?? 0
            break
          case 'title':
            aValue = a.title.toLowerCase()
            bValue = b.title.toLowerCase()
            break
          case 'createdAt':
            aValue = new Date(a.createdAt).getTime()
            bValue = new Date(b.createdAt).getTime()
            break
          default:
            const field = activeSort.value.field as keyof Task
            aValue = a[field]
            bValue = b[field]
        }
        
        // Handle null or undefined values
        if (aValue === null || aValue === undefined) aValue = 0
        if (bValue === null || bValue === undefined) bValue = 0
        
        if (activeSort.value.direction === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
        }
      })
    }
    
    return result
  })

  const tasksByTag = computed(() => {
    const result: Record<string, Task[]> = {}
    
    // Create a map of tag -> tasks
    tasks.value.forEach(task => {
      task.tags.forEach(tag => {
        if (!result[tag]) {
          result[tag] = []
        }
        result[tag].push(task)
      })
    })
    
    return result
  })

  const availableTags = computed(() => {
    const tags = new Set<string>()
    
    tasks.value.forEach(task => {
      task.tags.forEach(tag => tags.add(tag))
    })
    
    return Array.from(tags).sort()
  })
  
  // Actions
  async function fetchAllTasks() {
    isLoading.value = true
    error.value = null
    
    try {
      const fetchedTasks = await taskRepository.getAll()
      tasks.value = fetchedTasks
      isInitialized.value = true
    } catch (err) {
      console.error('Failed to fetch tasks:', err)
      error.value = 'Failed to load tasks. Please try again.'
    } finally {
      isLoading.value = false
    }
  }
  
  async function addTask(taskData: Partial<Task>): Promise<Task | null> {
    isLoading.value = true
    error.value = null
    
    try {
      const newTask = await taskRepository.create(taskData)
      tasks.value.push(newTask)
      return newTask
    } catch (err) {
      console.error('Failed to add task:', err)
      error.value = 'Failed to add task. Please try again.'
      return null
    } finally {
      isLoading.value = false
    }
  }
  
  async function updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
    isLoading.value = true
    error.value = null
    
    try {
      const updatedTask = await taskRepository.update(id, updates)
      
      if (updatedTask) {
        const index = tasks.value.findIndex(task => task.id === id)
        if (index !== -1) {
          tasks.value[index] = updatedTask
        }
      }
      
      return updatedTask
    } catch (err) {
      console.error('Failed to update task:', err)
      error.value = 'Failed to update task. Please try again.'
      return null
    } finally {
      isLoading.value = false
    }
  }
  
  async function deleteTask(id: string): Promise<boolean> {
    isLoading.value = true
    error.value = null
    
    try {
      const success = await taskRepository.delete(id)
      
      if (success) {
        tasks.value = tasks.value.filter(task => task.id !== id)
      }
      
      return success
    } catch (err) {
      console.error('Failed to delete task:', err)
      error.value = 'Failed to delete task. Please try again.'
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  async function toggleTaskCompletion(id: string): Promise<Task | null> {
    try {
      const updatedTask = await taskRepository.toggleCompletion(id)
      
      if (updatedTask) {
        const index = tasks.value.findIndex(task => task.id === id)
        if (index !== -1) {
          tasks.value[index] = updatedTask
        }
      }
      
      return updatedTask
    } catch (err) {
      console.error('Failed to toggle task completion:', err)
      error.value = 'Failed to update task. Please try again.'
      return null
    }
  }
  
  async function addSubtask(taskId: string, title: string): Promise<Task | null> {
    try {
      const updatedTask = await taskRepository.addSubtask(taskId, title)
      
      if (updatedTask) {
        const index = tasks.value.findIndex(task => task.id === taskId)
        if (index !== -1) {
          tasks.value[index] = updatedTask
        }
      }
      
      return updatedTask
    } catch (err) {
      console.error('Failed to add subtask:', err)
      error.value = 'Failed to add subtask. Please try again.'
      return null
    }
  }
  
  async function toggleSubtaskCompletion(taskId: string, subtaskId: string): Promise<Task | null> {
    try {
      const updatedTask = await taskRepository.toggleSubtaskCompletion(taskId, subtaskId)
      
      if (updatedTask) {
        const index = tasks.value.findIndex(task => task.id === taskId)
        if (index !== -1) {
          tasks.value[index] = updatedTask
        }
      }
      
      return updatedTask
    } catch (err) {
      console.error('Failed to toggle subtask completion:', err)
      error.value = 'Failed to update subtask. Please try again.'
      return null
    }
  }
  
  async function clearCompletedTasks(): Promise<void> {
    isLoading.value = true
    error.value = null
    
    try {
      await taskRepository.clearCompletedTasks()
      tasks.value = tasks.value.filter(task => !task.completed)
    } catch (err) {
      console.error('Failed to clear completed tasks:', err)
      error.value = 'Failed to clear completed tasks. Please try again.'
    } finally {
      isLoading.value = false
    }
  }

  function setActiveFilter(filter: string | null): void {
    activeFilter.value = filter
  }

  function setActiveSort(field: string, direction: 'asc' | 'desc'): void {
    activeSort.value = { field, direction }
  }

  function setSearchQuery(query: string): void {
    searchQuery.value = query
  }

  async function addTag(taskId: string, tag: string): Promise<Task | null> {
    const task = tasks.value.find(t => t.id === taskId)
    
    if (!task) return null
    
    // Don't add duplicate tags
    if (task.tags.includes(tag)) return task
    
    const tags = [...task.tags, tag]
    return await updateTask(taskId, { tags })
  }

  async function removeTag(taskId: string, tag: string): Promise<Task | null> {
    const task = tasks.value.find(t => t.id === taskId)
    
    if (!task) return null
    
    const tags = task.tags.filter(t => t !== tag)
    return await updateTask(taskId, { tags })
  }
  
  // Helper functions for persistence
  async function initializeTasks(): Promise<void> {
    if (isInitialized.value) return
    
    try {
      isLoading.value = true
      
      // Initialize the database
      await db.initialize()
      
      // Fetch all tasks
      await fetchAllTasks()
      
    } catch (error) {
      console.error('Failed to initialize tasks:', error)
    } finally {
      isLoading.value = false
    }
  }
  
  // Data import/export functions
  async function importTasks(importedTasks: Task[]): Promise<void> {
    isLoading.value = true
    error.value = null
    
    try {
      // First, clear the database to avoid duplicates
      await clearAllTasks(false) // Don't update state yet
      
      // Process tasks to ensure they have valid Date objects
      const processedTasks = importedTasks.map(task => {
        return {
          ...task,
          dueDate: new Date(task.dueDate),
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
          completedAt: task.completedAt ? new Date(task.completedAt) : null
        }
      })
      
      // Add all tasks to the database
      const addedTasks: Task[] = []
      for (const task of processedTasks) {
        const newTask = await taskRepository.create(task)
        if (newTask) {
          addedTasks.push(newTask)
        }
      }
      
      // Update the state
      tasks.value = addedTasks
    } catch (err) {
      console.error('Failed to import tasks:', err)
      error.value = 'Failed to import tasks. Please try again.'
    } finally {
      isLoading.value = false
    }
  }
  
  async function clearAllTasks(updateState = true): Promise<void> {
    isLoading.value = true
    error.value = null
    
    try {
      // Clear all tasks from the database
      await db.tasks.clear()
      
      // Update the state if requested
      if (updateState) {
        tasks.value = []
      }
    } catch (err) {
      console.error('Failed to clear all tasks:', err)
      error.value = 'Failed to clear all tasks. Please try again.'
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    tasks,
    isLoading,
    isInitialized,
    error,
    activeFilter,
    activeSort,
    searchQuery,
    
    // Getters
    allTasks,
    activeTasks,
    completedTasks,
    overdueTasks,
    tasksDueToday,
    tasksDueThisWeek,
    getTaskById,
    filteredTasks,
    tasksByTag,
    availableTags,
    
    // Actions
    fetchAllTasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    addSubtask,
    toggleSubtaskCompletion,
    clearCompletedTasks,
    initializeTasks,
    setActiveFilter,
    setActiveSort,
    setSearchQuery,
    addTag,
    removeTag,
    
    // Import/Export
    importTasks,
    clearAllTasks
  }
})

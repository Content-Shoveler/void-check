import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Task } from '../../types'
import { v4 as uuidv4 } from 'uuid'

export const useTasksStore = defineStore('tasks', () => {
  // State
  const tasks = ref<Task[]>([])
  const isInitialized = ref(false)
  
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
  
  const getTaskById = computed(() => 
    (id: string) => tasks.value.find(task => task.id === id)
  )
  
  // Actions
  function addTask(taskData: Partial<Task>): Task {
    const now = new Date()
    
    const newTask: Task = {
      id: uuidv4(),
      title: taskData.title || 'New Task',
      description: taskData.description || '',
      dueDate: taskData.dueDate || new Date(now.getTime() + 24 * 60 * 60 * 1000), // Default: tomorrow
      createdAt: now,
      updatedAt: now,
      completedAt: null,
      completed: false,
      priority: taskData.priority || 'medium',
      tags: taskData.tags || [],
      color: taskData.color || '#00F5FF', // Default: cyan
      effectType: taskData.effectType || 'glow',
      isRecurring: taskData.isRecurring || false,
      recurringPattern: taskData.recurringPattern,
      notifications: taskData.notifications || {
        enabled: true,
        reminderTime: 30  // Default: 30 minutes before
      },
      subtasks: taskData.subtasks || [],
      notes: taskData.notes || '',
      links: taskData.links || [],
      history: [
        {
          timestamp: now,
          action: 'created'
        }
      ]
    }
    
    tasks.value.push(newTask)
    saveTasks()
    
    return newTask
  }
  
  function updateTask(id: string, updates: Partial<Task>): Task | null {
    const taskIndex = tasks.value.findIndex(task => task.id === id)
    
    if (taskIndex === -1) return null
    
    const task = tasks.value[taskIndex]
    const now = new Date()
    
    // Create history record
    const historyEntry = {
      timestamp: now,
      action: 'updated',
      previousState: { ...task }
    }
    
    // Update the task
    const updatedTask = {
      ...task,
      ...updates,
      updatedAt: now,
      history: [...task.history, historyEntry]
    }
    
    // If marking as complete, set completedAt
    if (updates.completed && !task.completed) {
      updatedTask.completedAt = now
    }
    // If marking as incomplete, clear completedAt
    else if (updates.completed === false && task.completed) {
      updatedTask.completedAt = null
    }
    
    tasks.value[taskIndex] = updatedTask
    saveTasks()
    
    return updatedTask
  }
  
  function deleteTask(id: string): boolean {
    const taskIndex = tasks.value.findIndex(task => task.id === id)
    
    if (taskIndex === -1) return false
    
    tasks.value.splice(taskIndex, 1)
    saveTasks()
    
    return true
  }
  
  function toggleTaskCompletion(id: string): Task | null {
    const task = tasks.value.find(task => task.id === id)
    
    if (!task) return null
    
    return updateTask(id, { completed: !task.completed })
  }
  
  function addSubtask(taskId: string, title: string): Task | null {
    const task = tasks.value.find(task => task.id === taskId)
    
    if (!task) return null
    
    const subtasks = [...task.subtasks, {
      id: uuidv4(),
      title,
      completed: false
    }]
    
    return updateTask(taskId, { subtasks })
  }
  
  function toggleSubtaskCompletion(taskId: string, subtaskId: string): Task | null {
    const task = tasks.value.find(task => task.id === taskId)
    
    if (!task) return null
    
    const subtaskIndex = task.subtasks.findIndex(subtask => subtask.id === subtaskId)
    
    if (subtaskIndex === -1) return null
    
    const subtasks = [...task.subtasks]
    subtasks[subtaskIndex] = {
      ...subtasks[subtaskIndex],
      completed: !subtasks[subtaskIndex].completed
    }
    
    return updateTask(taskId, { subtasks })
  }
  
  function clearCompletedTasks(): void {
    tasks.value = tasks.value.filter(task => !task.completed)
    saveTasks()
  }
  
  // Helper functions for persistence
  function initializeTasks(): void {
    if (isInitialized.value) return
    
    loadTasks()
    isInitialized.value = true
  }
  
  function loadTasks(): void {
    try {
      const savedTasks = localStorage.getItem('cybertodo_tasks')
      
      if (savedTasks) {
        const parsedTasks = JSON.parse(savedTasks)
        
        // Convert date strings to Date objects
        tasks.value = parsedTasks.map((task: any) => ({
          ...task,
          dueDate: new Date(task.dueDate),
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
          completedAt: task.completedAt ? new Date(task.completedAt) : null,
          history: task.history.map((entry: any) => ({
            ...entry,
            timestamp: new Date(entry.timestamp)
          })),
          recurringPattern: task.recurringPattern ? {
            ...task.recurringPattern,
            endDate: task.recurringPattern.endDate ? new Date(task.recurringPattern.endDate) : undefined
          } : undefined
        }))
      }
    } catch (error) {
      console.error('Failed to load tasks:', error)
      tasks.value = []
    }
  }
  
  function saveTasks(): void {
    try {
      localStorage.setItem('cybertodo_tasks', JSON.stringify(tasks.value))
    } catch (error) {
      console.error('Failed to save tasks:', error)
    }
  }
  
  return {
    // State
    tasks,
    isInitialized,
    
    // Getters
    allTasks,
    activeTasks,
    completedTasks,
    overdueTasks,
    getTaskById,
    
    // Actions
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    addSubtask,
    toggleSubtaskCompletion,
    clearCompletedTasks,
    initializeTasks
  }
})

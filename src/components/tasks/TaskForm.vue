<template>
  <form class="task-form" @submit.prevent="handleSubmit">
    <div class="form-group">
      <label for="taskTitle">Title</label>
      <input 
        id="taskTitle" 
        v-model="taskData.title" 
        type="text" 
        class="form-input" 
        required
        placeholder="Enter task title..."
        :disabled="isReadOnly"
      >
    </div>
    
    <div class="form-group">
      <label for="taskDescription">Description</label>
      <textarea 
        id="taskDescription" 
        v-model="taskData.description" 
        class="form-textarea"
        rows="4"
        placeholder="Enter task description..."
        :disabled="isReadOnly"
      ></textarea>
    </div>
    
    <div class="form-row">
      <div class="form-group">
        <label for="taskDueDate">Due Date</label>
        <input 
          id="taskDueDate" 
          v-model="dueDate" 
          type="datetime-local" 
          class="form-input" 
          required
          :disabled="isReadOnly"
        >
      </div>
      
      <div class="form-group">
        <label for="taskPriority">Priority</label>
        <select 
          id="taskPriority" 
          v-model="taskData.priority" 
          class="form-select"
          :disabled="isReadOnly"
        >
          <option value="1">Very Low</option>
          <option value="2">Low</option>
          <option value="3">Medium</option>
          <option value="4">High</option>
          <option value="5">Very High</option>
        </select>
      </div>
    </div>
    
    <div class="form-group">
      <label for="taskTags">Tags</label>
      <div class="tags-input-container">
        <div class="tags-list">
          <span 
            v-for="(tag, index) in taskData.tags" 
            :key="index" 
            class="tag"
          >
            {{ tag }}
            <button 
              type="button"
              class="tag-remove-btn"
              @click="removeTag(index)"
              v-if="!isReadOnly"
            >×</button>
          </span>
        </div>
        <input 
          id="taskTags" 
          v-model="newTag" 
          type="text" 
          class="tag-input" 
          placeholder="Add a tag, press Enter..."
          @keydown.enter.prevent="addTag"
          :disabled="isReadOnly"
          v-if="!isReadOnly"
        >
      </div>
    </div>
    
    <div class="form-group">
      <label>External Links</label>
      <div class="links-container">
        <div 
          v-for="(link, index) in taskData.externalLinks" 
          :key="index" 
          class="link-item"
        >
          <div class="link-content">
            <strong>{{ link.title }}</strong>
            <a :href="link.url" target="_blank" rel="noopener noreferrer">{{ link.url }}</a>
          </div>
          <button 
            type="button"
            class="link-remove-btn"
            @click="removeLink(index)"
            v-if="!isReadOnly"
          >×</button>
        </div>
        
        <div class="add-link-form" v-if="!isReadOnly">
          <div class="form-row">
            <input 
              v-model="newLinkTitle" 
              type="text" 
              class="form-input" 
              placeholder="Link title..."
            >
            <input 
              v-model="newLinkUrl" 
              type="url" 
              class="form-input" 
              placeholder="URL..."
            >
            <button 
              type="button"
              class="link-add-btn"
              @click="addLink"
              :disabled="!newLinkTitle || !newLinkUrl"
            >+</button>
          </div>
        </div>
      </div>
    </div>
    
    <div class="form-group completed-group">
      <label for="taskCompleted" class="checkbox-label">
        <input 
          id="taskCompleted" 
          v-model="taskData.completed" 
          type="checkbox"
          :disabled="isReadOnly"
        >
        <span class="checkbox-text">Mark as completed</span>
      </label>
    </div>
    
    <div class="form-actions">
      <button 
        type="button" 
        class="btn-secondary" 
        @click="$emit('cancel')"
      >
        {{ isReadOnly ? 'Close' : 'Cancel' }}
      </button>
      
      <div v-if="!isReadOnly">
        <button type="submit" class="btn-primary">
          {{ isNewTask ? 'Create Task' : 'Update Task' }}
        </button>
      </div>
      
      <div v-else>
        <button 
          type="button" 
          class="btn-primary" 
          @click="$emit('edit')"
        >
          Edit
        </button>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import type { Task, LinkItem } from '@/data/models/Task';

// Props
interface Props {
  task?: Task;
  mode: 'create' | 'edit' | 'view';
}

const props = withDefaults(defineProps<Props>(), {
  task: undefined,
  mode: 'create'
});

// Emits
const emit = defineEmits<{
  (e: 'submit', task: Partial<Task>): void;
  (e: 'cancel'): void;
  (e: 'edit'): void;
}>();

// Form state
const taskData = ref<Partial<Task>>({
  title: '',
  description: '',
  dueDate: new Date(),
  priority: 3,
  completed: false,
  tags: [],
  externalLinks: []
});

// Computed properties
const isNewTask = computed(() => !props.task?.id);
const isReadOnly = computed(() => props.mode === 'view');

// For date input
const dueDate = computed({
  get: () => {
    const date = new Date(taskData.value.dueDate || new Date());
    // Format for datetime-local input: YYYY-MM-DDThh:mm
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
      .toISOString()
      .slice(0, 16);
  },
  set: (val: string) => {
    taskData.value.dueDate = new Date(val);
  }
});

// For adding tags
const newTag = ref('');

// For adding links
const newLinkTitle = ref('');
const newLinkUrl = ref('');

// Methods
const handleSubmit = () => {
  emit('submit', taskData.value);
};

const addTag = () => {
  const tag = newTag.value.trim();
  if (tag && !taskData.value.tags?.includes(tag)) {
    if (!taskData.value.tags) {
      taskData.value.tags = [];
    }
    taskData.value.tags.push(tag);
  }
  newTag.value = '';
};

const removeTag = (index: number) => {
  if (taskData.value.tags) {
    taskData.value.tags.splice(index, 1);
  }
};

const addLink = () => {
  if (newLinkTitle.value.trim() && newLinkUrl.value.trim()) {
    if (!taskData.value.externalLinks) {
      taskData.value.externalLinks = [];
    }
    
    taskData.value.externalLinks.push({
      title: newLinkTitle.value.trim(),
      url: newLinkUrl.value.trim()
    });
    
    newLinkTitle.value = '';
    newLinkUrl.value = '';
  }
};

const removeLink = (index: number) => {
  if (taskData.value.externalLinks) {
    taskData.value.externalLinks.splice(index, 1);
  }
};

// Initialize form with task data if provided
watch(() => props.task, (newTask) => {
  if (newTask) {
    // Clone the task to avoid mutating the original
    taskData.value = JSON.parse(JSON.stringify(newTask));
  } else {
    // Reset to defaults for new task
    taskData.value = {
      title: '',
      description: '',
      dueDate: new Date(),
      priority: 3,
      completed: false,
      tags: [],
      externalLinks: []
    };
  }
}, { immediate: true });
</script>

<style lang="scss" scoped>
.task-form {
  background-color: var(--color-bg-secondary);
  border-radius: var(--border-radius-lg);
  padding: var(--space-xl);
  box-shadow: var(--shadow-md);
}

.form-group {
  margin-bottom: var(--space-md);
  
  label {
    display: block;
    margin-bottom: var(--space-xs);
    font-family: var(--font-family-mono);
    font-weight: bold;
    color: var(--color-text-primary);
  }
}

.form-row {
  display: flex;
  gap: var(--space-md);
  
  .form-group {
    flex: 1;
  }
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: var(--space-sm);
  background-color: var(--color-bg-tertiary);
  border: 1px solid transparent;
  border-radius: var(--border-radius-sm);
  color: var(--color-text-primary);
  font-family: var(--font-family-sans);
  
  &:focus {
    outline: none;
    border-color: var(--color-accent);
    box-shadow: 0 0 0 2px rgba(57, 208, 208, 0.2);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    background-color: var(--color-bg-secondary);
    border: 1px solid var(--color-bg-tertiary);
  }
}

.tags-input-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
  margin-bottom: var(--space-xs);
}

.tag {
  background-color: var(--color-bg-tertiary);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--border-radius-sm);
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.tag-input {
  padding: var(--space-xs) var(--space-sm);
  background-color: var(--color-bg-tertiary);
  border: 1px solid transparent;
  border-radius: var(--border-radius-sm);
  color: var(--color-text-primary);
  
  &:focus {
    outline: none;
    border-color: var(--color-accent);
  }
}

.tag-remove-btn {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: 1rem;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: var(--color-warning);
  }
}

.links-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.link-item {
  background-color: var(--color-bg-tertiary);
  padding: var(--space-sm);
  border-radius: var(--border-radius-sm);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.link-content {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  
  a {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.link-remove-btn {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: 1.25rem;
  
  &:hover {
    color: var(--color-warning);
  }
}

.add-link-form {
  margin-top: var(--space-xs);
  
  .form-row {
    gap: var(--space-xs);
  }
  
  .link-add-btn {
    background-color: var(--color-accent);
    color: var(--color-text-primary);
    border: none;
    border-radius: var(--border-radius-sm);
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 1.25rem;
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    &:hover:not(:disabled) {
      background-color: var(--color-primary);
    }
  }
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  cursor: pointer;
  
  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
  
  .checkbox-text {
    font-family: var(--font-family-sans);
    font-weight: normal;
  }
}

.completed-group {
  margin-top: var(--space-lg);
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-bg-tertiary);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-md);
  margin-top: var(--space-xl);
}

.btn-primary, 
.btn-secondary {
  font-family: var(--font-family-mono);
  font-weight: bold;
  padding: var(--space-sm) var(--space-lg);
  border: none;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: 
    background-color var(--transition-fast),
    transform var(--transition-fast);
}

.btn-primary {
  background-color: var(--color-accent);
  color: var(--color-text-primary);
  
  &:hover {
    background-color: var(--color-primary);
    transform: translateY(-2px);
  }
}

.btn-secondary {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  
  &:hover {
    background-color: var(--color-bg-tertiary);
    transform: translateY(-2px);
  }
}
</style>

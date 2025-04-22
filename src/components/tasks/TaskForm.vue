<template>
  <div class="task-form">
    <div class="form-group">
      <label for="title">Title</label>
      <input
        id="title"
        v-model="formData.title"
        @input="updateField('title', formData.title)"
        placeholder="Task title"
        class="form-control"
        :class="{ 'error': errors.title }"
      />
      <div v-if="errors.title" class="error-message">{{ errors.title }}</div>
    </div>
    
    <div class="form-group">
      <label for="description">Description</label>
      <textarea
        id="description"
        v-model="formData.description"
        @input="updateField('description', formData.description)"
        placeholder="Task description"
        class="form-control"
        rows="4"
      ></textarea>
    </div>
    
    <div class="form-group">
      <label for="dueDate">Due Date</label>
      <input
        id="dueDate"
        type="datetime-local"
        v-model="dueDateString"
        @input="updateDueDate"
        class="form-control"
      />
    </div>
    
    <div class="form-group">
      <label>Priority</label>
      <div class="priority-options">
        <label v-for="priority in priorities" :key="priority.value" class="priority-option">
          <input
            type="radio"
            :value="priority.value"
            v-model="formData.priority"
            @change="updateField('priority', formData.priority)"
            name="priority"
          />
          <span>{{ priority.label }}</span>
        </label>
      </div>
    </div>
    
    <div class="form-group">
      <label for="tags">Tags</label>
      <input
        id="tags"
        v-model="tagsInput"
        @keydown.enter.prevent="addTag"
        @blur="addTag"
        placeholder="Add tags (comma separated)"
        class="form-control"
      />
      <div class="tags-container" v-if="formData.tags.length > 0">
        <span 
          v-for="(tag, index) in formData.tags" 
          :key="index" 
          class="tag"
        >
          {{ tag }}
          <button type="button" class="tag-remove" @click="removeTag(index)">×</button>
        </span>
      </div>
    </div>
    
    <div class="form-group">
      <label>External Links</label>
      <div 
        v-for="(link, index) in formData.externalLinks" 
        :key="index"
        class="external-link-item"
      >
        <div class="external-link-fields">
          <input
            v-model="link.title"
            @input="updateExternalLinks"
            placeholder="Link Title"
            class="form-control"
          />
          <input
            v-model="link.url"
            @input="updateExternalLinks"
            placeholder="URL"
            class="form-control"
          />
        </div>
        <button 
          type="button" 
          class="remove-link-button"
          @click="removeExternalLink(index)"
        >
          ×
        </button>
      </div>
      <button 
        type="button" 
        class="add-link-button"
        @click="addExternalLink"
      >
        + Add Link
      </button>
    </div>
    
    <div class="form-group toggle-group">
      <label>Status</label>
      <v-button 
        :variant="formData.completed ? 'success' : 'warning'" 
        @click="toggleCompletion"
      >
        {{ formData.completed ? 'Completed' : 'Pending' }}
      </v-button>
    </div>
    
    <div class="task-actions">
      <v-button 
        variant="danger" 
        @click="$emit('delete')"
        v-if="task?.id"
      >
        Delete Task
      </v-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, onMounted } from 'vue';
import { useTaskStore } from '@/store/task';
import { Task, TaskPriority, createTask } from '@/data/models/Task';
import VButton from '@/components/ui/base/VButton.vue';
import debounce from 'lodash.debounce';

export default defineComponent({
  name: 'TaskForm',
  
  components: {
    VButton
  },
  
  props: {
    task: {
      type: Object as () => Task | null,
      default: null
    }
  },
  
  emits: ['update', 'delete', 'close'],
  
  setup(props, { emit }) {
    const taskStore = useTaskStore();
    const formData = ref<Task>(createTask());
    const errors = ref<Record<string, string>>({});
    const tagsInput = ref('');
    
    // Create a debounced save function to prevent excessive updates
    const debouncedSave = debounce(async (updatedTask: Task) => {
      // For existing tasks, validate before saving
      if (updatedTask.id.startsWith('task_')) {
        if (!validateForm()) return;
        
        await taskStore.updateTask(updatedTask);
        emit('update', updatedTask);
      } else {
        // For new tasks, only save if there's a title
        if (updatedTask.title.trim()) {
          const newTaskId = await taskStore.addTask(updatedTask);
          if (newTaskId) {
            // Update the form data with the new ID
            formData.value.id = newTaskId;
            emit('update', formData.value);
          }
        }
      }
    }, 500);
    
    // Initialize form with task data if available
    onMounted(() => {
      if (props.task) {
        formData.value = { ...props.task };
      }
    });
    
    // Watch for changes in the task prop
    watch(() => props.task, (newTask) => {
      if (newTask) {
        formData.value = { ...newTask };
      } else {
        formData.value = createTask();
      }
    });
    
    // Format due date for input
    const dueDateString = computed({
      get: () => {
        if (!formData.value.dueDate) return '';
        
        const date = new Date(formData.value.dueDate);
        return date.toISOString().slice(0, 16); // Format as YYYY-MM-DDTHH:MM
      },
      set: (value: string) => {
        if (value) {
          formData.value.dueDate = new Date(value);
        }
      }
    });
    
    // Update due date
    const updateDueDate = () => {
      updateField('dueDate', formData.value.dueDate);
    };
    
    // Available priorities
    const priorities = [
      { value: TaskPriority.LOW, label: 'Low' },
      { value: TaskPriority.MEDIUM, label: 'Medium' },
      { value: TaskPriority.HIGH, label: 'High' },
      { value: TaskPriority.CRITICAL, label: 'Critical' }
    ];
    
    // Update a field and save changes
    const updateField = (field: string, value: any) => {
      formData.value = { ...formData.value, [field]: value };
      
      // Validate before saving
      validateField(field);
      if (!errors.value[field]) {
        debouncedSave(formData.value);
      }
    };
    
    // Validate a specific field
    const validateField = (field: string) => {
      if (field === 'title' && !formData.value.title?.trim()) {
        errors.value.title = 'Title is required';
      } else if (field === 'title') {
        delete errors.value.title;
      }
    };
    
    // Validate the entire form
    const validateForm = () => {
      errors.value = {};
      
      if (!formData.value.title?.trim()) {
        errors.value.title = 'Title is required';
      }
      
      return Object.keys(errors.value).length === 0;
    };
    
    // Toggle task completion status
    const toggleCompletion = async () => {
      formData.value.completed = !formData.value.completed;
      updateField('completed', formData.value.completed);
    };
    
    // Add a tag from the input
    const addTag = () => {
      const tags = tagsInput.value
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag && !formData.value.tags.includes(tag));
      
      if (tags.length > 0) {
        formData.value.tags = [...formData.value.tags, ...tags];
        updateField('tags', formData.value.tags);
        tagsInput.value = '';
      }
    };
    
    // Remove a tag
    const removeTag = (index: number) => {
      const newTags = [...formData.value.tags];
      newTags.splice(index, 1);
      formData.value.tags = newTags;
      updateField('tags', formData.value.tags);
    };
    
    // Add a new external link
    const addExternalLink = () => {
      formData.value.externalLinks.push({ title: '', url: '' });
      updateField('externalLinks', formData.value.externalLinks);
    };
    
    // Remove an external link
    const removeExternalLink = (index: number) => {
      const newLinks = [...formData.value.externalLinks];
      newLinks.splice(index, 1);
      formData.value.externalLinks = newLinks;
      updateField('externalLinks', formData.value.externalLinks);
    };
    
    // Update external links when they change
    const updateExternalLinks = () => {
      updateField('externalLinks', formData.value.externalLinks);
    };
    
    return {
      formData,
      errors,
      tagsInput,
      dueDateString,
      priorities,
      updateField,
      updateDueDate,
      toggleCompletion,
      addTag,
      removeTag,
      addExternalLink,
      removeExternalLink,
      updateExternalLinks
    };
  }
});
</script>

<style lang="scss" scoped>
.task-form {
  max-width: 100%;
  
  .form-group {
    margin-bottom: 1.5rem;
    
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
    
    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid var(--color-divider);
      border-radius: var(--radius-md);
      background-color: var(--color-bg-input);
      color: var(--color-text);
      transition: border-color 0.2s, box-shadow 0.2s;
      
      &:focus {
        outline: none;
        border-color: var(--color-primary);
        box-shadow: 0 0 0 2px rgba(156, 39, 176, 0.2);
      }
      
      &.error {
        border-color: var(--color-danger);
      }
    }
    
    .error-message {
      margin-top: 0.25rem;
      color: var(--color-danger);
      font-size: 0.875rem;
    }
    
    &.toggle-group {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  }
  
  .priority-options {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    
    .priority-option {
      display: flex;
      align-items: center;
      cursor: pointer;
      
      input {
        margin-right: 0.5rem;
      }
    }
  }
  
  .tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.5rem;
    
    .tag {
      background-color: var(--color-primary);
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: var(--radius-circle);
      font-size: 0.75rem;
      display: flex;
      align-items: center;
      
      .tag-remove {
        background: none;
        border: none;
        color: white;
        margin-left: 0.25rem;
        cursor: pointer;
        font-size: 1rem;
        line-height: 1;
        padding: 0 0.25rem;
      }
    }
  }
  
  .external-link-item {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
    
    .external-link-fields {
      display: flex;
      flex: 1;
      gap: 0.5rem;
      
      input {
        flex: 1;
      }
    }
    
    .remove-link-button {
      background: none;
      border: none;
      color: var(--color-danger);
      cursor: pointer;
      font-size: 1.25rem;
      padding: 0;
      display: flex;
      align-items: center;
    }
  }
  
  .add-link-button {
    background: none;
    border: 1px solid var(--color-primary);
    color: var(--color-primary);
    padding: 0.5rem 1rem;
    border-radius: var(--radius-md);
    cursor: pointer;
    font-size: 0.875rem;
    
    &:hover {
      background-color: rgba(156, 39, 176, 0.1);
    }
  }
  
  .task-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 2rem;
  }
}
</style>

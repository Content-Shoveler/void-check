<template>
  <CyberModal :open="isOpen" title="Task Details" @close="onCancel">
    <div class="task-modal">
      <form @submit.prevent="onSave">
        <div class="task-modal__section">
          <div class="task-modal__field">
            <label for="task-title" class="task-modal__label">Title</label>
            <CyberInput
              id="task-title"
              v-model="form.title"
              placeholder="Task title"
              :error="validation.title"
              required
              autofocus
            />
          </div>
          
          <div class="task-modal__field">
            <label for="task-description" class="task-modal__label">Description</label>
            <CyberInput
              id="task-description"
              v-model="form.description"
              placeholder="Task description"
              multiline
              :rows="3"
            />
          </div>
        </div>
        
        <div class="task-modal__section">
          <div class="task-modal__row">
            <div class="task-modal__field task-modal__field--half">
              <label for="task-due-date" class="task-modal__label">Due Date</label>
              <CyberInput
                id="task-due-date"
                v-model="form.dueDateString"
                type="date"
                placeholder="Due date"
                :min="minDateString"
                required
              />
            </div>
            
            <div class="task-modal__field task-modal__field--half">
              <label for="task-due-time" class="task-modal__label">Due Time</label>
              <CyberInput
                id="task-due-time"
                v-model="form.dueTimeString"
                type="time"
                placeholder="Due time"
              />
            </div>
          </div>
          
          <div class="task-modal__field">
            <label for="task-priority" class="task-modal__label">Priority</label>
            <div class="task-modal__priority-selector">
              <div
                v-for="priority in priorities"
                :key="priority.value"
                class="task-modal__priority-option"
                :class="{
                  'task-modal__priority-option--selected': form.priority === priority.value
                }"
                @click="setPriority(priority.value)"
              >
                <div 
                  class="task-modal__priority-indicator" 
                  :class="`task-modal__priority-indicator--${priority.value}`"
                ></div>
                <span>{{ priority.label }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="task-modal__section">
          <div class="task-modal__field">
            <div class="task-modal__label-row">
              <label class="task-modal__label">Tags</label>
              <CyberButton
                v-if="tagInput.trim()"
                variant="ghost"
                size="small"
                @click="addTag"
              >
                Add
              </CyberButton>
            </div>
            <div class="task-modal__tags-input">
              <CyberInput
                v-model="tagInput"
                placeholder="Add a tag and press Enter"
                @keydown.enter.prevent="addTag"
              />
            </div>
            <div v-if="form.tags.length > 0" class="task-modal__tags">
              <div 
                v-for="(tag, index) in form.tags" 
                :key="index"
                class="task-modal__tag"
              >
                <span>{{ tag }}</span>
                <button 
                  type="button" 
                  class="task-modal__tag-remove" 
                  @click="removeTag(index)"
                  aria-label="Remove tag"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="task-modal__section">
          <div class="task-modal__field">
            <div class="task-modal__label-row">
              <label class="task-modal__label">Subtasks</label>
              <CyberButton
                v-if="subtaskInput.trim()"
                variant="ghost"
                size="small"
                @click="addSubtask"
              >
                Add
              </CyberButton>
            </div>
            <div class="task-modal__subtasks-input">
              <CyberInput
                v-model="subtaskInput"
                placeholder="Add a subtask and press Enter"
                @keydown.enter.prevent="addSubtask"
              />
            </div>
            <div v-if="form.subtasks.length > 0" class="task-modal__subtasks">
              <div 
                v-for="(subtask, index) in form.subtasks" 
                :key="subtask.id"
                class="task-modal__subtask"
              >
                <CyberCheckbox
                  v-model="subtask.completed"
                  :aria-label="subtask.completed ? 'Mark as incomplete' : 'Mark as complete'"
                />
                <span :class="{ 'task-modal__subtask--completed': subtask.completed }">
                  {{ subtask.title }}
                </span>
                <button 
                  type="button" 
                  class="task-modal__subtask-remove" 
                  @click="removeSubtask(index)"
                  aria-label="Remove subtask"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="task-modal__section">
          <div class="task-modal__field">
            <div class="task-modal__recurring">
              <CyberCheckbox
                id="task-recurring"
                v-model="form.isRecurring"
                label="Recurring Task"
              />
            </div>
            
            <div v-if="form.isRecurring" class="task-modal__recurring-options">
              <div class="task-modal__row">
                <div class="task-modal__field task-modal__field--half">
                  <label for="recurring-frequency" class="task-modal__label">Frequency</label>
                  <CyberSelect
                    id="recurring-frequency"
                    v-model="form.recurringPattern.frequency"
                    :options="recurringFrequencies"
                  />
                </div>
                
                <div class="task-modal__field task-modal__field--half">
                  <label for="recurring-interval" class="task-modal__label">Every</label>
                  <CyberInput
                    id="recurring-interval"
                    v-model="recurringIntervalInput"
                    type="number"
                    min="1"
                    :max="form.recurringPattern.frequency === 'yearly' ? 10 : 99"
                  />
                </div>
              </div>
              
              <div v-if="form.recurringPattern.frequency === 'weekly'" class="task-modal__field">
                <label class="task-modal__label">Days of week</label>
                <div class="task-modal__weekdays">
                  <CyberCheckbox
                    v-for="(day, index) in weekdays"
                    :key="day"
                    :label="day.substring(0, 1)"
                    :title="day"
                    :modelValue="isDaySelected(index)"
                    @update:modelValue="toggleDay(index)"
                  />
                </div>
              </div>
              
              <div class="task-modal__field">
                <CyberCheckbox
                  id="recurring-end-date"
                  v-model="hasEndDate"
                  label="End date"
                />
                
                <div v-if="hasEndDate" class="task-modal__field">
                  <CyberInput
                    v-model="form.recurringPattern.endDateString"
                    type="date"
                    :min="form.dueDateString"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="task-modal__section">
          <div class="task-modal__field">
            <div class="task-modal__label-row">
              <label class="task-modal__label">Notifications</label>
            </div>
            
            <div class="task-modal__notifications">
              <CyberToggle
                v-model="form.notifications.enabled"
                label="Enable notifications"
              />
              
              <div v-if="form.notifications.enabled" class="task-modal__field">
                <label for="notification-time" class="task-modal__label">
                  Remind me before
                </label>
                <div class="task-modal__notification-time">
                  <CyberInput
                    id="notification-time"
                    v-model="reminderTimeInput"
                    type="number"
                    min="0"
                    max="10080" 
                  />
                  <span class="task-modal__notification-unit">minutes</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="task-modal__section">
          <div class="task-modal__field">
            <label for="task-notes" class="task-modal__label">Notes</label>
            <CyberInput
              id="task-notes"
              v-model="form.notes"
              placeholder="Additional notes"
              multiline
              :rows="2"
            />
          </div>
        </div>
        
        <div class="task-modal__actions">
          <CyberButton 
            type="button" 
            variant="ghost" 
            @click="onCancel"
          >
            Cancel
          </CyberButton>
          <CyberButton 
            type="submit"
            :loading="isSaving"
          >
            {{ isEditing ? 'Update' : 'Create' }}
          </CyberButton>
        </div>
      </form>
    </div>
  </CyberModal>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import type { PropType } from 'vue';
import type { Task } from '../../types';
import CyberModal from '../cyber/modals/CyberModal.vue';
import CyberInput from '../cyber/inputs/CyberInput.vue';
import CyberButton from '../cyber/buttons/CyberButton.vue';
import CyberCheckbox from '../cyber/inputs/CyberCheckbox.vue';
import CyberToggle from '../cyber/inputs/CyberToggle.vue';
import CyberSelect from '../cyber/inputs/CyberSelect.vue';

export default defineComponent({
  name: 'TaskModal',
  components: {
    CyberModal,
    CyberInput,
    CyberButton,
    CyberCheckbox,
    CyberToggle,
    CyberSelect
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    task: {
      type: Object as PropType<Task | null>,
      default: null
    },
    isSaving: {
      type: Boolean,
      default: false
    }
  },
  emits: ['save', 'cancel'],
  setup(props, { emit }) {
    // Form data
    const form = ref({
      title: '',
      description: '',
      dueDateString: '',
      dueTimeString: '',
      priority: 'medium' as Task['priority'],
      tags: [] as string[],
      color: '#00F5FF',
      effectType: 'glow',
      isRecurring: false,
      recurringPattern: {
        frequency: 'daily' as 'daily' | 'weekly' | 'monthly' | 'yearly',
        interval: 1,
        daysOfWeek: [] as number[],
        endDateString: ''
      },
      notifications: {
        enabled: true,
        reminderTime: 30
      },
      subtasks: [] as { id: string, title: string, completed: boolean }[],
      notes: '',
      links: [] as string[]
    });

    // Input fields for numeric values
    const recurringIntervalInput = computed({
      get: () => form.value.recurringPattern.interval.toString(),
      set: (val: string) => {
        form.value.recurringPattern.interval = parseInt(val) || 1;
      }
    });

    const reminderTimeInput = computed({
      get: () => form.value.notifications.reminderTime.toString(),
      set: (val: string) => {
        form.value.notifications.reminderTime = parseInt(val) || 30;
      }
    });

    // Subtask input
    const subtaskInput = ref('');
    
    // Tag input
    const tagInput = ref('');
    
    // Validation state
    const validation = ref({
      title: ''
    });
    
    // End date toggle
    const hasEndDate = ref(false);
    
    // Priority options
    const priorities = [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: 'critical', label: 'Critical' },
    ];
    
    // Recurring options
    const recurringFrequencies = [
      { value: 'daily', label: 'Daily' },
      { value: 'weekly', label: 'Weekly' },
      { value: 'monthly', label: 'Monthly' },
      { value: 'yearly', label: 'Yearly' },
    ];
    
    // Weekdays for weekly recurrence
    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    // Computed properties
    const isEditing = computed(() => !!props.task);
    
    const minDateString = computed(() => {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    });
    
    // Methods
    const setPriority = (value: string) => {
      if (value === 'low' || value === 'medium' || value === 'high' || value === 'critical') {
        form.value.priority = value;
      }
    };
    
    const resetForm = () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      
      form.value = {
        title: '',
        description: '',
        dueDateString: formatDateForInput(tomorrow),
        dueTimeString: formatTimeForInput(tomorrow),
        priority: 'medium',
        tags: [],
        color: '#00F5FF',
        effectType: 'glow',
        isRecurring: false,
        recurringPattern: {
          frequency: 'daily',
          interval: 1,
          daysOfWeek: [],
          endDateString: ''
        },
        notifications: {
          enabled: true,
          reminderTime: 30
        },
        subtasks: [],
        notes: '',
        links: []
      };
      
      subtaskInput.value = '';
      tagInput.value = '';
      hasEndDate.value = false;
      
      validation.value = {
        title: ''
      };
    };
    
    const formatDateForInput = (date: Date): string => {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };
    
    const formatTimeForInput = (date: Date): string => {
      return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    };
    
    const populateFormFromTask = () => {
      if (!props.task) return;
      
      const dueDate = new Date(props.task.dueDate);
      
      form.value = {
        title: props.task.title,
        description: props.task.description,
        dueDateString: formatDateForInput(dueDate),
        dueTimeString: formatTimeForInput(dueDate),
        priority: props.task.priority,
        tags: [...props.task.tags],
        color: props.task.color,
        effectType: props.task.effectType,
        isRecurring: props.task.isRecurring,
        recurringPattern: {
          frequency: props.task.recurringPattern?.frequency || 'daily',
          interval: props.task.recurringPattern?.interval || 1,
          daysOfWeek: props.task.recurringPattern?.daysOfWeek || [],
          endDateString: props.task.recurringPattern?.endDate 
            ? formatDateForInput(new Date(props.task.recurringPattern.endDate)) 
            : ''
        },
        notifications: {
          enabled: props.task.notifications.enabled,
          reminderTime: props.task.notifications.reminderTime
        },
        subtasks: props.task.subtasks.map(subtask => ({ ...subtask })),
        notes: props.task.notes,
        links: [...props.task.links]
      };
      
      hasEndDate.value = !!props.task.recurringPattern?.endDate;
    };
    
    const validateForm = (): boolean => {
      validation.value.title = form.value.title.trim() ? '' : 'Title is required';
      
      return !validation.value.title;
    };
    
    const buildDueDate = (): Date => {
      const [year, month, day] = form.value.dueDateString.split('-').map(Number);
      let hours = 0, minutes = 0;
      
      if (form.value.dueTimeString) {
        [hours, minutes] = form.value.dueTimeString.split(':').map(Number);
      }
      
      return new Date(year, month - 1, day, hours, minutes);
    };
    
    const buildTask = (): Partial<Task> => {
      const dueDate = buildDueDate();
      
      const task: Partial<Task> = {
        title: form.value.title.trim(),
        description: form.value.description.trim(),
        dueDate,
        priority: form.value.priority,
        tags: form.value.tags,
        color: form.value.color,
        effectType: form.value.effectType,
        isRecurring: form.value.isRecurring,
        notifications: {
          enabled: form.value.notifications.enabled,
          reminderTime: form.value.notifications.reminderTime
        },
        subtasks: form.value.subtasks,
        notes: form.value.notes,
        links: form.value.links
      };
      
      if (form.value.isRecurring) {
        task.recurringPattern = {
          frequency: form.value.recurringPattern.frequency,
          interval: form.value.recurringPattern.interval,
        };
        
        if (form.value.recurringPattern.frequency === 'weekly' && form.value.recurringPattern.daysOfWeek.length > 0) {
          task.recurringPattern.daysOfWeek = form.value.recurringPattern.daysOfWeek;
        }
        
        if (hasEndDate.value && form.value.recurringPattern.endDateString) {
          const [year, month, day] = form.value.recurringPattern.endDateString.split('-').map(Number);
          task.recurringPattern.endDate = new Date(year, month - 1, day);
        }
      }
      
      return task;
    };
    
    const addSubtask = () => {
      if (!subtaskInput.value.trim()) return;
      
      form.value.subtasks.push({
        id: uuidv4(),
        title: subtaskInput.value.trim(),
        completed: false
      });
      
      subtaskInput.value = '';
    };
    
    const removeSubtask = (index: number) => {
      form.value.subtasks.splice(index, 1);
    };
    
    const addTag = () => {
      if (!tagInput.value.trim()) return;
      
      // Don't add duplicate tags
      if (!form.value.tags.includes(tagInput.value.trim())) {
        form.value.tags.push(tagInput.value.trim());
      }
      
      tagInput.value = '';
    };
    
    const removeTag = (index: number) => {
      form.value.tags.splice(index, 1);
    };
    
    const isDaySelected = (dayIndex: number): boolean => {
      return form.value.recurringPattern.daysOfWeek.includes(dayIndex);
    };
    
    const toggleDay = (dayIndex: number) => {
      const index = form.value.recurringPattern.daysOfWeek.indexOf(dayIndex);
      
      if (index === -1) {
        form.value.recurringPattern.daysOfWeek.push(dayIndex);
      } else {
        form.value.recurringPattern.daysOfWeek.splice(index, 1);
      }
    };
    
    const onSave = () => {
      if (!validateForm()) return;
      
      const taskData = buildTask();
      emit('save', taskData);
    };
    
    const onCancel = () => {
      emit('cancel');
    };
    
    // Watch for props.task changes to populate form
    watch(() => props.task, (newTask) => {
      if (newTask) {
        populateFormFromTask();
      } else {
        resetForm();
      }
    }, { immediate: true });
    
    // Watch for modal open changes to reset form when closing
    watch(() => props.isOpen, (isOpen) => {
      if (!isOpen) {
        resetForm();
      } else if (props.task) {
        populateFormFromTask();
      } else {
        resetForm();
      }
    });
    
    return {
      form,
      validation,
      subtaskInput,
      tagInput,
      hasEndDate,
      priorities,
      recurringFrequencies,
      weekdays,
      isEditing,
      minDateString,
      recurringIntervalInput,
      reminderTimeInput,
      setPriority,
      addSubtask,
      removeSubtask,
      addTag,
      removeTag,
      isDaySelected,
      toggleDay,
      onSave,
      onCancel
    };
  }
});
</script>

<style lang="scss" scoped>
.task-modal {
  width: 100%;
  padding: var(--space-1);
  max-height: 70vh;
  overflow-y: auto;
  
  &__section {
    margin-bottom: var(--space-5);
    border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.2);
    padding-bottom: var(--space-4);
    
    &:last-of-type {
      border-bottom: none;
    }
  }
  
  &__field {
    margin-bottom: var(--space-4);
    
    &:last-child {
      margin-bottom: 0;
    }
    
    &--half {
      width: calc(50% - var(--space-2));
    }
  }
  
  &__row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-4);
  }
  
  &__label-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-2);
  }
  
  &__label {
    display: block;
    font-weight: var(--font-medium);
    margin-bottom: var(--space-2);
    color: var(--color-text-primary);
  }
  
  &__priority-selector {
    display: flex;
    gap: var(--space-3);
    flex-wrap: wrap;
  }
  
  &__priority-option {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: var(--transition-base);
    border: 1px solid transparent;
    
    &:hover {
      background-color: rgba(var(--color-primary-rgb), 0.1);
    }
    
    &--selected {
      background-color: rgba(var(--color-primary-rgb), 0.15);
      border-color: var(--color-primary);
    }
  }
  
  &__priority-indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    
    &--low {
      background-color: var(--color-priority-low);
    }
    
    &--medium {
      background-color: var(--color-priority-medium);
    }
    
    &--high {
      background-color: var(--color-priority-high);
    }
    
    &--critical {
      background-color: var(--color-priority-critical);
    }
  }
  
  &__tags-input,
  &__subtasks-input {
    margin-bottom: var(--space-2);
  }
  
  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin-top: var(--space-2);
  }
  
  &__tag {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    background-color: rgba(var(--color-primary-rgb), 0.2);
    color: var(--color-primary);
    border-radius: var(--radius-full);
    padding: 0 var(--space-2);
    font-size: var(--text-sm);
    height: 24px;
  }
  
  &__tag-remove {
    background: none;
    border: none;
    color: var(--color-text-secondary);
    cursor: pointer;
    font-size: var(--text-lg);
    line-height: 1;
    padding: 0 var(--space-1);
    
    &:hover {
      color: var(--color-text-primary);
    }
  }
  
  &__subtasks {
    margin-top: var(--space-2);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }
  
  &__subtask {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2);
    border-radius: var(--radius-md);
    background-color: rgba(var(--color-surface-rgb), 0.3);
    
    &--completed {
      text-decoration: line-through;
      color: var(--color-text-secondary);
    }
  }
  
  &__subtask-remove {
    background: none;
    border: none;
    color: var(--color-text-secondary);
    cursor: pointer;
    font-size: var(--text-lg);
    line-height: 1;
    padding: 0 var(--space-1);
    margin-left: auto;
    
    &:hover {
      color: var(--color-text-primary);
    }
  }
  
  &__recurring-options {
    margin-top: var(--space-3);
    padding: var(--space-3);
    border-radius: var(--radius-md);
    background-color: rgba(var(--color-surface-rgb), 0.3);
  }
  
  &__weekdays {
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;
  }
  
  &__notifications {
    margin-top: var(--space-2);
  }
  
  &__notification-time {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }
  
  &__notification-unit {
    color: var(--color-text-secondary);
  }
  
  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-3);
    margin-top: var(--space-4);
  }
}

// Media queries for responsive design
@media (max-width: 640px) {
  .task-modal {
    &__row {
      flex-direction: column;
      gap: var(--space-3);
    }
    
    &__field--half {
      width: 100%;
    }
    
    &__priority-selector {
      flex-direction: column;
      gap: var(--space-2);
    }
    
    &__actions {
      flex-direction: column-reverse;
      width: 100%;
      
      .cyber-button {
        width: 100%;
      }
    }
  }
}
</style>

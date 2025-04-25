<template>
  <div class="task-entity-wrapper" v-if="showLabel && labelRef">
    <div ref="labelRef" class="task-entity-label" :class="{ 'is-selected': selected }">
      {{ task.title }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted, watch } from 'vue';
import type { PropType } from 'vue';
import * as THREE from 'three';
import type { Task } from '../../types';
import { useSettingsStore } from '../../store/modules/settings';

export default defineComponent({
  name: 'TaskEntity',
  
  props: {
    task: {
      type: Object as PropType<Task>,
      required: true
    },
    scene: {
      type: Object as PropType<THREE.Scene>,
      required: true
    },
    camera: {
      type: Object as PropType<THREE.Camera>,
      required: true
    },
    selected: {
      type: Boolean,
      default: false
    },
    showLabel: {
      type: Boolean,
      default: true
    },
    position: {
      type: Object as PropType<{ x: number; y: number; z: number }>,
      required: true
    }
  },
  
  emits: ['click', 'hover'],
  
  setup(props, { emit }) {
    const settingsStore = useSettingsStore();
    const labelRef = ref<HTMLElement | null>(null);
    const mesh = ref<THREE.Mesh | null>(null);
    
    // Get task color from priority
    const getTaskColor = computed(() => {
      const priorityColors = {
        'low': 0x00B2A0,      // Teal
        'medium': 0xFFD600,   // Yellow
        'high': 0xFF7A00,     // Orange
        'critical': 0xFF2D55   // Red
      };
      
      return priorityColors[props.task.priority] || priorityColors['medium'];
    });
    
    // Create task mesh based on priority (planetary style)
    const createTaskMesh = () => {
      if (!props.scene) return;
      
      // Create geometry based on task priority - using more planet-like shapes
      let geometry: THREE.BufferGeometry;
      
      switch (props.task.priority) {
        case 'low':
          // Smaller, simpler planet for low priority
          geometry = new THREE.SphereGeometry(1.2, 16, 16);
          break;
        case 'medium':
          // Medium planet with slight irregularity
          geometry = new THREE.DodecahedronGeometry(1.4, 0);
          break;
        case 'high':
          // Larger angular planet for high priority
          geometry = new THREE.IcosahedronGeometry(1.8, 0);
          break;
        case 'critical':
          // Dramatic shape for critical tasks
          geometry = new THREE.TetrahedronGeometry(2.0, 0);
          break;
        default:
          geometry = new THREE.SphereGeometry(1.4, 16, 16);
      }
      
      // Create material with planet-like appearance based on priority
      const material = new THREE.MeshStandardMaterial({
        color: getTaskColor.value,
        emissive: getTaskColor.value,
        emissiveIntensity: props.task.completed ? 0.2 : 0.4,
        metalness: 0.6,
        roughness: 0.4,
        transparent: true,
        opacity: props.task.completed ? 0.5 : 1
      });
      
      // Create mesh and add to scene
      const taskMesh = new THREE.Mesh(geometry, material);
      
      // Set position from props
      taskMesh.position.set(
        props.position.x,
        props.position.y,
        props.position.z
      );
      
      // Add orbital animations to mesh
      const animate = (time: number) => {
        if (!taskMesh) return;
        
        // Calculate unique rotation speed based on task ID
        const idHash = props.task.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
        const rotationSpeed = 0.0001 + (idHash % 10) * 0.00002;
        
        // Planet rotation animation
        taskMesh.rotation.y += rotationSpeed * 1.2;
        taskMesh.rotation.z += rotationSpeed * 0.3;
        
        // Add subtle "bobbing" up and down motion for solar system feel
        // This adds a slight 3D movement while keeping the primary orbit 2D
        taskMesh.position.y = props.position.y + Math.sin(time * 0.001 + idHash) * 0.15;
        
        // Optional: Add slight orbital "wobble" for more dynamic feel
        if (!props.task.completed) {
          const wobbleAmount = 0.05;
          const wobbleSpeed = 0.0005;
          // Get current orbital position (distance from center)
          const orbital = {
            x: props.position.x,
            z: props.position.z
          };
          // Calculate distance from center
          const distance = Math.sqrt(orbital.x * orbital.x + orbital.z * orbital.z);
          // Calculate angle
          const angle = Math.atan2(orbital.z, orbital.x) + (Math.sin(time * wobbleSpeed + idHash) * wobbleAmount);
          // Apply subtle adjustment to position (wobble in orbit)
          taskMesh.position.x = Math.cos(angle) * distance;
          taskMesh.position.z = Math.sin(angle) * distance;
        }
      };
      
      // Add click event using raycaster
      const raycaster = new THREE.Raycaster();
      const handleRaycast = (event: MouseEvent, eventType: 'click' | 'hover') => {
        if (!props.scene || !props.camera || !taskMesh) return;
        
        // Convert mouse position to normalized device coordinates
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        // Update the raycaster
        raycaster.setFromCamera(mouse, props.camera);
        
        // Check for intersections
        const intersects = raycaster.intersectObject(taskMesh);
        
        if (intersects.length > 0) {
          emit(eventType, props.task.id);
          
          // Visual feedback for interaction
          if (eventType === 'hover') {
            document.body.style.cursor = 'pointer';
          }
        } else if (eventType === 'hover') {
          document.body.style.cursor = 'default';
        }
      };
      
      // Add listeners
      const handleClick = (event: MouseEvent) => handleRaycast(event, 'click');
      const handleMouseMove = (event: MouseEvent) => handleRaycast(event, 'hover');
      
      window.addEventListener('click', handleClick);
      window.addEventListener('mousemove', handleMouseMove);
      
      // Store references for cleanup
      const cleanupFunctions = [
        () => window.removeEventListener('click', handleClick),
        () => window.removeEventListener('mousemove', handleMouseMove),
        () => {
          if (taskMesh && props.scene) {
            props.scene.remove(taskMesh);
            
            if (taskMesh.geometry) {
              taskMesh.geometry.dispose();
            }
            
            if (taskMesh.material) {
              if (Array.isArray(taskMesh.material)) {
                taskMesh.material.forEach((m: THREE.Material) => m.dispose());
              } else {
                taskMesh.material.dispose();
              }
            }
          }
        }
      ];
      
      // Add to scene
      props.scene.add(taskMesh);
      mesh.value = taskMesh;
      
      return {
        mesh: taskMesh,
        animate,
        cleanup: () => cleanupFunctions.forEach(fn => fn())
      };
    };
    
    // Update position when props change
    watch(
      () => props.position,
      (newPosition) => {
        if (mesh.value) {
          mesh.value.position.set(
            newPosition.x,
            newPosition.y,
            newPosition.z
          );
        }
      },
      { deep: true }
    );
    
    // Update material when selected state changes
    watch(
      () => props.selected,
      (isSelected) => {
        if (mesh.value && mesh.value.material instanceof THREE.MeshStandardMaterial) {
          mesh.value.material.emissiveIntensity = isSelected ? 0.8 : (props.task.completed ? 0.2 : 0.5);
          
          // Scale effect on selection
          mesh.value.scale.set(
            isSelected ? 1.2 : 1,
            isSelected ? 1.2 : 1,
            isSelected ? 1.2 : 1
          );
        }
      }
    );
    
    // Update material when completion state changes
    watch(
      () => props.task.completed,
      (isCompleted) => {
        if (mesh.value && mesh.value.material instanceof THREE.MeshStandardMaterial) {
          mesh.value.material.opacity = isCompleted ? 0.5 : 1;
          mesh.value.material.emissiveIntensity = props.selected ? 0.8 : (isCompleted ? 0.2 : 0.5);
        }
      }
    );
    
    // Cleanup function
    let cleanup: (() => void) | null = null;
    
    // Initialize on mount
    onMounted(() => {
      const result = createTaskMesh();
      if (result) {
        cleanup = result.cleanup;
      }
    });
    
    // Cleanup on unmount
    onUnmounted(() => {
      if (cleanup) {
        cleanup();
      }
    });
    
    return {
      labelRef,
      mesh
    };
  }
});
</script>

<style lang="scss" scoped>
.task-entity-wrapper {
  position: absolute;
  pointer-events: none;
  transform: translate(-50%, -50%);
  z-index: 10;
}

.task-entity-label {
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  transition: all 0.3s ease;
  transform: translateY(-100%);
  margin-bottom: 8px;
  
  &.is-selected {
    background-color: var(--color-primary);
    font-weight: bold;
  }
}
</style>

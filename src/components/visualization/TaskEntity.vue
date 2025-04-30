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
  
  emits: ['click', 'hover', 'dblclick'],
  
  setup(props, { emit }) {
    const settingsStore = useSettingsStore();
    const labelRef = ref<HTMLElement | null>(null);
    const mesh = ref<THREE.Mesh | null>(null);
    const taskObjectRef = ref<THREE.Object3D | null>(null);
    
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
    
    // Helper function to create Saturn-style rings
    const createSaturnRings = (planetRadius: number) => {
      const ringGeometry = new THREE.RingGeometry(planetRadius * 1.4, planetRadius * 2.2);
      const ringMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFF0D0,
        emissive: 0xFFF0D0,
        emissiveIntensity: 0.2,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
      });
      
      const rings = new THREE.Mesh(ringGeometry, ringMaterial);
      // Rotate rings to be horizontal
      rings.rotation.x = Math.PI / 2;
      return rings;
    };
    
    // Helper function to create Jupiter-style moons
    const createJupiterMoons = (planetRadius: number) => {
      const moons: THREE.Mesh[] = [];
      const moonCount = 4;
      
      for (let i = 0; i < moonCount; i++) {
        // Create moon geometry - vary size slightly
        const moonSize = 0.2 + (Math.random() * 0.15);
        const moonGeometry = new THREE.SphereGeometry(moonSize);
        
        // Create moon material - grayish
        const moonColor = new THREE.Color(0.8 + Math.random() * 0.2, 0.8 + Math.random() * 0.2, 0.8 + Math.random() * 0.2);
        const moonMaterial = new THREE.MeshStandardMaterial({
          color: moonColor,
          roughness: 0.7,
          metalness: 0.1,
        });
        
        // Create moon mesh
        const moon = new THREE.Mesh(moonGeometry, moonMaterial);
        
        // Position moon in orbit around the planet
        const orbitRadius = planetRadius * (2.0 + i * 0.5);
        const angle = Math.random() * Math.PI * 2;
        moon.position.set(
          Math.cos(angle) * orbitRadius,
          (Math.random() - 0.5) * 0.5, // slight vertical variation
          Math.sin(angle) * orbitRadius
        );
        
        // Store orbit data directly on the moon's userData
        moon.userData = {
          orbitRadius,
          orbitSpeed: 0.001 - (i * 0.0001), // each moon has different speed
          orbitAngle: angle
        };
        
        moons.push(moon);
      }
      
      return moons;
    };
    
    // Create task mesh based on priority (planetary style)
    const createTaskMesh = () => {
      if (!props.scene) return;
      
      // Create geometry based on task priority - using more planet-like shapes
      let geometry: THREE.BufferGeometry;
      let material: THREE.Material;
      let taskObject: THREE.Object3D;
      
      switch (props.task.priority) {
        case 'low':
          // Mercury/Mars style rocky planet for low priority
          geometry = new THREE.SphereGeometry(1.2);
          material = new THREE.MeshStandardMaterial({
            color: getTaskColor.value,
            emissive: getTaskColor.value,
            emissiveIntensity: props.task.completed ? 0.1 : 0.3,
            metalness: 0.2,
            roughness: 0.9, // Very rough for rocky appearance
            transparent: true,
            opacity: props.task.completed ? 0.5 : 1
          });
          
          // Create mesh and add craters/bumps
          taskObject = new THREE.Mesh(geometry, material);
          break;
          
        case 'medium':
          // Earth-like planet for medium priority
          geometry = new THREE.SphereGeometry(1.4);
          material = new THREE.MeshStandardMaterial({
            color: getTaskColor.value,
            emissive: getTaskColor.value,
            emissiveIntensity: props.task.completed ? 0.1 : 0.3,
            metalness: 0.1,
            roughness: 0.5, // Smoother for earth-like appearance
            transparent: true,
            opacity: props.task.completed ? 0.5 : 1
          });
          
          // Create mesh
          taskObject = new THREE.Mesh(geometry, material);
          break;
          
        case 'high':
          // Saturn style planet with rings for high priority
          geometry = new THREE.SphereGeometry(1.6);
          material = new THREE.MeshStandardMaterial({
            color: getTaskColor.value,
            emissive: getTaskColor.value,
            emissiveIntensity: props.task.completed ? 0.1 : 0.3,
            metalness: 0.3,
            roughness: 0.7,
            transparent: true,
            opacity: props.task.completed ? 0.5 : 1
          });
          
          // Create planet mesh
          const saturnPlanet = new THREE.Mesh(geometry, material);
          
          // Create rings
          const rings = createSaturnRings(1.6);
          
          // Create a group to hold both planet and rings
          const saturnGroup = new THREE.Object3D();
          saturnGroup.add(saturnPlanet);
          saturnGroup.add(rings);
          
          taskObject = saturnGroup;
          break;
          
        case 'critical':
          // Jupiter style planet with moons for critical priority
          geometry = new THREE.SphereGeometry(2.0);
          material = new THREE.MeshStandardMaterial({
            color: getTaskColor.value,
            emissive: getTaskColor.value,
            emissiveIntensity: props.task.completed ? 0.1 : 0.3,
            metalness: 0.4,
            roughness: 0.6,
            transparent: true,
            opacity: props.task.completed ? 0.5 : 1
          });
          
          // Create planet mesh
          const jupiterPlanet = new THREE.Mesh(geometry, material);
          
          // Create moons
          const moons = createJupiterMoons(2.0);
          
          // Create a group to hold planet and moons
          const jupiterGroup = new THREE.Object3D();
          jupiterGroup.add(jupiterPlanet);
          moons.forEach(moon => jupiterGroup.add(moon));
          
          taskObject = jupiterGroup;
          break;
          
        default:
          // Default to a simple planet
          geometry = new THREE.SphereGeometry(1.4);
          material = new THREE.MeshStandardMaterial({
            color: getTaskColor.value,
            emissive: getTaskColor.value,
            emissiveIntensity: props.task.completed ? 0.1 : 0.3,
            metalness: 0.3,
            roughness: 0.5,
            transparent: true,
            opacity: props.task.completed ? 0.5 : 1
          });
          taskObject = new THREE.Mesh(geometry, material);
      }
      
      // Set position from props
      taskObject.position.set(
        props.position.x,
        props.position.y,
        props.position.z
      );
      
      // Store reference to the task object
      taskObjectRef.value = taskObject;
      if (taskObject instanceof THREE.Mesh) {
        mesh.value = taskObject;
      }
      
      // Add orbital animations to object
      const animate = (time: number) => {
        if (!taskObject) return;
        
        // Calculate unique rotation speed based on task ID
        const idHash = props.task.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
        const rotationSpeed = 0.0001 + (idHash % 10) * 0.00002;
        
        // Planet rotation animation
        if (taskObject instanceof THREE.Mesh) {
          // Simple planet rotation
          taskObject.rotation.y += rotationSpeed * 1.2;
          taskObject.rotation.z += rotationSpeed * 0.3;
        } else {
          // For groups (Saturn and Jupiter), rotate the planet (first child)
          if (taskObject.children && taskObject.children.length > 0) {
            const planet = taskObject.children[0];
            if (planet) {
              planet.rotation.y += rotationSpeed * 1.2;
            }
            
            // For Jupiter, animate the moons
            if (props.task.priority === 'critical' && taskObject.children.length > 1) {
              // Skip the first child (the planet itself)
              for (let i = 1; i < taskObject.children.length; i++) {
                const moon = taskObject.children[i];
                if (moon && moon.userData) {
                  // Update the moon's orbit position
                  moon.userData.orbitAngle += moon.userData.orbitSpeed;
                  moon.position.x = Math.cos(moon.userData.orbitAngle) * moon.userData.orbitRadius;
                  moon.position.z = Math.sin(moon.userData.orbitAngle) * moon.userData.orbitRadius;
                  
                  // Rotate the moon itself
                  if (moon.rotation) {
                    moon.rotation.y += rotationSpeed * 2;
                  }
                }
              }
            }
          }
        }
        
        // Add subtle "bobbing" up and down motion for solar system feel
        taskObject.position.y = props.position.y + Math.sin(time * 0.001 + idHash) * 0.15;
        
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
          taskObject.position.x = Math.cos(angle) * distance;
          taskObject.position.z = Math.sin(angle) * distance;
        }
      };
      
      // Add click event using raycaster
      const raycaster = new THREE.Raycaster();
      const handleRaycast = (event: MouseEvent, eventType: 'click' | 'hover' | 'dblclick') => {
        if (!props.scene || !props.camera || !taskObject) return;
        
        // Convert mouse position to normalized device coordinates
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1.1;
        
        // Update the raycaster
        raycaster.setFromCamera(mouse, props.camera);
        
        // Check for intersections
        const intersects = raycaster.intersectObject(taskObject);
        
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
      const handleDoubleClick = (event: MouseEvent) => handleRaycast(event, 'dblclick');
      const handleMouseMove = (event: MouseEvent) => handleRaycast(event, 'hover');
      
      window.addEventListener('click', handleClick);
      window.addEventListener('dblclick', handleDoubleClick);
      window.addEventListener('mousemove', handleMouseMove);
      
      // Store references for cleanup
      const cleanupFunctions = [
        () => window.removeEventListener('click', handleClick),
        () => window.removeEventListener('dblclick', handleDoubleClick),
        () => window.removeEventListener('mousemove', handleMouseMove),
        () => {
          if (taskObject && props.scene) {
            props.scene.remove(taskObject);
            
            // Handle cleanup based on object type
            if (taskObject instanceof THREE.Mesh) {
              if (taskObject.geometry) {
                taskObject.geometry.dispose();
              }
              
              if (taskObject.material) {
                if (Array.isArray(taskObject.material)) {
                  taskObject.material.forEach((m: THREE.Material) => m.dispose());
                } else {
                  taskObject.material.dispose();
                }
              }
            } else {
              // Handle group cleanup
              taskObject.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                  if (child.geometry) child.geometry.dispose();
                  if (child.material) {
                    if (Array.isArray(child.material)) {
                      child.material.forEach((m: THREE.Material) => m.dispose());
                    } else {
                      child.material.dispose();
                    }
                  }
                }
              });
            }
          }
        }
      ];
      
      // Add to scene
      props.scene.add(taskObject);
      
      return {
        taskObject,
        animate,
        cleanup: () => cleanupFunctions.forEach(fn => fn())
      };
    };
    
    // Update position when props change
    watch(
      () => props.position,
      (newPosition) => {
        if (taskObjectRef.value) {
          taskObjectRef.value.position.set(
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
        const taskObject = taskObjectRef.value;
        
        if (taskObject) {
          // Apply scale to the entire object
          taskObject.scale.set(
            isSelected ? 1.2 : 1,
            isSelected ? 1.2 : 1,
            isSelected ? 1.2 : 1
          );
          
          // If it's a mesh, update its material
          if (taskObject instanceof THREE.Mesh && taskObject.material instanceof THREE.Material) {
            if ('emissiveIntensity' in taskObject.material) {
              taskObject.material.emissiveIntensity = isSelected ? 0.8 : (props.task.completed ? 0.2 : 0.5);
            }
          } 
          // If it's a group (Saturn or Jupiter), update the planet's material
          else if (taskObject.children && taskObject.children.length > 0) {
            const planetMesh = taskObject.children[0];
            if (planetMesh instanceof THREE.Mesh && planetMesh.material instanceof THREE.Material) {
              if ('emissiveIntensity' in planetMesh.material) {
                planetMesh.material.emissiveIntensity = isSelected ? 0.8 : (props.task.completed ? 0.2 : 0.5);
              }
            }
          }
        }
      }
    );
    
    // Update material when completion state changes
    watch(
      () => props.task.completed,
      (isCompleted) => {
        const taskObject = taskObjectRef.value;
        
        if (taskObject) {
          // If it's a mesh, update its material
          if (taskObject instanceof THREE.Mesh && taskObject.material instanceof THREE.Material) {
            if ('opacity' in taskObject.material) {
              taskObject.material.opacity = isCompleted ? 0.5 : 1;
            }
            if ('emissiveIntensity' in taskObject.material) {
              taskObject.material.emissiveIntensity = props.selected ? 0.8 : (isCompleted ? 0.2 : 0.5);
            }
          } 
          // If it's a group (Saturn or Jupiter), update all materials
          else if (taskObject.children && taskObject.children.length > 0) {
            taskObject.traverse((child) => {
              if (child instanceof THREE.Mesh && child.material instanceof THREE.Material) {
                if ('opacity' in child.material) {
                  child.material.opacity = isCompleted ? 0.5 : (child.material.opacity === 0.8 ? 0.8 : 1);
                }
                
                // Only adjust emissive for the main planet (first child)
                if (child === taskObject.children[0] && 'emissiveIntensity' in child.material) {
                  child.material.emissiveIntensity = props.selected ? 0.8 : (isCompleted ? 0.2 : 0.5);
                }
              }
            });
          }
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
      mesh,
      taskObjectRef
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

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
    
    // Create Saturn-style rings
    const createSaturnRings = (planetRadius: number) => {
      const ringGroup = new THREE.Object3D();
      
      // Create multiple ring layers for more depth and realism
      const ringLayers = [
        { inner: 1.3, outer: 1.7, opacity: 0.6, color: 0xFFE0A0 },
        { inner: 1.75, outer: 2.2, opacity: 0.4, color: 0xFFF0D0 }
      ];
      
      ringLayers.forEach(layer => {
        const ringGeometry = new THREE.RingGeometry(
          planetRadius * layer.inner, 
          planetRadius * layer.outer
        );
        
        const ringMaterial = new THREE.MeshStandardMaterial({
          color: layer.color,
          transparent: true,
          opacity: layer.opacity,
          side: THREE.DoubleSide
        });
        
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2; // Align horizontally
        
        // Store custom data for animation
        ring.userData = { isRing: true };
        
        ringGroup.add(ring);
      });
      
      return ringGroup;
    };
    
    // Create Jupiter-style moons
    const createJupiterMoons = (planetRadius: number) => {
      const moons = [];
      const moonCount = 4;
      
      // Moon variations - each with distinct characteristics
      const moonTypes = [
        { radius: 0.25, color: 0xCCCCCC }, // Ganymede - larger, gray
        { radius: 0.2, color: 0xFFEEDD },  // Europa - icy white
        { radius: 0.22, color: 0xFFDDAA }, // Io - yellowish
        { radius: 0.23, color: 0xDDDDDD }  // Callisto - gray
      ];
      
      for (let i = 0; i < moonCount; i++) {
        const moonType = moonTypes[i % moonTypes.length];
        const moonGroup = new THREE.Object3D();
        
        // Create moon
        const moonGeometry = new THREE.SphereGeometry(moonType.radius);
        const moonMaterial = new THREE.MeshStandardMaterial({
          color: moonType.color,
          roughness: 0.7,
          metalness: 0.1
        });
        
        const moon = new THREE.Mesh(moonGeometry, moonMaterial);
        moonGroup.add(moon);
        
        // Create unique orbital path for each moon
        const orbitRadius = planetRadius * (2.0 + i * 0.5);
        const angle = Math.random() * Math.PI * 2;
        
        moonGroup.position.set(
          Math.cos(angle) * orbitRadius,
          (Math.random() - 0.5) * 0.5, // Slight vertical variation
          Math.sin(angle) * orbitRadius
        );
        
        // Store orbital data for animation
        moonGroup.userData = {
          orbitRadius,
          orbitSpeed: 0.0005 - (i * 0.0001), // Each moon has different speed
          orbitAngle: angle,
          rotationSpeed: 0.001
        };
        
        moons.push(moonGroup);
      }
      
      return moons;
    };
    
    // Create task mesh based on priority (planetary style)
    const createTaskMesh = () => {
      if (!props.scene) return;
      
      let taskObject: THREE.Object3D;
      
      switch (props.task.priority) {
        case 'low':
          // Mercury/Mars style rocky planet (small, cratered)
          const lowPriorityGroup = new THREE.Object3D();
          
          // Create base planet with detailed geometry for rocky appearance
          const rockyGeometry = new THREE.IcosahedronGeometry(1.2, 3);
          const rockyMaterial = new THREE.MeshStandardMaterial({
            color: getTaskColor.value,
            emissive: getTaskColor.value,
            emissiveIntensity: 0.15,
            metalness: 0.2,
            roughness: 0.9, // Very rough for rocky appearance
            flatShading: true
          });
          
          const rockyPlanet = new THREE.Mesh(rockyGeometry, rockyMaterial);
          lowPriorityGroup.add(rockyPlanet);
          
          // Add subtle atmospheric haze for Mars-like feel
          const hazeGeometry = new THREE.SphereGeometry(1.3);
          const hazeMaterial = new THREE.MeshBasicMaterial({
            color: getTaskColor.value,
            transparent: true,
            opacity: 0.15,
            side: THREE.BackSide
          });
          
          const haze = new THREE.Mesh(hazeGeometry, hazeMaterial);
          lowPriorityGroup.add(haze);
          
          taskObject = lowPriorityGroup;
          break;
          
        case 'medium':
          // Earth-like planet with atmosphere and clouds
          const mediumPriorityGroup = new THREE.Object3D();
          
          // Planet base
          const earthGeometry = new THREE.SphereGeometry(1.4, 32, 32);
          const earthMaterial = new THREE.MeshStandardMaterial({
            color: getTaskColor.value,
            emissive: getTaskColor.value,
            emissiveIntensity: 0.1,
            metalness: 0.1,
            roughness: 0.5
          });
          
          const earthPlanet = new THREE.Mesh(earthGeometry, earthMaterial);
          mediumPriorityGroup.add(earthPlanet);
          
          // Cloud layer
          const cloudGeometry = new THREE.SphereGeometry(1.44);
          const cloudMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFFFFF,
            transparent: true,
            opacity: 0.4
          });
          
          const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
          clouds.userData = { isCloud: true, rotationSpeed: 0.0001 };
          mediumPriorityGroup.add(clouds);
          
          // Atmosphere glow
          const glowGeometry = new THREE.SphereGeometry(1.6);
          const glowMaterial = new THREE.MeshBasicMaterial({
            color: getTaskColor.value,
            transparent: true,
            opacity: 0.2,
            side: THREE.BackSide
          });
          
          const glow = new THREE.Mesh(glowGeometry, glowMaterial);
          mediumPriorityGroup.add(glow);
          
          taskObject = mediumPriorityGroup;
          break;
          
        case 'high':
          // Saturn-style planet with impressive ring system
          const highPriorityGroup = new THREE.Object3D();
          
          // Create planet
          const saturnGeometry = new THREE.SphereGeometry(1.6, 32, 32);
          const saturnMaterial = new THREE.MeshStandardMaterial({
            color: getTaskColor.value,
            emissive: getTaskColor.value,
            emissiveIntensity: 0.2,
            metalness: 0.3,
            roughness: 0.6
          });
          
          const saturnPlanet = new THREE.Mesh(saturnGeometry, saturnMaterial);
          highPriorityGroup.add(saturnPlanet);
          
          // Create advanced ring system
          const rings = createSaturnRings(1.6);
          highPriorityGroup.add(rings);
          
          // Add subtle glow effect
          const saturnGlowGeometry = new THREE.SphereGeometry(1.7);
          const saturnGlowMaterial = new THREE.MeshBasicMaterial({
            color: getTaskColor.value,
            transparent: true,
            opacity: 0.2,
            side: THREE.BackSide
          });
          
          const saturnGlow = new THREE.Mesh(saturnGlowGeometry, saturnGlowMaterial);
          highPriorityGroup.add(saturnGlow);
          
          taskObject = highPriorityGroup;
          break;
          
        case 'critical':
          // Jupiter-style massive gas giant with orbiting moons
          const criticalPriorityGroup = new THREE.Object3D();
          
          // Create the main Jupiter planet - banded gas giant
          const jupiterGeometry = new THREE.SphereGeometry(2.0, 48, 48);
          const jupiterMaterial = new THREE.MeshStandardMaterial({
            color: getTaskColor.value,
            emissive: getTaskColor.value,
            emissiveIntensity: 0.25,
            metalness: 0.3,
            roughness: 0.4
          });
          
          const jupiterPlanet = new THREE.Mesh(jupiterGeometry, jupiterMaterial);
          criticalPriorityGroup.add(jupiterPlanet);
          
          // Create bands effect - additional spheres with patterns
          // Great Red Spot - iconic Jupiter feature
          const spotGeometry = new THREE.SphereGeometry(2.01); 
          const spotMaterial = new THREE.MeshBasicMaterial({
            color: 0xFF2222,
            transparent: true,
            opacity: 0.6,
            side: THREE.FrontSide,
            alphaTest: 0.1
          });
          
          // Create partial sphere for the spot by using clipping planes
          const spotPlane1 = new THREE.Plane(new THREE.Vector3(0, 1, 0), 1.9);
          const spotPlane2 = new THREE.Plane(new THREE.Vector3(0, -1, 0), 1.9);
          const spotPlane3 = new THREE.Plane(new THREE.Vector3(1, 0, 0), 1.9);
          const spotPlane4 = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 1.9);
          
          spotMaterial.clippingPlanes = [spotPlane1, spotPlane2, spotPlane3, spotPlane4];
          
          const redSpot = new THREE.Mesh(spotGeometry, spotMaterial);
          redSpot.rotation.z = Math.PI / 4;
          criticalPriorityGroup.add(redSpot);
          
          // Create atmospheric glow
          const jupiterGlowGeometry = new THREE.SphereGeometry(2.1);
          const jupiterGlowMaterial = new THREE.MeshBasicMaterial({
            color: getTaskColor.value,
            transparent: true,
            opacity: 0.2,
            side: THREE.BackSide
          });
          
          const jupiterGlow = new THREE.Mesh(jupiterGlowGeometry, jupiterGlowMaterial);
          criticalPriorityGroup.add(jupiterGlow);
          
          // Add several moons
          const moons = createJupiterMoons(2.0);
          moons.forEach(moon => {
            criticalPriorityGroup.add(moon);
          });
          
          taskObject = criticalPriorityGroup;
          break;
          
        default:
          // Default planet with basic features
          const defaultGroup = new THREE.Object3D();
          
          const defaultGeometry = new THREE.SphereGeometry(1.4);
          const defaultMaterial = new THREE.MeshStandardMaterial({
            color: getTaskColor.value,
            emissive: getTaskColor.value,
            emissiveIntensity: 0.2,
            metalness: 0.2,
            roughness: 0.5
          });
          
          const defaultPlanet = new THREE.Mesh(defaultGeometry, defaultMaterial);
          defaultGroup.add(defaultPlanet);
          
          taskObject = defaultGroup;
      }
      
      // Set position from props
      taskObject.position.set(
        props.position.x,
        props.position.y,
        props.position.z
      );
      
      // Store reference to the task object
      taskObjectRef.value = taskObject;
      if (taskObject.children[0] instanceof THREE.Mesh) {
        mesh.value = taskObject.children[0];
      }
      
      // Add orbital animations to object
      const animate = (time: number) => {
        if (!taskObject) return;
        
        // Calculate unique rotation speed based on task ID
        const idHash = props.task.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
        const rotationSpeed = 0.0001 + (idHash % 10) * 0.00002;
        
        // Handle different object types and animations
        taskObject.children.forEach((child, index) => {
          if (child instanceof THREE.Mesh) {
            // Handle special case for clouds - rotate differently
            if (child.userData && child.userData.isCloud) {
              child.rotation.y += child.userData.rotationSpeed || 0.0001;
              return;
            }
            
            // Main planet rotation - different for each type
            if (index === 0) { // First child is always the main planet
              child.rotation.y += rotationSpeed * 1.2;
              
              // Add variety to rotation based on planet type
              if (props.task.priority === 'low') {
                child.rotation.z += rotationSpeed * 0.2;
              } else if (props.task.priority === 'medium') {
                child.rotation.x += rotationSpeed * 0.1;
              } else if (props.task.priority === 'critical') {
                // Jupiter-like fast equatorial rotation
                child.rotation.y += rotationSpeed * 0.3;
              }
            }
            
            // Handle Saturn rings rotation
            if (child.userData && child.userData.isRing) {
              // Rings rotate slightly differently than the planet
              child.rotation.z += rotationSpeed * 0.05;
            }
          } else if (child instanceof THREE.Object3D && child.userData && child.userData.orbitRadius) {
            // This is a moon - update its orbit
            child.userData.orbitAngle += child.userData.orbitSpeed;
            
            // Update moon position in orbit
            child.position.x = Math.cos(child.userData.orbitAngle) * child.userData.orbitRadius;
            child.position.z = Math.sin(child.userData.orbitAngle) * child.userData.orbitRadius;
            
            // Rotate moon itself
            if (child.children[0]) {
              child.children[0].rotation.y += child.userData.rotationSpeed;
            }
          }
        });
        
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
        
        // Check for intersections with the entire task object and its children
        const intersects = raycaster.intersectObjects(taskObject.children, true);
        
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
            
            // Dispose of all geometries and materials
            taskObject.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                if (child.geometry) {
                  child.geometry.dispose();
                }
                
                if (child.material) {
                  if (Array.isArray(child.material)) {
                    child.material.forEach(m => m.dispose());
                  } else {
                    child.material.dispose();
                  }
                }
              }
            });
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
        if (!taskObjectRef.value) return;
        
        // Scale the entire object for selection effect
        taskObjectRef.value.scale.set(
          isSelected ? 1.2 : 1,
          isSelected ? 1.2 : 1,
          isSelected ? 1.2 : 1
        );
        
        // Update materials for all meshes
        taskObjectRef.value.traverse((child) => {
          if (child instanceof THREE.Mesh && 
              child.material instanceof THREE.Material && 
              'emissiveIntensity' in child.material) {
            child.material.emissiveIntensity = isSelected ? 0.8 : (props.task.completed ? 0.2 : 0.4);
          }
        });
      }
    );
    
    // Update material when completion state changes
    watch(
      () => props.task.completed,
      (isCompleted) => {
        if (!taskObjectRef.value) return;
        
        // Update all materials
        taskObjectRef.value.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material instanceof THREE.Material) {
            if ('opacity' in child.material) {
              child.material.opacity = isCompleted ? 0.5 : 1;
            }
            
            if ('emissiveIntensity' in child.material) {
              child.material.emissiveIntensity = props.selected ? 0.8 : (isCompleted ? 0.2 : 0.4);
            }
          }
        });
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

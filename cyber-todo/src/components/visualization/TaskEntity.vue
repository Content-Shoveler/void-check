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
    
    // Get task color from priority with enhanced quantum effects
    const getTaskColor = computed(() => {
      const priorityColors = {
        'low': 0x00E2F0,      // Bright Teal
        'medium': 0xFFD600,   // Yellow
        'high': 0xFF7A00,     // Orange
        'critical': 0xFF2D55   // Red
      };
      
      return priorityColors[props.task.priority] || priorityColors['medium'];
    });
    
    // Get secondary color for quantum effects
    const getSecondaryColor = computed(() => {
      const secondaryColors = {
        'low': 0x00AAFF,      // Blue
        'medium': 0xFFAA00,   // Gold
        'high': 0xFF00AA,     // Pink
        'critical': 0xFF0066   // Hot Pink
      };
      
      return secondaryColors[props.task.priority] || secondaryColors['medium'];
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
      
      // Create advanced shader material with quantum effects
      const material = new THREE.ShaderMaterial({
        uniforms: {
          primaryColor: { value: new THREE.Color(getTaskColor.value) },
          secondaryColor: { value: new THREE.Color(getSecondaryColor.value) },
          time: { value: 0.0 },
          completed: { value: props.task.completed ? 1.0 : 0.0 },
          selected: { value: props.selected ? 1.0 : 0.0 }
        },
        vertexShader: `
          varying vec2 vUv;
          varying vec3 vNormal;
          varying float vDistortion;
          
          uniform float time;
          uniform float completed;
          uniform float selected;
          
          void main() {
            vUv = uv;
            vNormal = normalize(normalMatrix * normal);
            
            // Create quantum "ripples" on the surface
            float distortion = sin(position.x * 5.0 + time * 0.003) * 
                             sin(position.y * 5.0 + time * 0.004) * 
                             sin(position.z * 5.0 + time * 0.002);
            distortion *= 0.15 * (1.0 - completed * 0.5) * (1.0 + selected * 0.5);
            vDistortion = distortion;
            
            // Apply distortion along the normal
            vec3 newPosition = position + normal * distortion;
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 primaryColor;
          uniform vec3 secondaryColor;
          uniform float time;
          uniform float completed;
          uniform float selected;
          
          varying vec2 vUv;
          varying vec3 vNormal;
          varying float vDistortion;
          
          void main() {
            // Calculate edge highlighting effect
            float fresnel = pow(1.0 - dot(vNormal, vec3(0, 0, 1)), 2.0);
            
            // More glow for selected items
            fresnel *= 1.0 + selected * 2.0;
            
            // Quantum effect pattern based on position and time
            float quantum = 0.5 + 0.5 * sin(vDistortion * 30.0 + time * 0.005);
            quantum = pow(quantum, 3.0);
            
            // Mix colors based on effects
            vec3 finalColor = mix(primaryColor, secondaryColor, fresnel * 0.6 + quantum * 0.4);
            
            // Pulsing glow for selected items
            float pulse = 1.0;
            if (selected > 0.5) {
              pulse = 0.8 + 0.4 * sin(time * 0.003);
            }
            
            // Apply opacity based on completion status
            float alpha = 0.9 - completed * 0.4;
            
            gl_FragColor = vec4(finalColor * pulse, alpha);
          }
        `,
        transparent: true
      });
      
      // Manually set shader material properties to avoid TypeScript errors
      (material as any).blending = THREE.AdditiveBlending;
      (material as any).depthWrite = false;
      
      // Create mesh and add to scene
      const taskMesh = new THREE.Mesh(geometry, material);
      
      // Set position from props
      taskMesh.position.set(
        props.position.x,
        props.position.y,
        props.position.z
      );
      
      // Add quantum particle effects
      addQuantumParticles(taskMesh, props.task);
      
      // Add orbital animations to mesh with enhanced quantum effects
      const animate = (time: number) => {
        if (!taskMesh) return;
        
        // Calculate unique rotation speed based on task ID
        const idHash = props.task.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
        const rotationSpeed = 0.0001 + (idHash % 10) * 0.00002;
        
        // Update shader time uniform
        if (material.uniforms) {
          material.uniforms.time.value = time;
          material.uniforms.selected.value = props.selected ? 1.0 : 0.0;
          material.uniforms.completed.value = props.task.completed ? 1.0 : 0.0;
        }
        
        // Entity rotation animation - more dynamic for quantum effect
        taskMesh.rotation.y += rotationSpeed * 1.2;
        taskMesh.rotation.z += rotationSpeed * 0.3;
        taskMesh.rotation.x += rotationSpeed * 0.1;
        
        // Quantum height fluctuation - more pronounced than previous bobbing
        const heightFactor = props.task.completed ? 0.1 : 0.25;
        const yOffset = Math.sin(time * 0.001 + idHash) * heightFactor + 
                        Math.sin(time * 0.0023 + idHash * 1.3) * heightFactor * 0.3;
        
        taskMesh.position.y = props.position.y + yOffset;
        
        // Quantum spiral movement - only if we have the spiral information from position
        const hasSpiral = props.position.hasOwnProperty('spiralOffset') && 
                          props.position.hasOwnProperty('distortionFactor');
        
        if (hasSpiral && !props.task.completed) {
          // Extract spiral parameters from position (these come from timeScaleUtils)
          const spiralOffset = (props.position as any).spiralOffset || 0.1;
          const distortionFactor = (props.position as any).distortionFactor || 0.5;
          
          // Get orbital parameters
          const orbital = {
            x: props.position.x,
            z: props.position.z
          };
          
          // Calculate distance
          const distance = Math.sqrt(orbital.x * orbital.x + orbital.z * orbital.z);
          
          // Calculate dynamic spiral angle with quantum fluctuations
          const wobbleAmount = 0.05 + spiralOffset * 0.1;
          const wobbleSpeed = 0.0005;
          const timeDistortion = 0.0002 * distortionFactor;
          
          // Quantum angle calculation with multiple frequency components
          const angle = Math.atan2(orbital.z, orbital.x) + 
                       (Math.sin(time * wobbleSpeed + idHash) * wobbleAmount) +
                       (Math.sin(time * wobbleSpeed * 2.3 + idHash * 1.5) * wobbleAmount * 0.3);
          
          // Apply quantum spiral effect to position - more pronounced spiral effect
          taskMesh.position.x = Math.cos(angle + time * timeDistortion) * distance;
          taskMesh.position.z = Math.sin(angle + time * timeDistortion) * distance;
        }
        
        // Update any particles attached to the task mesh
        if ((taskMesh as any).particleAnimationCallback) {
          (taskMesh as any).particleAnimationCallback(time);
        }
      };
      
      // Function to add quantum particle effects
      function addQuantumParticles(taskMesh: THREE.Mesh, task: Task) {
        // Only add particle effects for higher priority tasks
        if (task.priority === 'low') return;
        
        // Number of particles based on priority
        const particleCount = task.priority === 'critical' ? 50 : 
                             task.priority === 'high' ? 30 : 20;
        
        // Create particle geometry
        const particlesGeometry = new THREE.BufferGeometry();
        const particlePositions = new Float32Array(particleCount * 3);
        
        // Create particles in a spherical distribution around the task
        const taskRadius = 2; // Fixed radius since boundingSphere is not reliable
        const orbitRadius = taskRadius * 1.2;
        
        for (let i = 0; i < particleCount; i++) {
          const i3 = i * 3;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          
          particlePositions[i3] = orbitRadius * Math.sin(phi) * Math.cos(theta);
          particlePositions[i3 + 1] = orbitRadius * Math.sin(phi) * Math.sin(theta);
          particlePositions[i3 + 2] = orbitRadius * Math.cos(phi);
        }
        
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
        
        // Create shader material for quantum particles
        const particleMaterial = new THREE.ShaderMaterial({
          uniforms: {
            color: { value: new THREE.Color(getSecondaryColor.value) },
            time: { value: 0 },
            completed: { value: task.completed ? 1.0 : 0.0 }
          },
          vertexShader: `
            uniform float time;
            
            void main() {
              // Add quantum orbital movement
              vec3 displaced = position;
              float angle = atan(position.z, position.x) + time * 0.001;
              float radius = length(position);
              
              // Create quantum spiral motion
              displaced.x = cos(angle) * radius;
              displaced.z = sin(angle) * radius;
              
              // Add vertical oscillation
              displaced.y += sin(time * 0.002 + angle * 3.0) * 0.2;
              
              gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
              gl_PointSize = 1.5;
            }
          `,
          fragmentShader: `
            uniform vec3 color;
            uniform float time;
            uniform float completed;
            
            void main() {
              // Create circular point with soft edge
              float r = 0.5;
              vec2 uv = gl_PointCoord - vec2(0.5);
              float d = length(uv);
              
              if (d > r) {
                discard;
              }
              
              // Quantum glow that pulses
              float pulse = 0.7 + 0.3 * sin(time * 0.003);
              float alpha = (1.0 - d * 2.0) * pulse * (1.0 - completed * 0.5);
              
              gl_FragColor = vec4(color, alpha);
            }
          `,
          transparent: true
        });
        
        // Manually set shader material properties to avoid TypeScript errors
        (particleMaterial as any).blending = THREE.AdditiveBlending;
        (particleMaterial as any).depthWrite = false;
        
        // Create the particle system
        const particles = new THREE.Points(particlesGeometry, particleMaterial);
        
        // Create animation callback
        const animationCallback = (time: number) => {
          if (particleMaterial.uniforms) {
            particleMaterial.uniforms.time.value = time;
            particleMaterial.uniforms.completed.value = task.completed ? 1.0 : 0.0;
          }
          
          // Add rotation to particle system
          particles.rotation.y = time * 0.0005;
        };
        
        // Store the animation callback for manual calling in our animate function
        (taskMesh as any).particleAnimationCallback = animationCallback;
        
        // Add particles to the task mesh
        taskMesh.add(particles);
        
        // Store reference for cleanup
        (taskMesh as any).particles = particles;
      }
      
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
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-family: 'Rajdhani', sans-serif;
  letter-spacing: 0.5px;
  white-space: nowrap;
  transition: all 0.3s ease;
  transform: translateY(-100%);
  margin-bottom: 10px;
  backdrop-filter: blur(4px);
  box-shadow: 0 0 8px rgba(0, 170, 255, 0.5);
  border: 1px solid rgba(0, 170, 255, 0.3);
  
  &.is-selected {
    background-color: rgba(0, 170, 255, 0.4);
    color: white;
    font-weight: bold;
    box-shadow: 0 0 15px rgba(0, 170, 255, 0.8);
    border-color: rgba(0, 170, 255, 0.6);
  }
}
</style>

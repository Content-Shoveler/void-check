<template>
  <div 
    ref="containerRef" 
    class="space-renderer" 
    :class="{ 'webgl-error': !isWebGLSupported }"
  >
    <div v-if="!isWebGLSupported" class="webgl-error-message">
      <h3>WebGL Support Required</h3>
      <p>Your browser doesn't support WebGL or it's disabled. Please enable WebGL or use a supported browser to see the space visualization.</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, ref, watch, computed } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useSettingsStore } from '../../store/modules/settings';
import { isWebGLAvailable, getOptimalPixelRatio } from '../../utils/webglUtils';

// Define interfaces for our custom methods
interface RingConfig {
  radius: number;
  opacity: number;
  label: string;
}

export default defineComponent({
  name: 'SpaceRenderer',
  
  props: {
    backgroundColor: {
      type: String,
      default: ''
    }
  },
  
  emits: ['scene-ready', 'render', 'camera-updated'],
  
  setup(props, { emit }) {
    const containerRef = ref<HTMLElement | null>(null);
    const settingsStore = useSettingsStore();
    const isWebGLSupported = ref(true);
    
    // Core Three.js objects
    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;
    let renderer: THREE.WebGLRenderer | null = null;
    let controls: OrbitControls | null = null;
    let animationFrameId: number | null = null;
    
    // Store references to orbital rings for dynamic updates
    const orbitalRings: THREE.Mesh[] = [];
    
    // Store resize handler reference for cleanup
    let resizeHandler: ((e: UIEvent) => void) | null = null;
    
    // Animation callbacks for objects in the scene
    const animationCallbacks: ((time: number) => void)[] = [];
    
    // Performance monitoring
    let lastTime = 0;
    let frameCounter = 0;
    let frameRate = 0;
    
    // Calculate scene background color based on theme
    const sceneBackgroundColor = computed(() => {
      if (props.backgroundColor) {
        return new THREE.Color(props.backgroundColor);
      }
      return new THREE.Color(settingsStore.isDarkTheme ? '#050718' : '#F0F4FF');
    });
    
    // Initialize the WebGL scene
    const initScene = () => {
      if (!isWebGLAvailable()) {
        isWebGLSupported.value = false;
        return false;
      }
      
      // Create scene
      scene = new THREE.Scene();
      scene.background = sceneBackgroundColor.value;
      
      // Create camera with proper perspective for 2D orbital visualization
      camera = new THREE.PerspectiveCamera(
        50, // Reduced FOV for better orbital view
        containerRef.value ? containerRef.value.clientWidth / containerRef.value.clientHeight : 1,
        0.1, // Near plane
        2000 // Far plane
      );
      // Position camera more directly above for top-down orbital view
      camera.position.y = 60;
      camera.position.z = 40;
      camera.position.x = 0;
      camera.lookAt(0, 0, 0);
      
      // Initialize renderer with anti-aliasing if performance allows
      renderer = new THREE.WebGLRenderer({
        antialias: !settingsStore.isPerformanceMode,
        alpha: true,
        powerPreference: 'high-performance'
      });
      
      // Set pixel ratio based on performance mode
      renderer.setPixelRatio(getOptimalPixelRatio(settingsStore.isPerformanceMode));
      
      // Create orbit controls optimized for 2D orbital view
      if (camera && containerRef.value) {
        controls = new OrbitControls(camera, containerRef.value);
        controls.enableDamping = true;
        controls.dampingFactor = 0.1;
        controls.rotateSpeed = 0.5;
        controls.maxDistance = 180;
        controls.minDistance = 40;
        // Limit vertical rotation more to encourage top-down view
        controls.minPolarAngle = Math.PI * 0.05; // Closer to top-down
        controls.maxPolarAngle = Math.PI * 0.5;  // Only allow down to horizontal
        // Add initial auto-rotation for solar system feel
        // controls.autoRotate = true;
        controls.autoRotateSpeed = 0.5;
      }
      
      // Handle container resize
      resizeHandler = (e: UIEvent) => {
        if (!containerRef.value || !camera || !renderer) return;
        
        const width = containerRef.value.clientWidth;
        const height = containerRef.value.clientHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        
        renderer.setSize(width, height);
      };
      
      window.addEventListener('resize', resizeHandler);
      
      // Initialize size
      if (containerRef.value && renderer) {
        renderer.setSize(
          containerRef.value.clientWidth, 
          containerRef.value.clientHeight
        );
        containerRef.value.appendChild(renderer.domElement);
      }
      
      // Create ambient light for base illumination
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);
      
      // Add directional light for shadows and definition
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(1, 1, 1);
      scene.add(directionalLight);
      
      // Create orbital rings handled by updateOrbitalRings
      
      // Create star field background
      createStarField();
      
      // Create center marker for current time (the "sun")
      createCenterTimeMarker();
      
      // Emit ready event with scene and camera
      emit('scene-ready', { scene, camera, renderer });
      
      // Start animation loop
      const animate = (time: number) => {
        if (!scene || !camera || !renderer || !controls) return;
        
        animationFrameId = requestAnimationFrame(animate);
        
        // Update controls
        controls.update();
        
        // Performance monitoring
        frameCounter++;
        if (time - lastTime > 1000) {
          frameRate = frameCounter;
          frameCounter = 0;
          lastTime = time;
        }
        
        // Run all animation callbacks
        animationCallbacks.forEach(callback => callback(time));
        
        // Emit render event for parent component
        emit('render', { time, frameRate });
        
        // Render the scene
        renderer.render(scene, camera);
      };
      
      animate(0);
      
      return true;
    };
    
    // Orbital rings are now created dynamically via updateOrbitalRings
    
    // Create center marker representing current time ("sun")
    const createCenterTimeMarker = () => {
      if (!scene) return;
      
      // Create a larger, sun-like sphere to represent the current time center point
      const geometry = new THREE.SphereGeometry(4, 32, 32);
      
      // Create custom shader material with sun-like gradient and glow
      const material = new THREE.ShaderMaterial({
        uniforms: {
          colorA: { value: new THREE.Color(0xFFAA00) }, // Warm sun-like center color
          colorB: { value: new THREE.Color(0xFF5500) }, // Outer sun color
          time: { value: 0.0 }
        },
        vertexShader: `
          varying vec2 vUv;
          
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 colorA;
          uniform vec3 colorB;
          uniform float time;
          varying vec2 vUv;
          
          void main() {
            // Create animated gradient effect
            vec3 color = mix(colorA, colorB, vUv.y + sin(time * 0.001) * 0.2);
            
            // Add glow effect 
            float intensity = 1.0 - 2.0 * length(vUv - 0.5);
            intensity = pow(intensity, 1.5);
            
            gl_FragColor = vec4(color, 0.8 * intensity);
          }
        `,
        transparent: true
      });
      
      // Create mesh and add to scene
      const centerMarker = new THREE.Mesh(geometry, material);
      centerMarker.position.set(0, 0, 0);
      scene.add(centerMarker);
      
      // Add pulsing effect animation
      const markerAnimation = (time: number) => {
        if (centerMarker && material.uniforms) {
          // Update time uniform for shader animation
          material.uniforms.time.value = time;
        }
      };
      
      animationCallbacks.push(markerAnimation);
      
      // Create corona effect with particles around the sun
      const particleCount = 300;
      const particlesGeometry = new THREE.BufferGeometry();
      const particlePositions = new Float32Array(particleCount * 3);
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const radius = 4 + Math.random();
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        particlePositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        particlePositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        particlePositions[i3 + 2] = radius * Math.cos(phi);
      }
      
      particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
      
      const particlesMaterial = new THREE.PointsMaterial({
        size: 0.8,
        color: 0xFFAA00,
        transparent: true,
        opacity: 0.2,
        blending: THREE.AdditiveBlending
      });
      
      const particles = new THREE.Points(particlesGeometry, particlesMaterial);
      scene.add(particles);
      
      // Add subtle rotation to particles
      const particleAnimation = (time: number) => {
        if (particles) {
          particles.rotation.y = time * 0.0003;
          particles.rotation.x = time * 0.0002;
        }
      };
      
      animationCallbacks.push(particleAnimation);
    };
    
    // Create star field as background
    const createStarField = () => {
      if (!scene) return;
      
      const starCount = settingsStore.isPerformanceMode ? 500 : 2000;
      
      // Create star particles
      const starsGeometry = new THREE.BufferGeometry();
      const starPositions = new Float32Array(starCount * 3);
      const starSizes = new Float32Array(starCount);
      
      for (let i = 0; i < starCount; i++) {
        const i3 = i * 3;
        // Position stars in a large sphere around the center
        const radius = 150 + Math.random() * 500;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        starPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        starPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        starPositions[i3 + 2] = radius * Math.cos(phi);
        
        // Vary star sizes slightly
        starSizes[i] = 0.5 + Math.random();
      }
      
      starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
      starsGeometry.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));
      
      // Create star material
      const starsMaterial = new THREE.PointsMaterial({
        size: 1,
        color: 0xffffff,
        transparent: true,
        opacity: 0.8,
        vertexColors: false,
        sizeAttenuation: true
      });
      
      // Create star points
      const stars = new THREE.Points(starsGeometry, starsMaterial);
      scene.add(stars);
      
      // Slowly rotate stars for ambient effect
      const starsAnimation = (time: number) => {
        if (stars) {
          stars.rotation.y = time * 0.00002;
          stars.rotation.x = time * 0.00001;
        }
      };
      
      animationCallbacks.push(starsAnimation);
    };
    
    // Update orbital rings based on time scale
    const updateOrbitalRings = (
      ringConfigs: RingConfig[]
    ) => {
      if (!scene) return false;
      
      // Clean up existing rings
      orbitalRings.forEach(ring => {
        if (scene && ring) {
          scene.remove(ring);
          if (ring.geometry) {
            ring.geometry.dispose();
          }
          if (ring.material && !Array.isArray(ring.material)) {
            ring.material.dispose();
          }
        }
      });
      orbitalRings.length = 0;
      
      // Create new rings based on configs
      ringConfigs.forEach(config => {
        const innerRadius = config.radius;
        const outerRadius = config.radius + 0.5;
        
        const ringGeometry = new THREE.RingGeometry(innerRadius, outerRadius, 64);
        
        const ringMaterial = new THREE.MeshBasicMaterial({
          color: 0x0066cc,
          transparent: true,
          opacity: config.opacity,
          side: THREE.DoubleSide
        });
        
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        
        // Position ring slightly below task plane
        ring.position.y = -0.2;
        
        // Rotate ring to lay flat on XZ plane
        ring.rotation.x = Math.PI / 2;
        
        // Add ring to scene
        if (scene) {
          scene.add(ring);
        }
        
        // Store for updates and cleanup
        orbitalRings.push(ring);
        
        // No labels needed - they're redundant with the slider markers
      });
      
      // Add animations for all rings
      const animationIndex = animationCallbacks.findIndex(
        callback => callback.name === 'ringAnimation'
      );
      
      if (animationIndex >= 0) {
        animationCallbacks.splice(animationIndex, 1);
      }
      
      function ringAnimation(time: number) {
        orbitalRings.forEach((ring, index) => {
          const speedFactor = 1 - (index / Math.max(1, orbitalRings.length)) * 0.6;
          ring.rotation.z = time * 0.0002 * speedFactor;
        });
      }
      
      animationCallbacks.push(ringAnimation);
      
      return true;
    };
    
    // Camera position is now fixed - no need for updateCameraPosition
    
    // Easing function for smoother animations
    const easeInOutCubic = (t: number): number => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };
    
    // Cleanup when component is destroyed
    onUnmounted(() => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      
      // Remove resize event listener
      if (resizeHandler) {
        window.removeEventListener('resize', resizeHandler);
      }
      
      // Dispose of all Three.js objects to prevent memory leaks
      if (scene) {
        scene.traverse((object: THREE.Object3D) => {
          if (object instanceof THREE.Mesh) {
            if (object.geometry) {
              object.geometry.dispose();
            }
            
            if (object.material) {
              if (Array.isArray(object.material)) {
                object.material.forEach((material: THREE.Material) => material.dispose());
              } else {
                object.material.dispose();
              }
            }
          }
        });
      }
      
      if (renderer) {
        renderer.dispose();
        
        if (containerRef.value?.contains(renderer.domElement)) {
          containerRef.value.removeChild(renderer.domElement);
        }
      }
      
      // Clear animation callbacks
      animationCallbacks.length = 0;
    });
    
    // Wait for DOM to be ready before initializing
    onMounted(() => {
      const initialized = initScene();
      isWebGLSupported.value = initialized;
    });
    
    // React to theme changes
    watch(
      () => sceneBackgroundColor.value,
      (newColor) => {
        if (scene) {
          scene.background = newColor;
        }
      }
    );
    
    // React to performance setting changes
    watch(
      () => settingsStore.isPerformanceMode,
      (performanceMode) => {
        if (renderer) {
          renderer.setPixelRatio(getOptimalPixelRatio(performanceMode));
        }
      }
    );
    
    // Public method to add objects to the scene
    const addToScene = (object: THREE.Object3D) => {
      if (scene) {
        scene.add(object);
        return true;
      }
      return false;
    };
    
    // Public method to remove objects from the scene
    const removeFromScene = (object: THREE.Object3D) => {
      if (scene) {
        scene.remove(object);
        return true;
      }
      return false;
    };
    
    // Public method to add animation callbacks
    const addAnimationCallback = (callback: (time: number) => void) => {
      animationCallbacks.push(callback);
      return animationCallbacks.length - 1; // Return index for removal
    };
    
    // Public method to remove animation callbacks
    const removeAnimationCallback = (index: number) => {
      if (index >= 0 && index < animationCallbacks.length) {
        animationCallbacks.splice(index, 1);
        return true;
      }
      return false;
    };
    
    return {
      containerRef,
      isWebGLSupported,
      addToScene,
      removeFromScene,
      addAnimationCallback,
      removeAnimationCallback,
      updateOrbitalRings
    };
  }
});
</script>

<style lang="scss" scoped>
.space-renderer {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  flex: 1;
  display: flex;
  
  &.webgl-error {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.05);
  }
  
  canvas {
    width: 100% !important;
    height: 100% !important;
    display: block;
  }
}

.webgl-error-message {
  text-align: center;
  padding: 2rem;
  max-width: 80%;
  
  h3 {
    color: var(--color-error);
    margin-bottom: 0.5rem;
  }
  
  p {
    color: var(--color-text-secondary);
  }
}
</style>

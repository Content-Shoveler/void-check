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

export default defineComponent({
  name: 'SpaceRenderer',
  
  props: {
    backgroundColor: {
      type: String,
      default: ''
    }
  },
  
  emits: ['scene-ready', 'render'],
  
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
      
      // Create camera with proper perspective for space visualization
      camera = new THREE.PerspectiveCamera(
        60, // FOV
        containerRef.value ? containerRef.value.clientWidth / containerRef.value.clientHeight : 1,
        0.1, // Near plane
        2000 // Far plane
      );
      camera.position.z = 40;
      camera.position.y = 10;
      camera.lookAt(0, 0, 0);
      
      // Initialize renderer with anti-aliasing if performance allows
      renderer = new THREE.WebGLRenderer({
        antialias: !settingsStore.isPerformanceMode,
        alpha: true,
        powerPreference: 'high-performance'
      });
      
      // Set pixel ratio based on performance mode
      renderer.setPixelRatio(getOptimalPixelRatio(settingsStore.isPerformanceMode));
      
      // Create orbit controls for camera interaction
      if (camera && containerRef.value) {
        controls = new OrbitControls(camera, containerRef.value);
        controls.enableDamping = true;
        controls.dampingFactor = 0.1;
        controls.rotateSpeed = 0.5;
        controls.maxDistance = 150;
        controls.minDistance = 20;
        // Limit vertical rotation to avoid flipping
        controls.minPolarAngle = Math.PI * 0.1;
        controls.maxPolarAngle = Math.PI * 0.9;
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
      
      // Create star field background
      createStarField();
      
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
    
    // Create star field as background
    const createStarField = () => {
      if (!scene) return;
      
      const starCount = settingsStore.isPerformanceMode ? 500 : 2000;
      const starColors = [0xffffff, 0xffffee, 0xeeeeff];
      
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
      animationCallbacks.push((time) => {
        if (stars) {
          stars.rotation.y = time * 0.00002;
          stars.rotation.x = time * 0.00001;
        }
      });
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
      removeAnimationCallback
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

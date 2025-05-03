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
    
    // Store original camera settings for reset
    let originalCameraPosition: THREE.Vector3 | null = null;
    let originalOrbitTarget: THREE.Vector3 | null = null;
    
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
      
      // Store original camera position and target for reset functionality
      originalCameraPosition = camera.position.clone();
      originalOrbitTarget = new THREE.Vector3(0, 0, 0);
      
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
        controls.maxDistance = 200;
        controls.minDistance = 15;
        controls.minPolarAngle = Math.PI * 0.05; // Closer to top-down
        controls.maxPolarAngle = Math.PI * 0.5;  // Only allow down to horizontal
        controls.autoRotate = true;
        controls.autoRotateSpeed = -0.1;
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
    
    // Create center marker representing current time ("black hole")
    const createCenterTimeMarker = () => {
      if (!scene) return;
      
      // Create the black hole event horizon (dark center)
      const geometry = new THREE.SphereGeometry(2, 64, 64);
      
      // Advanced shader for black hole event horizon with blue energy accents
      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0.0 },
          intensity: { value: 0.8 }
        },
        vertexShader: `
          varying vec2 vUv;
          varying vec3 vPosition;
          
          void main() {
            vUv = uv;
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float time;
          uniform float intensity;
          varying vec2 vUv;
          varying vec3 vPosition;
          
          float random(vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
          }
          
          void main() {
            // Calculate distance from center
            float dist = length(vUv - 0.5) * 2.0;
            
            // Create pulsing event horizon effect
            float edgePulse = smoothstep(0.7, 1.0, dist) * sin(time * 0.003) * 0.2;
            
            // Add subtle blue energy accents
            vec3 blueEnergy = vec3(0.0, 0.2, 0.5) * (1.0 - dist) * 0.8;
            
            // Create void/darkness
            vec3 color = mix(vec3(0.0, 0.0, 0.0), blueEnergy, edgePulse + 0.1);
            
            // Create gravitational lensing effect around the edge
            float lensStrength = smoothstep(0.8, 1.0, dist) * 0.6;
            
            // Create flickering stars/energy at the event horizon
            float flicker = random(vUv + vec2(time * 0.001, 0.0)) * smoothstep(0.8, 0.95, dist);
            
            // Add subtle swirling energy patterns
            float swirl = sin(atan(vPosition.x, vPosition.z) * 8.0 + time * 0.002) * 0.5 + 0.5;
            swirl *= smoothstep(0.6, 0.9, dist) * 0.3;
            
            // Combine all effects
            color += vec3(0.2, 0.4, 1.0) * (swirl + flicker * 0.5) * lensStrength;
            
            // Apply extreme darkness in center
            float center = 1.0 - smoothstep(0.0, 0.7, dist);
            color = mix(color, vec3(0.0), center * 0.95);
            
            // Adjust opacity for event horizon effect
            float alpha = intensity * (0.9 - (center * 0.4));
            
            gl_FragColor = vec4(color, alpha);
          }
        `,
        transparent: true,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      });
      
      // Create mesh and add to scene
      const blackHole = new THREE.Mesh(geometry, material);
      blackHole.position.set(0, 0, 0);
      scene.add(blackHole);
      
      // Add pulsing effect animation
      animationCallbacks.push((time) => {
        if (blackHole && material.uniforms) {
          // Update time uniform for shader animation
          material.uniforms.time.value = time;
          
          // Subtle size variations
          const pulse = 1.0 + Math.sin(time * 0.001) * 0.02;
          blackHole.scale.set(pulse, pulse, pulse);
        }
      });
      
      // Create accretion disk (the glowing swirling matter around the black hole)
      const diskGeometry = new THREE.RingGeometry(2.2, 8, 128, 8);
      
      // Apply warping to create disk curvature
      const diskPositions = diskGeometry.attributes.position.array;
      for (let i = 0; i < diskPositions.length; i += 3) {
        const x = diskPositions[i];
        const y = diskPositions[i + 1];
        const z = diskPositions[i + 2];
        
        // Calculate distance from center
        const distance = Math.sqrt(x * x + z * z);
        
        // Apply warping based on distance
        diskPositions[i + 1] = Math.sin((distance - 2.2) * 0.5) * 0.5;
      }
      
      // Create advanced shader for accretion disk
      const diskMaterial = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0.0 }
        },
        vertexShader: `
          varying vec2 vUv;
          varying float vDistance;
          
          void main() {
            vUv = uv;
            
            // Calculate distance from center for coloring
            vDistance = length(position.xz) / 8.0;
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float time;
          varying vec2 vUv;
          varying float vDistance;
          
          void main() {
            // Create swirling effect based on angle
            float angle = atan(vUv.y - 0.5, vUv.x - 0.5);
            
            // Animate rotation over time
            float swirl = sin(angle * 10.0 + time * 0.004 - vDistance * 15.0) * 0.5 + 0.5;
            
            // Distance-based coloring (hotter near center)
            float innerGlow = (1.0 - vDistance) * 2.0;
            
            // Set base colors
            vec3 hotColor = vec3(1.0, 0.5, 0.1);  // Orange-red near center
            vec3 coolColor = vec3(0.1, 0.3, 0.6); // Blue-purple at edges
            
            // Create plasma-like effect
            vec3 color = mix(hotColor, coolColor, vDistance);
            
            // Add swirling intensity variations
            color *= 0.8 + swirl * 0.7;
            
            // Make disk fade based on distance
            float alpha = smoothstep(1.0, 0.2, vDistance) * (0.6 + swirl * 0.4);
            
            gl_FragColor = vec4(color, alpha);
          }
        `,
        transparent: true,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      
      const accretionDisk = new THREE.Mesh(diskGeometry, diskMaterial);
      accretionDisk.rotation.x = Math.PI / 2; // Make disk horizontal
      scene.add(accretionDisk);
      
      // Add animation to the accretion disk
      animationCallbacks.push((time) => {
        if (accretionDisk && diskMaterial.uniforms) {
          // Update time uniform for animation
          diskMaterial.uniforms.time.value = time;
          
          // Add slow rotation
          accretionDisk.rotation.z = time * 0.0001;
        }
      });
      
      // Create particles being drawn into the black hole
      const particleCount = 200;
      const particlesGeometry = new THREE.BufferGeometry();
      const particlePositions = new Float32Array(particleCount * 3);
      const particleSizes = new Float32Array(particleCount);
      const particleColors = new Float32Array(particleCount * 3);
      const particleData = new Float32Array(particleCount * 3); // Speed, initial radius, angle
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        // Start particles at random positions in a larger radius around the black hole
        const radius = 3 + Math.random() * 8;
        const theta = Math.random() * Math.PI * 2;
        const phi = (Math.random() - 0.5) * 0.2 + Math.PI / 2; // Keep close to the accretion disk plane
        
        particlePositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        particlePositions[i3 + 1] = radius * Math.cos(phi);
        particlePositions[i3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
        
        // Store data for animation
        particleData[i3] = 0.2 + Math.random() * 0.8; // Speed
        particleData[i3 + 1] = radius; // Initial radius
        particleData[i3 + 2] = theta; // Initial angle
        
        // Size based on distance (larger near center)
        particleSizes[i] = 0.3 + Math.random() * 0.7;
        
        // Colors based on distance (bluer far away, redder near center)
        const distRatio = radius / 10;
        particleColors[i3] = Math.min(1.0, 1.2 - distRatio * 0.5); // Red
        particleColors[i3 + 1] = Math.min(1.0, 0.5 - distRatio * 0.2); // Green
        particleColors[i3 + 2] = Math.min(1.0, 1.0 - distRatio * 0.5); // Blue
      }
      
      particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
      particlesGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));
      particlesGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
      
      const particlesMaterial = new THREE.PointsMaterial({
        size: 0.5,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
      });
      
      const particles = new THREE.Points(particlesGeometry, particlesMaterial);
      scene.add(particles);
      
      // Add particle animation (being drawn into the black hole)
      animationCallbacks.push((time) => {
        if (particles) {
          const positions = particlesGeometry.attributes.position.array;
          const sizes = particlesGeometry.attributes.size.array;
          const colors = particlesGeometry.attributes.color.array;
          
          for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Get current position
            let x = positions[i3];
            let y = positions[i3 + 1];
            let z = positions[i3 + 2];
            
            // Calculate current distance from center
            const distSq = x * x + y * y + z * z;
            const dist = Math.sqrt(distSq);
            
            // Direction vector toward black hole
            const dx = -x / dist;
            const dy = -y / dist;
            const dz = -z / dist;
            
            // Compute gravitational force (stronger when closer)
            const force = 0.05 / Math.max(0.5, dist); 
            const speed = particleData[i3];
            
            // Update position (moving toward black hole, faster when closer)
            positions[i3] += dx * force * speed;
            positions[i3 + 1] += dy * force * speed;
            positions[i3 + 2] += dz * force * speed;
            
            // Add some spiral effect
            const spiral = 0.04 * force;
            const nx = positions[i3];
            const nz = positions[i3 + 2];
            const r = Math.sqrt(nx * nx + nz * nz);
            const angle = Math.atan2(nz, nx) + spiral;
            positions[i3] = r * Math.cos(angle);
            positions[i3 + 2] = r * Math.sin(angle);
            
            // If too close to center, reset to outside
            if (dist < 1) {
              const initRadius = particleData[i3 + 1];
              const initTheta = particleData[i3 + 2] + Math.random() * 2;
              const initPhi = (Math.random() - 0.5) * 0.2 + Math.PI / 2;
              
              positions[i3] = initRadius * Math.sin(initPhi) * Math.cos(initTheta);
              positions[i3 + 1] = initRadius * Math.cos(initPhi);
              positions[i3 + 2] = initRadius * Math.sin(initPhi) * Math.sin(initTheta);
            }
            
            // Update colors based on distance (hotter when closer)
            const distRatio = dist / 10;
            colors[i3] = Math.min(1.0, 1.2 - distRatio * 0.5); // Red
            colors[i3 + 1] = Math.min(1.0, 0.5 - distRatio * 0.3); // Green
            colors[i3 + 2] = Math.min(1.0, 1.0 - distRatio * 0.5); // Blue
            
            // Update size based on distance (larger when closer)
            sizes[i] = 0.3 + (1.0 / Math.max(1, dist)) * 0.7;
          }
          
          // Update attributes
          particlesGeometry.attributes.position.needsUpdate = true;
          particlesGeometry.attributes.size.needsUpdate = true;
          particlesGeometry.attributes.color.needsUpdate = true;
        }
      });
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
    
    // Focus camera on a specific position
    const focusOnPosition = (targetPosition: THREE.Vector3) => {
      if (!camera || !controls) return false;
      
      // Store current positions
      const currentCameraPos = camera.position.clone();
      const currentTarget = controls.target.clone();
      
      // Calculate camera offset from target
      const offset = new THREE.Vector3().subVectors(currentCameraPos, currentTarget);
      
      // Set new target to task position
      const newTarget = targetPosition.clone();
      
      // Calculate new camera position that maintains the same view angle
      const newCameraPos = new THREE.Vector3().addVectors(newTarget, offset);
      
      // Animate the transition
      animateTransition(currentCameraPos, newCameraPos, currentTarget, newTarget);
      
      return true;
    };
    
    // Animate camera transition smoothly
    const animateTransition = (
      startCameraPos: THREE.Vector3, 
      endCameraPos: THREE.Vector3,
      startTarget: THREE.Vector3,
      endTarget: THREE.Vector3
    ) => {
      const duration = 1000; // ms
      const startTime = Date.now();
      
      const animateCamera = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Use easing function for smooth transition
        const easeProgress = easeOutCubic(progress);
        
        // Interpolate camera position
        camera!.position.lerpVectors(startCameraPos, endCameraPos, easeProgress);
        
        // Interpolate target position
        controls!.target.lerpVectors(startTarget, endTarget, easeProgress);
        
        // Update controls
        controls!.update();
        
        // Continue animation if not complete
        if (progress < 1) {
          requestAnimationFrame(animateCamera);
        }
      };
      
      animateCamera();
    };
    
    // Easing function for smooth animation
    const easeOutCubic = (t: number): number => {
      return 1 - Math.pow(1 - t, 3);
    };
    
    // Reset camera position to initial state
    const resetCameraPosition = () => {
      if (!camera || !controls || !originalCameraPosition || !originalOrbitTarget) return false;
      
      animateTransition(
        camera.position.clone(),
        originalCameraPosition.clone(),
        controls.target.clone(),
        originalOrbitTarget.clone()
      );
      
      return true;
    };

    return {
      containerRef,
      isWebGLSupported,
      addToScene,
      removeFromScene,
      addAnimationCallback,
      removeAnimationCallback,
      focusOnPosition,
      resetCameraPosition
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

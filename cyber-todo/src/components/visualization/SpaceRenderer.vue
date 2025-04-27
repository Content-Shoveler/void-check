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
import { 
  generateGridLines, 
  GridLine, 
  getTimeScaleTransition, 
  TIME_INTERVALS,
  getTimeScaleLabel,
  INTERVAL_LABELS
} from '../../utils/timeScaleUtils';

export default defineComponent({
  name: 'SpaceRenderer',
  
  props: {
    backgroundColor: {
      type: String,
      default: ''
    },
    timeScale: {
      type: Number,
      default: 2 // Default to day scale (index 2)
    }
  },
  
  emits: ['scene-ready', 'render', 'time-warp-complete'],
  
  setup(props, { emit }) {
    const containerRef = ref<HTMLElement | null>(null);
    const settingsStore = useSettingsStore();
    const isWebGLSupported = ref(true);
    const timeWarpInProgress = ref(false);
    const previousTimeScale = ref(props.timeScale);
    
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
    
    // Objects that need to be tracked for updates
    const trackableObjects = {
      gridLines: new Map<string, THREE.Object3D>(),
      timeLabels: new Map<string, THREE.Object3D>(),
      timeSingularity: null as THREE.Object3D | null,
      starField: null as THREE.Points | null,
      particleSystems: [] as THREE.Points[]
    };
    
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
    
    // Helper function to dispose of Three.js objects
    const disposeObject = (object: THREE.Object3D) => {
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
      } else if (object instanceof THREE.Points) {
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
      
      // Recursively dispose children
      const objChildren = object.children ? [...object.children] : [];
      for (let i = 0; i < objChildren.length; i++) {
        disposeObject(objChildren[i]);
      }
    };
    
    // Get color for different time intervals
    const getTimeIntervalColor = (interval: keyof typeof TIME_INTERVALS): number => {
      const colors: Record<string, number> = {
        minute: 0x00FFCC, // Teal
        hour: 0x00AAFF,   // Blue
        day: 0x0066FF,    // Darker blue
        week: 0x6600FF,   // Purple
        month: 0xCC00FF,  // Magenta
        quarter: 0xFF00AA, // Pink
        year: 0xFF0066    // Red
      };
      
      return colors[interval] || 0x00AAFF;
    };
    
    // Initialize the WebGL scene
    const initScene = () => {
      if (!isWebGLAvailable()) {
        isWebGLSupported.value = false;
        return false;
      }
      
      // Create scene
      scene = new THREE.Scene();
      scene.background = sceneBackgroundColor.value;
      
      // Create camera with proper perspective for quantum visualization
      camera = new THREE.PerspectiveCamera(
        45, // Wider FOV for better spiral view
        containerRef.value ? containerRef.value.clientWidth / containerRef.value.clientHeight : 1,
        0.1, // Near plane
        2000 // Far plane
      );
      // Position camera to view the spiral from an angle
      camera.position.y = 70;
      camera.position.z = 70;
      camera.position.x = -20;
      camera.lookAt(0, 0, 0);
      
      // Initialize renderer with post-processing capabilities
      renderer = new THREE.WebGLRenderer({
        antialias: !settingsStore.isPerformanceMode,
        alpha: true,
        powerPreference: 'high-performance'
      });
      
      // Set pixel ratio based on performance mode
      renderer.setPixelRatio(getOptimalPixelRatio(settingsStore.isPerformanceMode));
      
      // Create orbit controls for quantum visualization
      if (camera && containerRef.value) {
        controls = new OrbitControls(camera, containerRef.value);
        controls.enableDamping = true;
        controls.dampingFactor = 0.1;
        controls.rotateSpeed = 0.5;
        controls.maxDistance = 180;
        controls.minDistance = 30;
        // Allow more freedom for vertical rotation to see spiral
        controls.minPolarAngle = Math.PI * 0.05;
        controls.maxPolarAngle = Math.PI * 0.6;
        controls.autoRotateSpeed = 0.3;
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
      
      // Make addAnimationCallback available through userData
      if (scene) {
        scene.userData = {
          addAnimationCallback: (callback: (time: number) => void) => {
            const index = animationCallbacks.push(callback) - 1;
            return index;
          }
        };
      }
      
      // Create the quantum visualization elements
      createGridLines(props.timeScale);
      createStarField();
      createTimeSingularity();
      
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
    
    // Create quantum grid lines based on time scale
    const createGridLines = (timeScale: number) => {
      if (!scene) return;
      
      // Clear any existing grid lines
      trackableObjects.gridLines.forEach((group) => {
        scene.remove(group);
        disposeObject(group);
      });
      trackableObjects.gridLines.clear();
      
      // Clear any existing time labels
      trackableObjects.timeLabels.forEach((label) => {
        scene.remove(label);
        disposeObject(label);
      });
      trackableObjects.timeLabels.clear();
      
      // Generate grid lines based on current time scale
      const gridLines = generateGridLines(timeScale);
      
      // Create visual representations for each grid line
      gridLines.forEach((gridLine) => {
        createGridLine(gridLine);
      });
    };
    
    // Create a single grid line with its visual elements
    const createGridLine = (gridLine: GridLine) => {
      if (!scene) return;
      
      const group = new THREE.Object3D();
      if (group) {
        group.name = `grid-${gridLine.interval}-${gridLine.timeMs}`;
      }
      
      // Create ring geometry
      const ringThickness = 0.2 + (gridLine.alpha * 0.3); // Thicker rings for primary intervals
      const segments = Math.max(64, Math.floor(gridLine.radius * 2)); // More segments for larger rings
      
      const ringGeometry = new THREE.RingGeometry(
        gridLine.radius, 
        gridLine.radius + ringThickness, 
        segments
      );
      
      // Create custom shader material for the grid lines with glow effect
      const ringMaterial = new THREE.ShaderMaterial({
        uniforms: {
          color: { value: new THREE.Color(getTimeIntervalColor(gridLine.interval)) },
          alpha: { value: gridLine.alpha },
          time: { value: 0 }
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 color;
          uniform float alpha;
          uniform float time;
          varying vec2 vUv;
          
          void main() {
            // Pulsing effect
            float pulse = 0.8 + 0.2 * sin(time * 0.001);
            
            // Edge glow effect
            float edge = 1.0 - abs(2.0 * vUv.y - 1.0);
            edge = pow(edge, 2.0) * pulse;
            
            gl_FragColor = vec4(color, alpha * edge);
          }
        `,
        transparent: true
      });
      
      // Manually set shader material properties to avoid TypeScript errors
      (ringMaterial as any).side = THREE.DoubleSide;
      (ringMaterial as any).depthWrite = false;
      (ringMaterial as any).blending = THREE.AdditiveBlending;
      
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = Math.PI / 2; // Lay flat on XZ plane
      ring.position.y = -0.1; // Slightly below task plane
      group.add(ring);
      
      // Add grid line label
      if (gridLine.alpha > 0.4) {
        createTimeLabel(gridLine, scene);
      }
      
      // Add particle effects along the grid line
      addGridLineParticles(group, gridLine);
      
      // Add animation for the grid line
      const animationIndex = animationCallbacks.push((time: number) => {
        if (ring && ringMaterial.uniforms) {
          ringMaterial.uniforms.time.value = time;
          
          // Subtle rotation for the grid line
          ring.rotation.z = time * 0.0001 * (1 / (gridLine.timeMs + 1000));
        }
      }) - 1;
      
      // Store the animation index with the group for cleanup
      (group as any).animationIndex = animationIndex;
      
      // Add to scene and track
      scene.add(group);
      trackableObjects.gridLines.set(group.name || "", group);
    };
    
    // Create text label for a time interval
    const createTimeLabel = (gridLine: GridLine, scene: THREE.Scene) => {
      // Create a HTML-based label since we don't need a 3D text geometry
      // This will be more readable and perform better
      const labelDiv = document.createElement('div');
      labelDiv.className = 'time-label';
      labelDiv.textContent = gridLine.label;
      labelDiv.style.position = 'absolute';
      labelDiv.style.color = '#' + getTimeIntervalColor(gridLine.interval).toString(16).padStart(6, '0');
      labelDiv.style.fontFamily = 'Orbitron, sans-serif';
      labelDiv.style.fontSize = '12px';
      labelDiv.style.textShadow = '0 0 10px ' + '#' + getTimeIntervalColor(gridLine.interval).toString(16).padStart(6, '0');
      labelDiv.style.padding = '2px 6px';
      labelDiv.style.borderRadius = '12px';
      labelDiv.style.background = 'rgba(0, 0, 0, 0.5)';
      labelDiv.style.zIndex = '100';
      labelDiv.style.transform = 'translate(-50%, -50%)';
      labelDiv.style.display = 'none'; // Initially hidden
      
      // Add to DOM
      if (containerRef.value) {
        containerRef.value.appendChild(labelDiv);
      }
      
      // Create empty Object3D to track position
      const labelObject = new THREE.Object3D();
      if (labelObject) {
        labelObject.name = `label-${gridLine.interval}-${gridLine.timeMs}`;
      }
      
      // Position along positive X axis
      labelObject.position.set(gridLine.radius, 0, 0);
      
      // Add animation to update label position
      const animationIndex = animationCallbacks.push((time: number) => {
        if (!scene || !camera || !renderer || !labelObject || !containerRef.value) return;
        
        // Project 3D position to 2D screen coordinates
        const vector = new THREE.Vector3();
        vector.copy(labelObject.position);
        
        // Extract world position and project
        vector.applyMatrix4(labelObject.matrixWorld);
        vector.project(camera);
        
        // Convert to screen coordinates
        const x = (vector.x * 0.5 + 0.5) * containerRef.value.clientWidth;
        const y = (-(vector.y) * 0.5 + 0.5) * containerRef.value.clientHeight;
        
        // Check if label is in front of camera (avoid labels behind camera)
        if (vector.z < 1) {
          labelDiv.style.display = 'block';
          labelDiv.style.left = x + 'px';
          labelDiv.style.top = y + 'px';
          
          // Pulse opacity with time for added cyberpunk effect
          const pulse = 0.7 + 0.3 * Math.sin(time * 0.001);
          labelDiv.style.opacity = (gridLine.alpha * pulse).toString();
        } else {
          labelDiv.style.display = 'none';
        }
      }) - 1;
      
      // Store for cleanup
      (labelObject as any).labelDiv = labelDiv;
      (labelObject as any).animationIndex = animationIndex;
      
      // Add to scene and track
      scene.add(labelObject);
      trackableObjects.timeLabels.set(labelObject.name || "", labelObject);
    };
    
    // Add particles along grid line for enhanced visual effect
    const addGridLineParticles = (group: THREE.Object3D, gridLine: GridLine) => {
      // Number of particles scales with radius and importance
      const particleCount = Math.floor(gridLine.radius * 5 * gridLine.alpha);
      
      if (particleCount <= 0) return;
      
      const particlesGeometry = new THREE.BufferGeometry();
      const particlePositions = new Float32Array(particleCount * 3);
      
      // Distribute particles around the circle
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const angle = (i / particleCount) * Math.PI * 2;
        
        // Add some randomness to radius for more natural effect
        const radiusVariation = (Math.random() * 0.5 - 0.25) * gridLine.radius * 0.02;
        const particleRadius = gridLine.radius + radiusVariation;
        
        particlePositions[i3] = Math.cos(angle) * particleRadius;
        particlePositions[i3 + 1] = (Math.random() - 0.5) * 0.3; // Slight y variation
        particlePositions[i3 + 2] = Math.sin(angle) * particleRadius;
      }
      
      particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
      
      // Create a shader material for better-looking particles
      const particlesMaterial = new THREE.ShaderMaterial({
        uniforms: {
          color: { value: new THREE.Color(getTimeIntervalColor(gridLine.interval)) },
          alpha: { value: gridLine.alpha * 0.4 },
          time: { value: 0 }
        },
        vertexShader: `
          uniform float time;
          varying float vAlpha;
          
          void main() {
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = 1.2;
            gl_Position = projectionMatrix * mvPosition;
            
            // Animate alpha based on position and time
            float angle = atan(position.z, position.x);
            vAlpha = 0.3 + 0.7 * sin(angle + time * 0.001);
          }
        `,
        fragmentShader: `
          uniform vec3 color;
          uniform float alpha;
          varying float vAlpha;
          
          void main() {
            // Create a circular point
            float r = 0.5;
            vec2 uv = gl_PointCoord - vec2(0.5);
            float d = length(uv);
            
            if (d > r) {
              discard;
            }
            
            // Softer edge at the perimeter
            float edge = 1.0 - smoothstep(r - 0.1, r, d);
            gl_FragColor = vec4(color, alpha * vAlpha * edge);
          }
        `,
        transparent: true
      });
      
      // Manually set shader material properties to avoid TypeScript errors
      (particlesMaterial as any).blending = THREE.AdditiveBlending;
      (particlesMaterial as any).depthWrite = false;
      
      const particles = new THREE.Points(particlesGeometry, particlesMaterial);
      (particles as any).renderOrder = 2; // Ensure particles render on top
      particles.position.y = 0; // Align with grid line plane
      
      // Add animation
      const particleAnimationIndex = animationCallbacks.push((time: number) => {
        if (particles && particlesMaterial.uniforms) {
          particlesMaterial.uniforms.time.value = time;
          
          // Subtle rotation for particles
          particles.rotation.y = time * 0.0002;
        }
      }) - 1;
      
      // Store animation index for cleanup
      (particles as any).animationIndex = particleAnimationIndex;
      
      group.add(particles);
      trackableObjects.particleSystems.push(particles);
    };
    
    // Create time singularity (the "now" point at the center)
    const createTimeSingularity = () => {
      if (!scene) return;
      
      // Remove existing singularity if present
      if (trackableObjects.timeSingularity) {
        scene.remove(trackableObjects.timeSingularity);
        disposeObject(trackableObjects.timeSingularity);
        trackableObjects.timeSingularity = null;
      }
      
      // Create a group for all singularity elements
      const singularityGroup = new THREE.Object3D();
      if (singularityGroup) {
        singularityGroup.name = 'time-singularity';
      }
      
      // Create quantum core geometry
      const coreGeometry = new THREE.SphereGeometry(4, 32, 32);
      
      // Create custom shader material with quantum singularity effect
      const coreMaterial = new THREE.ShaderMaterial({
        uniforms: {
          colorCore: { value: new THREE.Color(0x00AAFF) }, // Blue core
          colorEdge: { value: new THREE.Color(0xFF00AA) }, // Pink edge
          time: { value: 0.0 },
          intensity: { value: 1.0 }
        },
        vertexShader: `
          varying vec3 vNormal;
          varying vec2 vUv;
          varying float vDisplacement;
          
          uniform float time;
          
          void main() {
            vUv = uv;
            vNormal = normalize(normalMatrix * normal);
            
            // Create quantum "ripples" on the surface
            float displacement = sin(position.x * 5.0 + time * 0.005) * 
                               sin(position.y * 5.0 + time * 0.004) * 
                               sin(position.z * 5.0 + time * 0.003);
            displacement *= 0.15;
            vDisplacement = displacement;
            
            vec3 newPosition = position + normal * displacement;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 colorCore;
          uniform vec3 colorEdge;
          uniform float time;
          uniform float intensity;
          
          varying vec3 vNormal;
          varying vec2 vUv;
          varying float vDisplacement;
          
          void main() {
            // Calculate electric field-like effect
            float pulse = 0.8 + 0.2 * sin(time * 0.002);
            
            // Mix colors based on normal and time
            float fresnel = 0.8 - dot(vNormal, vec3(0, 0, 1));
            fresnel = pow(fresnel, 2.0) * pulse;
            
            // Create quantum effect based on displacement
            float quantumEffect = pow(0.5 + 0.5 * sin(vDisplacement * 40.0 + time * 0.01), 3.0);
            
            // Final color
            vec3 finalColor = mix(colorCore, colorEdge, fresnel * pulse + quantumEffect);
            
            // Glow effect
            float edgeGlow = pow(fresnel, 1.5);
            
            gl_FragColor = vec4(finalColor, 0.85 + edgeGlow * 0.15);
          }
        `,
        transparent: true
      });
      
      // Create sphere and add to group
      const core = new THREE.Mesh(coreGeometry, coreMaterial);
      singularityGroup.add(core);
      
      // Create surrounding quantum field effect (particles)
      const particleCount = 500;
      const fieldGeometry = new THREE.BufferGeometry();
      const particlePositions = new Float32Array(particleCount * 3);
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Create a field around the singularity with higher density near center
        const radius = 3 + Math.pow(Math.random(), 2) * 6;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        particlePositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        particlePositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        particlePositions[i3 + 2] = radius * Math.cos(phi);
      }
      
      fieldGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
      
      // Create shader material for quantum field
      const fieldMaterial = new THREE.ShaderMaterial({
        uniforms: {
          color: { value: new THREE.Color(0x00AAFF) },
          time: { value: 0 }
        },
        vertexShader: `
          uniform float time;
          varying float vAlpha;
          
          void main() {
            // Add animated displacement
            vec3 displaced = position;
            float angle = atan(position.z, position.x);
            float dist = length(position);
            float offset = sin(dist * 5.0 - time * 0.005) * 0.2;
            
            // Quantum "jitter" effect
            displaced.x += cos(angle) * offset * dist * 0.05;
            displaced.y += sin(time * 0.01 + dist) * offset * dist * 0.05;
            displaced.z += sin(angle) * offset * dist * 0.05;
            
            vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
            gl_PointSize = 1.5;
            gl_Position = projectionMatrix * mvPosition;
            
            // Dynamic alpha based on distance and time
            vAlpha = 0.8 - length(position) / 10.0;
            vAlpha *= 0.5 + 0.5 * sin(angle * 3.0 + time * 0.002);
          }
        `,
        fragmentShader: `
          uniform vec3 color;
          uniform float time;
          varying float vAlpha;
          
          void main() {
            // Soft circular points
            float r = 0.5;
            vec2 uv = gl_PointCoord - vec2(0.5);
            float d = length(uv);
            
            if (d > r) {
              discard;
            }
            
            // Glow effect
            float intensity = 1.0 - smoothstep(0.0, r, d);
            intensity = pow(intensity, 1.2);
            
            gl_FragColor = vec4(color, vAlpha * intensity);
          }
        `,
        transparent: true
      });
      
      // Manually set shader material properties to avoid TypeScript errors
      (fieldMaterial as any).blending = THREE.AdditiveBlending;
      (fieldMaterial as any).depthWrite = false;
      
      const fieldParticles = new THREE.Points(fieldGeometry, fieldMaterial);
      singularityGroup.add(fieldParticles);
      
      // Add animation for the quantum singularity
      const singularityAnimationIndex = animationCallbacks.push((time: number) => {
        if (core && coreMaterial.uniforms) {
          coreMaterial.uniforms.time.value = time;
          
          // Add subtle pulsing effect
          const pulse = 1.0 + Math.sin(time * 0.002) * 0.1;
          core.scale.set(pulse, pulse, pulse);
        }
        
        if (fieldParticles && fieldMaterial.uniforms) {
          fieldMaterial.uniforms.time.value = time;
          
          // Add rotation to field
          fieldParticles.rotation.y = time * 0.0005;
          fieldParticles.rotation.z = time * 0.0003;
        }
      }) - 1;
      
      // Store animation index for cleanup
      (singularityGroup as any).animationIndex = singularityAnimationIndex;
      
      // Add to scene and track
      scene.add(singularityGroup);
      trackableObjects.timeSingularity = singularityGroup;
    };
    
    // Create star field as background
    const createStarField = () => {
      if (!scene) return;
      
      // Remove existing star field if present
      if (trackableObjects.starField) {
        scene.remove(trackableObjects.starField);
        disposeObject(trackableObjects.starField);
        trackableObjects.starField = null;
      }
      
      const starCount = settingsStore.isPerformanceMode ? 1000 : 3000;
      
      // Create star geometry
      const starsGeometry = new THREE.BufferGeometry();
      const starPositions = new Float32Array(starCount * 3);
      const starColors = new Float32Array(starCount * 3);
      
      // Define star colors
      const colorPalette = [
        new THREE.Color(0xFFFFFF), // White
        new THREE.Color(0xAAFFFF), // Light blue
        new THREE.Color(0xFFAAFF), // Light pink
        new THREE.Color(0xAAFFAA)  // Light green
      ];
      
      for (let i = 0; i < starCount; i++) {
        const i3 = i * 3;
        
        // Position stars in a large sphere around the center
        const radius = 300;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        starPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        starPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        starPositions[i3 + 2] = radius * Math.cos(phi);
        
        // Assign a random color from the palette
        const colorIndex = Math.floor(Math.random() * colorPalette.length);
        const color = colorPalette[colorIndex];
        starColors[i3] = color.r;
        starColors[i3 + 1] = color.g;
        starColors[i3 + 2] = color.b;
      }
      
      starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
      starsGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
      
      // Create shader material for stars
      const starsMaterial = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 }
        },
        vertexShader: `
          attribute vec3 color;
          uniform float time;
          varying vec3 vColor;
          varying float vAlpha;
          
          void main() {
            vColor = color;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = 2.0;
            gl_Position = projectionMatrix * mvPosition;
            
            // Create time-based twinkling
            float twinkle = sin(time * 0.001 + mvPosition.x * 10.0 + mvPosition.y * 8.0 + mvPosition.z * 6.0);
            vAlpha = 0.5 + 0.5 * twinkle;
          }
        `,
        fragmentShader: `
          varying vec3 vColor;
          varying float vAlpha;
          
          void main() {
            // Create soft circular points
            float r = 0.5;
            vec2 uv = gl_PointCoord - vec2(0.5);
            float d = length(uv);
            
            if (d > r) {
              discard;
            }
            
            // Add glow
            float intensity = 1.0 - smoothstep(0.0, r, d);
            intensity = pow(intensity, 1.2);
            
            gl_FragColor = vec4(vColor, vAlpha * intensity);
          }
        `,
        transparent: true
      });
      
      // Manually set shader material properties to avoid TypeScript errors
      (starsMaterial as any).blending = THREE.AdditiveBlending;
      (starsMaterial as any).depthWrite = false;
      
      const stars = new THREE.Points(starsGeometry, starsMaterial);
      stars.renderOrder = -1; // Ensure stars are in background
      
      // Add animation for twinkling stars
      const starsAnimationIndex = animationCallbacks.push((time: number) => {
        if (stars && starsMaterial.uniforms) {
          starsMaterial.uniforms.time.value = time;
          
          // Subtle rotation effect for immersion
          stars.rotation.y = time * 0.00002;
          stars.rotation.z = time * 0.00001;
        }
      }) - 1;
      
      // Store animation index for cleanup
      (stars as any).animationIndex = starsAnimationIndex;
      
      // Add to scene and track
      scene.add(stars);
      trackableObjects.starField = stars;
    };
    
    // Transition between time scales with smooth animation
    const transitionTimeScale = (newScale: number) => {
      if (!scene || timeWarpInProgress.value) return;
      
      timeWarpInProgress.value = true;
      const prevScale = previousTimeScale.value;
      previousTimeScale.value = newScale;
      
      // Define transition parameters
      const startTime = performance.now();
      const duration = 2000; // 2 seconds for transition
      
      // Store animation functions to cancel
      const transitionAnimation = () => {
        const currentTime = performance.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease in-out transition
        const easeProgress = progress < 0.5 
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        
        // Get transitional scale values
        const transitionalScale = getTimeScaleTransition(prevScale, newScale, easeProgress);
        
        // Update grid lines based on transitional scale
        createGridLines(transitionalScale);
        
        if (progress < 1) {
          requestAnimationFrame(transitionAnimation);
        } else {
          // Complete transition
          createGridLines(newScale);
          timeWarpInProgress.value = false;
          
          // Notify parent component
          emit('time-warp-complete', newScale);
        }
      };
      
      // Start transition animation
      transitionAnimation();
    };
    
    // Expose API for parent component to use
    const api = {
      // Add a 3D object to the scene
      addObject: (object: THREE.Object3D) => {
        if (!scene) return;
        scene.add(object);
      },
      
      // Remove a 3D object from the scene
      removeObject: (object: THREE.Object3D) => {
        if (!scene) return;
        scene.remove(object);
      },
      
      // Get scene instance
      getScene: () => scene,
      
      // Get camera instance
      getCamera: () => camera,
      
      // Get renderer instance
      getRenderer: () => renderer,
      
      // Register animation callback
      addAnimationCallback: (callback: (time: number) => void) => {
        return animationCallbacks.push(callback) - 1;
      },
      
      // Remove animation callback
      removeAnimationCallback: (index: number) => {
        if (index >= 0 && index < animationCallbacks.length) {
          animationCallbacks[index] = () => {}; // Replace with no-op
        }
      }
    };
    
    // Initialize on mount
    onMounted(() => {
      initScene();
    });
    
    // Clean up on unmount
    onUnmounted(() => {
      // Cancel animation frame
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      
      // Remove resize listener
      if (resizeHandler) {
        window.removeEventListener('resize', resizeHandler);
      }
      
      // Clean up Three.js objects
      if (scene) {
        // Remove all tracked objects
        trackableObjects.gridLines.forEach((group) => {
          scene.remove(group);
          disposeObject(group);
        });
        
        trackableObjects.timeLabels.forEach((label) => {
          if (containerRef.value && (label as any).labelDiv) {
            containerRef.value.removeChild((label as any).labelDiv);
          }
          scene.remove(label);
          disposeObject(label);
        });
        
        if (trackableObjects.timeSingularity) {
          scene.remove(trackableObjects.timeSingularity);
          disposeObject(trackableObjects.timeSingularity);
        }
        
        if (trackableObjects.starField) {
          scene.remove(trackableObjects.starField);
          disposeObject(trackableObjects.starField);
        }
        
        // Clear tracking maps
        trackableObjects.gridLines.clear();
        trackableObjects.timeLabels.clear();
        trackableObjects.timeSingularity = null;
        trackableObjects.starField = null;
        trackableObjects.particleSystems = [];
      }
      
      // Dispose renderer
      if (renderer) {
        if (containerRef.value && renderer.domElement.parentNode === containerRef.value) {
          containerRef.value.removeChild(renderer.domElement);
        }
        renderer.dispose();
      }
      
      // Clear reference
      scene = null;
      camera = null;
      renderer = null;
      controls = null;
      animationFrameId = null;
      resizeHandler = null;
    });
    
    // Watch for prop changes
    watch(() => props.backgroundColor, (newColor) => {
      if (scene) {
        scene.background = new THREE.Color(newColor || sceneBackgroundColor.value);
      }
    });
    
    watch(() => props.timeScale, (newScale) => {
      if (newScale !== previousTimeScale.value) {
        transitionTimeScale(newScale);
      }
    });
    
    return {
      containerRef,
      isWebGLSupported,
      timeWarpInProgress,
      ...api
    };
  }
});
</script>

<style scoped lang="scss">
.space-renderer {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  
  &.webgl-error {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.8);
  }
  
  .webgl-error-message {
    text-align: center;
    max-width: 400px;
    padding: 20px;
    color: #FF3366;
    background: rgba(20, 20, 40, 0.8);
    border: 1px solid #FF3366;
    border-radius: 4px;
    box-shadow: 0 0 20px rgba(255, 51, 102, 0.5);
    
    h3 {
      margin-top: 0;
      font-family: 'Orbitron', sans-serif;
      text-transform: uppercase;
    }
    
    p {
      margin-bottom: 0;
      line-height: 1.5;
    }
  }
}
</style>

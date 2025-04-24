/**
 * TypeScript declarations for Three.js modules
 */

// Allow importing threejs submodules
declare module 'three/examples/jsm/controls/OrbitControls' {
  import { Camera, Renderer } from 'three';
  
  export class OrbitControls {
    constructor(camera: Camera, domElement?: HTMLElement);
    update(): void;
    enableDamping: boolean;
    dampingFactor: number;
    rotateSpeed: number;
    maxDistance: number;
    minDistance: number;
    minPolarAngle: number;
    maxPolarAngle: number;
  }
}

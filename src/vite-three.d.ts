/**
 * TypeScript declarations for Three.js modules
 */

// Allow importing three module with basic types we use
declare module 'three' {
  export class Object3D {
    position: Vector3;
    rotation: Euler;
    scale: Vector3;
    userData: any;
    children: Object3D[];
    add(object: Object3D): this;
    remove(object: Object3D): this;
    traverse(callback: (object: Object3D) => void): void;
    constructor();
  }
  
  export class Scene extends Object3D {
    background: Color | null;
  }
  
  export class Vector3 {
    x: number;
    y: number;
    z: number;
    constructor(x?: number, y?: number, z?: number);
    set(x: number, y: number, z: number): this;
    clone(): Vector3;
    copy(v: Vector3): this;
    add(v: Vector3): this;
    addVectors(a: Vector3, b: Vector3): this;
    subVectors(a: Vector3, b: Vector3): this;
    sub(v: Vector3): this;
    multiply(v: Vector3): this;
    multiplyScalar(s: number): this;
    divide(v: Vector3): this;
    divideScalar(s: number): this;
    lerpVectors(a: Vector3, b: Vector3, t: number): this;
    lerp(v: Vector3, t: number): this;
    normalize(): this;
    length(): number;
    lengthSq(): number;
    distanceTo(v: Vector3): number;
    cross(v: Vector3): this;
    dot(v: Vector3): number;
  }
  
  export class Euler {
    x: number;
    y: number;
    z: number;
  }
  
  export class Plane {
    constructor(normal?: Vector3, constant?: number);
    normal: Vector3;
    constant: number;
  }
  
  export class Color {
    constructor(color?: number | string);
  }
  
  export class Camera extends Object3D {
    aspect: number;
    updateProjectionMatrix(): void;
    lookAt(x: number, y: number, z: number): void;
  }
  
  export class PerspectiveCamera extends Camera {
    constructor(fov: number, aspect: number, near: number, far: number);
  }
  
  export class Material {
    dispose(): void;
    transparent: boolean;
    opacity: number;
    emissive?: Color;
    emissiveIntensity?: number;
    side?: Side;
    alphaTest?: number;
  }
  
  export class MeshStandardMaterial extends Material {
    color: Color;
    emissive: Color;
    emissiveIntensity: number;
    metalness: number;
    roughness: number;
    flatShading: boolean;
    constructor(parameters?: {
      color?: number | string;
      emissive?: number | string;
      emissiveIntensity?: number;
      metalness?: number;
      roughness?: number;
      transparent?: boolean;
      opacity?: number;
      side?: Side;
      flatShading?: boolean;
    });
  }
  
  export class MeshBasicMaterial extends Material {
    constructor(parameters?: { 
      color?: number | string; 
      transparent?: boolean; 
      opacity?: number; 
      side?: Side;
      alphaTest?: number;
    });
    color: Color;
    side: Side;
    alphaTest: number;
    clippingPlanes?: Plane[];
  }
  
  export class PointsMaterial extends Material {
    constructor(parameters?: { 
      size?: number; 
      color?: number | string; 
      transparent?: boolean; 
      opacity?: number; 
      blending?: Blending;
      sizeAttenuation?: boolean;
      vertexColors?: boolean;
    });
    size: number;
    color: Color;
    blending: Blending;
    sizeAttenuation: boolean;
    vertexColors: boolean;
  }
  
  export class ShaderMaterial extends Material {
    constructor(parameters?: { 
      uniforms?: { [uniform: string]: { value: any } }; 
      vertexShader?: string; 
      fragmentShader?: string; 
      transparent?: boolean;
      side?: Side;
      blending?: Blending;
      depthWrite?: boolean;
    });
    uniforms: { [uniform: string]: { value: any } };
    side: Side;
    depthWrite: boolean;
  }
  
  export class BufferGeometry {
    constructor();
    dispose(): void;
    setAttribute(name: string, attribute: BufferAttribute): BufferGeometry;
    attributes: { [key: string]: BufferAttribute };
  }
  
  export class BufferAttribute {
    constructor(array: Float32Array, itemSize: number);
    array: Float32Array;
    needsUpdate: boolean;
  }
  
  export class Points extends Object3D {
    geometry: BufferGeometry;
    material: Material;
  }
  
  export class Mesh extends Object3D {
    geometry: BufferGeometry;
    material: Material | Material[];
    scale: Vector3;
    rotation: Euler;
    userData: any;
  }
  
  export class WebGLRenderer {
    constructor(parameters?: { antialias?: boolean; alpha?: boolean; powerPreference?: string });
    setSize(width: number, height: number): void;
    setPixelRatio(ratio: number): void;
    render(scene: Scene, camera: Camera): void;
    dispose(): void;
    domElement: HTMLCanvasElement;
  }
  
  export class Raycaster {
    constructor();
    setFromCamera(coords: Vector2, camera: Camera): void;
    intersectObject(object: Object3D): Array<{ distance: number; point: Vector3; object: Object3D }>;
    intersectObjects(objects: Object3D[], recursive?: boolean): Array<{ distance: number; point: Vector3; object: Object3D }>;
  }
  
  export class Vector2 {
    constructor(x?: number, y?: number);
    x: number;
    y: number;
  }
  
  export class GridHelper extends Object3D {
    constructor(size: number, divisions: number, colorCenterLine?: number, colorGrid?: number);
    position: Vector3;
    rotation: Euler;
  }
  
  export class RingGeometry extends BufferGeometry {
    constructor(innerRadius: number, outerRadius: number, thetaSegments?: number, phiSegments?: number, thetaStart?: number, thetaLength?: number);
  }
  
  export class PlaneGeometry extends BufferGeometry {
    constructor(width?: number, height?: number, widthSegments?: number, heightSegments?: number);
  }
  
  export class SphereGeometry extends BufferGeometry {
    constructor(radius?: number, widthSegments?: number, heightSegments?: number);
  }
  
  export class IcosahedronGeometry extends BufferGeometry {
    constructor(radius?: number, detail?: number);
  }
  
  export class DodecahedronGeometry extends BufferGeometry {
    constructor(radius?: number, detail?: number);
  }
  
  export class TetrahedronGeometry extends BufferGeometry {
    constructor(radius?: number, detail?: number);
  }
  
  export class OctahedronGeometry extends BufferGeometry {
    constructor(radius?: number, detail?: number);
  }
  
  export class AmbientLight extends Object3D {
    constructor(color?: number | string, intensity?: number);
  }
  
  export class DirectionalLight extends Object3D {
    constructor(color?: number | string, intensity?: number);
  }
  
  // Three.js constants/enums
  export const DoubleSide: Side;
  export const FrontSide: Side;
  export const BackSide: Side;
  
  export const AdditiveBlending: Blending;
  export const NormalBlending: Blending;
  export const SubtractiveBlending: Blending;
  export const MultiplyBlending: Blending;
  
  export enum Side {
    DoubleSide,
    FrontSide,
    BackSide
  }
  
  export enum Blending {
    AdditiveBlending,
    NormalBlending,
    SubtractiveBlending,
    MultiplyBlending
  }
}

// Allow importing threejs submodules
declare module 'three/examples/jsm/controls/OrbitControls' {
  import { Camera, WebGLRenderer, Vector3 } from 'three';
  
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
    autoRotate: boolean;
    autoRotateSpeed: number;
    target: Vector3;
  }
}

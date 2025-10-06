import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import type { GLTF } from "three/addons/loaders/GLTFLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export class TreeModel {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private animateModel!: THREE.Group | null;
  private loadingManager!: THREE.LoadingManager;
  private targetScrollRotationY = 0;
  private currentScrollRotationY = 0;
  private idleRotationY = 0;
  private scrollLerp = 0.08;

  constructor() {
    this.scene = new THREE.Scene();
    this.setupLoadingManager();
    this.setupRenderer();
    this.setupEnvironment();
    this.setupCamera();
    this.setupLights();
    this.setupControls();
    this.setupEventListeners();
    this.onScroll();
    this.loadModel();
    this.animate();
  }

  private setupLoadingManager(): void {
    this.loadingManager = new THREE.LoadingManager(
      () => {
        console.log("All assets loaded");
        const progressBar = document.getElementById("progress-bar")!;
        progressBar.style.width = "100%";
        setTimeout(() => {
          document.getElementById("loading-screen")!.style.display = "none";
          progressBar.style.visibility = "hidden";
        }, 500);
      },
      (url, itemsLoaded, itemsTotal) => {
        const progress = (itemsLoaded / itemsTotal) * 100;
        console.log(`Loading file: ${url} (${progress.toFixed(2)}%)`);
        const progressBar = document.getElementById("progress-bar")!;
        progressBar.style.visibility = "visible";
        progressBar.style.width = `${progress}%`;
      },
      (url) => {
        console.error(`There was an error loading ${url}`);
        document.getElementById("loading-screen")!.style.display = "none";
      },
    );
  }

  private setupRenderer(): void {
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
      canvas: document.querySelector("#webgl")!,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    // Color management for glTF PBR
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
  }

  private setupEnvironment(): void {
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environment = envTexture;
  }

  private setupCamera(): void {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    this.camera.position.set(0.5, 0.25, 2.5);
  }

  private setupLights(): void {
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
    this.scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x777777, 1.4);
    hemiLight.position.set(0, 1, 0);
    this.scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(3, 4, 5);
    this.scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.7);
    fillLight.position.set(-3, 2, -4);
    this.scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.8);
    rimLight.position.set(0, -1, 3);
    this.scene.add(rimLight);
  }

  private setupControls(): void {
    const domElement = document.querySelector<HTMLCanvasElement>("#webgl")!;
    domElement.style.pointerEvents = "auto";

    this.controls = new OrbitControls(this.camera, domElement);
    this.controls.enableDamping = true;
    this.controls.enablePan = false;
    this.controls.minDistance = 1.5;
    this.controls.maxDistance = 5;
    this.controls.minPolarAngle = 0;
    this.controls.maxPolarAngle = Math.PI;
    this.controls.enableZoom = false;
    this.controls.update();
  }

  private setupEventListeners(): void {
    window.addEventListener("resize", () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

    window.addEventListener("scroll", this.onScroll, { passive: true });
  }

  private onScroll = (): void => {
    const maxScroll = Math.max(
      document.body.scrollHeight - window.innerHeight,
      1,
    );
    const progress = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
    const rotations = 2.5; // full rotations across the page
    this.targetScrollRotationY = progress * rotations * Math.PI * 2;
  };

  private loadModel(): void {
    const gltfLoader = new GLTFLoader(this.loadingManager).setPath(
      "/assets/models/heart/",
    );

    gltfLoader.load("scene.gltf", (gltf: GLTF) => {
      const model = gltf.scene;
      const modelGroup = new THREE.Group();
      this.scene.add(modelGroup);

      modelGroup.add(model);

      // Ensure world matrices are current before measuring
      model.updateWorldMatrix(true, true);
      modelGroup.updateWorldMatrix(true, true);

      // Center model at the origin by shifting the model, not the group
      const box = new THREE.Box3().setFromObject(modelGroup);
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);

      // Recompute size after centering and scale the group to fit view
      model.updateWorldMatrix(true, true);
      modelGroup.updateWorldMatrix(true, true);
      const sizedBox = new THREE.Box3().setFromObject(modelGroup);
      const size = sizedBox.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      const fitSize = 1.5; // desired max dimension in world units
      const scale = fitSize / maxDim;
      modelGroup.scale.setScalar(scale);

      // Make materials highly reflective
      model.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.isMesh) {
          const material = mesh.material;
          const setProps = (mat: THREE.Material) => {
            if (mat instanceof THREE.MeshStandardMaterial) {
              mat.metalness = 0.2;
              mat.roughness = 0.7;
              mat.envMapIntensity = 0.6;
              mat.needsUpdate = true;
            }
          };
          if (Array.isArray(material)) {
            material.forEach((m) => setProps(m));
          } else if (material) {
            setProps(material);
          }
        }
      });

      // Frame camera to ensure the model is visible
      const fov = (this.camera.fov * Math.PI) / 180;
      const distance = fitSize / 2 / Math.tan(fov / 2) + 0.5;
      this.camera.position.set(0.5, 0.25, distance);
      this.camera.updateProjectionMatrix();

      this.controls.target.set(0, 0, 0);
      this.controls.update();
      this.animateModel = modelGroup;
    });
  }

  private animate = (): void => {
    requestAnimationFrame(this.animate);

    if (this.animateModel) {
      // Smoothly ease toward scroll-driven orbit angle
      this.currentScrollRotationY +=
        (this.targetScrollRotationY - this.currentScrollRotationY) *
        this.scrollLerp;

      // Subtle idle spin so it never feels static
      this.idleRotationY += 0.00076;

      const yRotation = this.currentScrollRotationY + this.idleRotationY;
      this.animateModel.rotation.y = yRotation;

      // Gentle vertical bob for extra life
      this.animateModel.position.y = Math.sin(yRotation * 0.6) * 0.025;
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };
}

new TreeModel();

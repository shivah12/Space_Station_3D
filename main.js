import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000); // Background set to black
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.getElementById('hero-3d-model').appendChild(renderer.domElement);

// Scene setup
const scene = new THREE.Scene();

// Camera setup
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.set(4, 5, 11);

// OrbitControls setup
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 5;
controls.maxDistance = 20;
controls.minPolarAngle = 0.5;
controls.maxPolarAngle = 1.5;
controls.autoRotate = false;
controls.target = new THREE.Vector3(0, 1, 0);
controls.update();

// Lighting setup
const ambientLight = new THREE.AmbientLight(0x404040, 0.4); // Soft ambient light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6); // Main directional light
directionalLight.position.set(5, 10, 7.5);
directionalLight.castShadow = true;
scene.add(directionalLight);

const backLight = new THREE.PointLight(0xffffff, 1.0); // Strong back light for rim lighting effect
backLight.position.set(-10, 10, 10);
scene.add(backLight);

const topLight = new THREE.DirectionalLight(0xffffff, 0.8); // Top light for overhead illumination
topLight.position.set(0, 10, 0); // Positioned above the model
topLight.target.position.set(0, 1.05, -1); // Target the center of the model
topLight.castShadow = true;
scene.add(topLight);
scene.add(topLight.target);

const pointLight = new THREE.PointLight(0xffffff, 0.3); // Low-intensity point light for subtle effect
pointLight.position.set(2, 5, 3);
scene.add(pointLight);

let mixer; // Animation mixer
const clock = new THREE.Clock(); // Clock for animation

// GLTFLoader setup
const loader = new GLTFLoader().setPath('public/space_station_3/');
loader.load('scene.gltf', (gltf) => {
  const mesh = gltf.scene;

  // Create a deep blue material with some shininess
  const deepBlueMaterial = new THREE.MeshStandardMaterial({
    color: 0x00008B, // Deep blue
    metalness: 0.8,
    roughness: 0.3,
  });

  // Iterate over all child meshes
  mesh.traverse((child) => {
    if (child.isMesh) {
      const currentColorHex = child.material.color.getHex(); // Get color as hex
      const targetColorHex = 0x8B4513; // Assuming this is the brown/red color you want to replace

      // Replace the material if the color matches
      if (currentColorHex === targetColorHex) {
        child.material = deepBlueMaterial;
      }
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  mesh.position.set(0, 1.05, -1);
  scene.add(mesh);

  // Animation setup
  if (gltf.animations && gltf.animations.length) {
    mixer = new THREE.AnimationMixer(mesh);
    gltf.animations.forEach((clip) => {
      mixer.clipAction(clip).play();
    });
  }

  document.getElementById('progress-container').style.display = 'none';
}, (xhr) => {
  console.log(`Loading ${Math.round(xhr.loaded / xhr.total * 100)}%`);
}, (error) => {
  console.error('Error loading model:', error);
});

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Handle scroll transition
window.addEventListener('scroll', () => {
  const heroSection = document.getElementById('hero');
  const aboutSection = document.getElementById('about');
  const scrollY = window.scrollY;
  const heroHeight = heroSection.clientHeight;
  const aboutOffsetTop = aboutSection.offsetTop;
  
  // Calculate transition based on scroll position
  if (scrollY > heroHeight) {
    const progress = Math.min((scrollY - heroHeight) / (aboutOffsetTop - heroHeight), 1);
    document.getElementById('hero-3d-model').style.transform = `translateY(${progress * 100}px)`;
  } else {
    document.getElementById('hero-3d-model').style.transform = 'translateY(0)';
  }
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Update the mixer on each frame
  if (mixer) {
    mixer.update(clock.getDelta());
  }

  controls.update();
  renderer.render(scene, camera);
}

animate();

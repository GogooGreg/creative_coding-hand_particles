/******************************
* RESPONSIVE WARNING BEHAVIOR *
******************************/

const responsiveWarning = document.getElementById("responsive-warning");
// Enable/disable responsive warning.
const responsiveDesign = true;
// Mobile width limit.
const threshold = 768;

// Show or hide modal based on screen size.
function checkResponsiveState() {
  const small = window.innerWidth <= threshold;

  if (!responsiveDesign && small) {
    if (!responsiveWarning.open) {
      responsiveWarning.showModal();
      document.body.classList.add("overflow-hidden");
    }
  } else {
    if (responsiveWarning.open) {
      responsiveWarning.close();
      document.body.classList.remove("overflow-hidden");
    }
  }
}

// Initial check.
checkResponsiveState();

// Real-time resize detection.
window.addEventListener("resize", checkResponsiveState);


/***************************
* THREE.JS PARTICLE SPHERE *
***************************/

const threeCanvas = document.getElementById("three-canvas");
const scene = new THREE.Scene();

// Perspective camera for 3D rendering.
const camera3D = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  2000
);

camera3D.position.z = 500;

// WebGL renderer with transparent background.
const renderer = new THREE.WebGLRenderer({
  canvas: threeCanvas,
  alpha: true,
  antialias: true
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0);

const particleCount = 5000;
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
const sphereRadius = 150;

// Generate evenly distributed particles on a sphere surface.
for (let particleIndex = 0; particleIndex < particleCount; particleIndex++) {
  const positionIndex = particleIndex * 3;
  const distribution = particleIndex / particleCount;

  const polarAngle = Math.acos(1 - 2 * distribution);
  const azimuthAngle = Math.sqrt(particleCount * Math.PI) * polarAngle;

  positions[positionIndex] = sphereRadius * Math.cos(azimuthAngle) * Math.sin(polarAngle);

  positions[positionIndex + 1] = sphereRadius * Math.sin(azimuthAngle) * Math.sin(polarAngle);

  positions[positionIndex + 2] = sphereRadius * Math.cos(polarAngle);
}

geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

// Material used to render particle points.
const material = new THREE.PointsMaterial({
  size: 3,
  color: 0x000000,
  transparent: true,
  opacity: 1,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});

// Create particle system.
const particles = new THREE.Points(geometry, material);
scene.add(particles);

// Detect if black theme is active.
function isBlackThemeActive() {
  const toggle = document.querySelector('input.theme-controller[value="black"]');

  return toggle ? toggle.checked : false;
}

// Update particle color based on active theme.
function updateParticlesColor() {
  if (isBlackThemeActive()) {
    material.color.setHex(0xffffff);
  } else {
    material.color.setHex(0x000000);
  }
}

// Initial color sync
updateParticlesColor();

// Listen to theme changes
const themeToggle = document.querySelector('input.theme-controller[value="black"]');

if (themeToggle) {
  themeToggle.addEventListener("change", () => {
    updateParticlesColor();
  });
}

// Main Three.js render loop.
function animateThree() {
  requestAnimationFrame(animateThree);
  renderer.render(scene, camera3D);
}

animateThree();

// Handle viewport resizing.
window.addEventListener("resize", () => {
  camera3D.aspect = window.innerWidth / window.innerHeight;
  camera3D.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});


/*****************
* HANDS TRACKING *
*****************/

const cameraContainer = document.getElementById("camera-container");
const video = cameraContainer.querySelector("video");
const canvas = cameraContainer.querySelector("canvas");
const context = canvas.getContext("2d");

// Mediapipe hands initialization.
const hands = new Hands({ locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` });

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

hands.onResults(onResults);

// Camera initialization and frame loop.
const camera = new Camera(video, {
  onFrame: async () => {
    await hands.send({ image: video });
  },
  width: 640,
  height: 480
});

camera.start();

// Handle MediaPipe results for each processed frame.
function onResults(results) {
  if (!video.videoWidth || !video.videoHeight) {
    return;
  }

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  // Clear canvas before drawing new frame.
  context.clearRect(0, 0, canvas.width, canvas.height);

  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    const landmarks = results.multiHandLandmarks[0];

    // Mirror landmarks horizontally to match mirrored video.
    const mirroredLandmarks = landmarks.map(point => ({
      x: 1 - point.x,
      y: point.y,
      z: point.z
    }));

    // Draw hand connections (bones).
    drawConnectors(context, mirroredLandmarks, HAND_CONNECTIONS, {
      color: "#000000ff",
      lineWidth: 3
    });

    // Draw hand landmarks (joints).
    drawLandmarks(context, mirroredLandmarks, {
      color: "#ffffffff",
      radius: 3
    });
  }
}

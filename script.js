/******************************
* RESPONSIVE WARNING BEHAVIOR *
******************************/

const responsiveWarning = document.getElementById("responsive-warning");
// Enable/disable responsive warning.
const responsiveDesign = false;
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
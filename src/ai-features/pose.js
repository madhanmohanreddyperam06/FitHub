import * as poseDetection from 'https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';

let detector, webcam, canvas, ctx;
let repCount = 0;
let isDown = false;

// Adjacent keypoint pairs for drawing skeleton limbs
const skeletonPairs = [
  ['left_shoulder', 'right_shoulder'],
  ['left_shoulder', 'left_elbow'],
  ['left_elbow', 'left_wrist'],
  ['right_shoulder', 'right_elbow'],
  ['right_elbow', 'right_wrist'],
  ['left_shoulder', 'left_hip'],
  ['right_shoulder', 'right_hip'],
  ['left_hip', 'right_hip'],
  ['left_hip', 'left_knee'],
  ['left_knee', 'left_ankle'],
  ['right_hip', 'right_knee'],
  ['right_knee', 'right_ankle']
];

async function setupWebcam() {
  webcam = document.getElementById('webcam');
  const camStatus = document.getElementById('camStatus');
  
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480 },
      audio: false
    });
    webcam.srcObject = stream;
    return new Promise((resolve) => {
      webcam.onloadedmetadata = () => {
        if (camStatus) camStatus.innerText = "AI Camera Active";
        resolve(webcam);
      };
    });
  } catch (err) {
    if (camStatus) camStatus.innerText = "Camera Access Denied";
    console.error("Camera access error:", err);
  }
}

async function initPoseDetection() {
  canvas = document.getElementById('pose-canvas');
  if (canvas) ctx = canvas.getContext('2d');

  await setupWebcam();

  const model = poseDetection.SupportedModels.MoveNet;
  detector = await poseDetection.createDetector(model, { modelType: 'Lightning' });

  startDetection();
}

async function startDetection() {
  if (!detector || !webcam) return;
  
  try {
    const poses = await detector.estimatePoses(webcam);
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (poses.length > 0) {
        drawPose(poses[0]);
        analyzeExerciseForm(poses[0]);
      }
    }
  } catch (e) {
    console.error("Pose estimation error:", e);
  }
  
  requestAnimationFrame(startDetection);
}

function drawPose(pose) {
  const keypointMap = {};
  for (let kp of pose.keypoints) {
    keypointMap[kp.name] = kp;
  }

  // Draw Skeleton Lines
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  for (let [p1Name, p2Name] of skeletonPairs) {
    const p1 = keypointMap[p1Name];
    const p2 = keypointMap[p2Name];
    if (p1 && p2 && p1.score > 0.35 && p2.score > 0.35) {
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
  }

  // Draw Keypoint Nodes
  for (let kp of pose.keypoints) {
    if (kp.score > 0.35) {
      ctx.beginPath();
      ctx.arc(kp.x, kp.y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }
  }
}

function analyzeExerciseForm(pose) {
  const keypointMap = {};
  for (let kp of pose.keypoints) keypointMap[kp.name] = kp;

  const hip = keypointMap['left_hip'] || keypointMap['right_hip'];
  const knee = keypointMap['left_knee'] || keypointMap['right_knee'];
  const ankle = keypointMap['left_ankle'] || keypointMap['right_ankle'];

  const feedbackEl = document.getElementById('formFeedback');
  const repCountEl = document.getElementById('repCount');

  if (hip && knee && ankle && hip.score > 0.4 && knee.score > 0.4 && ankle.score > 0.4) {
    // Simple squat depth heuristic based on vertical Y position
    const hipKneeDistance = knee.y - hip.y;
    
    if (hipKneeDistance < 60 && !isDown) {
      isDown = true;
      if (feedbackEl) feedbackEl.innerText = "Good Squat Depth!";
    } else if (hipKneeDistance > 110 && isDown) {
      isDown = false;
      repCount++;
      if (repCountEl) repCountEl.innerText = repCount;
      if (feedbackEl) feedbackEl.innerText = "Rep Counted! Great job!";
    }
  }
}

window.onload = async () => {
  const startBtn = document.getElementById('startCamBtn');
  if (startBtn) {
    startBtn.addEventListener('click', async () => {
      await tf.setBackend('webgl');
      await tf.ready();
      initPoseDetection();
    });
  } else {
    await tf.setBackend('webgl');
    await tf.ready();
    initPoseDetection();
  }
};

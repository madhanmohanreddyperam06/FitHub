import * as poseDetection from 'https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';

let detector = null;
let webcam = null;
let canvas = null;
let ctx = null;

let repCount = 0;
let targetReps = 10;
let isExerciseDown = false;
let currentExercise = 'squat';
let isCameraRunning = false;
let sessionStartTime = null;
let sessionTimerInterval = null;
let repPace = 0;
let caloriesBurned = 0;
let soundEnabled = true;

// Skeleton keypoint limb connections
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

// Audio feedback synthesizer
function playTone(freq, duration = 0.12, type = 'sine') {
  if (!soundEnabled) return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const audioCtx = new AudioCtx();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    console.warn("Audio error:", e);
  }
}

function playRepBeep() {
  playTone(587.33, 0.1, 'triangle'); // D5
  setTimeout(() => playTone(880, 0.15, 'sine'), 70); // A5
}

function playGoalFanfare() {
  playTone(523.25, 0.15, 'triangle');
  setTimeout(() => playTone(659.25, 0.15, 'triangle'), 120);
  setTimeout(() => playTone(783.99, 0.2, 'triangle'), 240);
  setTimeout(() => playTone(1046.50, 0.35, 'sine'), 360);
}

// Mathematically scale-invariant angle between 3 points
function calculateAngle(a, b, c) {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180.0) {
    angle = 360 - angle;
  }
  return Math.round(angle);
}

// Setup webcam stream
async function setupWebcam() {
  webcam = document.getElementById('webcam');
  const camStatus = document.getElementById('camStatus');

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: 'user'
      },
      audio: false
    });
    webcam.srcObject = stream;
    return new Promise((resolve) => {
      webcam.onloadedmetadata = () => {
        if (camStatus) {
          camStatus.innerText = "Camera Active • Tracking Ready";
          camStatus.style.borderColor = "#ffffff";
        }
        resolve(webcam);
      };
    });
  } catch (err) {
    if (camStatus) {
      camStatus.innerText = "Camera Access Denied";
      camStatus.style.borderColor = "#71717a";
    }
    console.error("Camera access error:", err);
    throw err;
  }
}

// Initialize MoveNet pose detector
async function initPoseDetection() {
  canvas = document.getElementById('pose-canvas');
  if (canvas) ctx = canvas.getContext('2d');

  await setupWebcam();

  const camStatus = document.getElementById('camStatus');
  if (camStatus) camStatus.innerText = "Loading AI MoveNet Model...";

  const model = poseDetection.SupportedModels.MoveNet;
  detector = await poseDetection.createDetector(model, {
    modelType: 'Lightning'
  });

  if (camStatus) camStatus.innerText = "AI Engine Active • Move freely";
  isCameraRunning = true;

  // Start Session Timer
  startSessionTimer();

  // Begin Detection Loop
  detectPoseLoop();
}

// Animation detection loop
async function detectPoseLoop() {
  if (!isCameraRunning || !detector || !webcam) return;

  try {
    if (webcam.readyState >= 2) {
      const poses = await detector.estimatePoses(webcam, {
        flipHorizontal: false
      });

      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (poses.length > 0) {
          const pose = poses[0];
          drawPoseSkeleton(pose);
          analyzeExercise(pose);
        } else {
          updateFormFeedback("Step back until full body is in frame", "neutral");
        }
      }
    }
  } catch (e) {
    console.error("Pose estimation error:", e);
  }

  requestAnimationFrame(detectPoseLoop);
}

// Draw skeleton and HUD
function drawPoseSkeleton(pose) {
  const keypointMap = {};
  for (let kp of pose.keypoints) {
    keypointMap[kp.name] = kp;
  }

  // Draw limbs
  ctx.save();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = 6;

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
  ctx.restore();

  // Draw keypoint nodes
  ctx.save();
  for (let kp of pose.keypoints) {
    if (kp.score > 0.35) {
      ctx.beginPath();
      ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
  ctx.restore();
}

// Draw on-canvas joint angle and progress arc
function drawJointAngleHUD(x, y, angle, label = '') {
  if (!ctx) return;
  ctx.save();

  // Background badge
  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 1;

  const text = `${label ? label + ': ' : ''}${angle}°`;
  ctx.font = 'bold 13px system-ui, sans-serif';
  const textWidth = ctx.measureText(text).width;

  ctx.beginPath();
  ctx.roundRect(x - textWidth / 2 - 8, y - 24, textWidth + 16, 22, 6);
  ctx.fill();
  ctx.stroke();

  // Text
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText(text, x, y - 9);

  ctx.restore();
}

// Draw circular rep completion HUD in canvas corner
function drawRepProgressArc(percent) {
  if (!ctx || !canvas) return;
  const x = canvas.width - 45;
  const y = 45;
  const radius = 26;

  ctx.save();
  // Track ring
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 5;
  ctx.stroke();

  // Progress arc
  const endAngle = -0.5 * Math.PI + (percent / 100) * 2 * Math.PI;
  ctx.beginPath();
  ctx.arc(x, y, radius, -0.5 * Math.PI, endAngle);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 5;
  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = 8;
  ctx.stroke();

  // Percent text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${Math.round(percent)}%`, x, y);

  ctx.restore();
}

// Multi-Exercise Form Analysis Engine
function analyzeExercise(pose) {
  const kp = {};
  for (let pt of pose.keypoints) kp[pt.name] = pt;

  if (currentExercise === 'squat') {
    analyzeSquat(kp);
  } else if (currentExercise === 'pushup') {
    analyzePushUp(kp);
  } else if (currentExercise === 'bicep_curl') {
    analyzeBicepCurl(kp);
  } else if (currentExercise === 'jumping_jack') {
    analyzeJumpingJack(kp);
  }
}

// 1. Squat Analysis
function analyzeSquat(kp) {
  const leftHip = kp['left_hip'];
  const leftKnee = kp['left_knee'];
  const leftAnkle = kp['left_ankle'];

  const rightHip = kp['right_hip'];
  const rightKnee = kp['right_knee'];
  const rightAnkle = kp['right_ankle'];

  // Use side with higher visibility score
  const useLeft = (leftKnee && leftKnee.score > (rightKnee?.score || 0));
  const hip = useLeft ? leftHip : rightHip;
  const knee = useLeft ? leftKnee : rightKnee;
  const ankle = useLeft ? leftAnkle : rightAnkle;

  if (!hip || !knee || !ankle || hip.score < 0.35 || knee.score < 0.35 || ankle.score < 0.35) {
    updateFormFeedback("Stand back: make sure hips, knees, and feet are visible", "neutral");
    return;
  }

  const angle = calculateAngle(hip, knee, ankle);
  drawJointAngleHUD(knee.x, knee.y, angle, 'Knee');

  // Squat Progress: 170 deg (0%) to 90 deg (100%)
  const progress = Math.max(0, Math.min(100, ((170 - angle) / (170 - 90)) * 100));
  drawRepProgressArc(progress);

  // Depth threshold: < 95 degrees
  if (angle <= 95 && !isExerciseDown) {
    isExerciseDown = true;
    updateFormFeedback("Perfect Squat Depth! Now drive upward!", "good");
    playTone(440, 0.08, 'sine');
  } else if (angle >= 160 && isExerciseDown) {
    isExerciseDown = false;
    incrementRep();
    updateFormFeedback("Great Rep! Stand tall before next rep.", "good");
  } else if (!isExerciseDown && angle < 140) {
    updateFormFeedback("Lower down! Reach 90° parallel.", "warning");
  }
}

// 2. Push-Up Analysis
function analyzePushUp(kp) {
  const leftShoulder = kp['left_shoulder'];
  const leftElbow = kp['left_elbow'];
  const leftWrist = kp['left_wrist'];

  const rightShoulder = kp['right_shoulder'];
  const rightElbow = kp['right_elbow'];
  const rightWrist = kp['right_wrist'];

  const useLeft = (leftElbow && leftElbow.score > (rightElbow?.score || 0));
  const shoulder = useLeft ? leftShoulder : rightShoulder;
  const elbow = useLeft ? leftElbow : rightElbow;
  const wrist = useLeft ? leftWrist : rightWrist;

  if (!shoulder || !elbow || !wrist || shoulder.score < 0.35 || elbow.score < 0.35 || wrist.score < 0.35) {
    updateFormFeedback("Position body so shoulders and arms are visible in plank", "neutral");
    return;
  }

  const angle = calculateAngle(shoulder, elbow, wrist);
  drawJointAngleHUD(elbow.x, elbow.y, angle, 'Elbow');

  // Push-up Progress: 160 deg (0%) to 90 deg (100%)
  const progress = Math.max(0, Math.min(100, ((160 - angle) / (160 - 90)) * 100));
  drawRepProgressArc(progress);

  // Depth threshold: < 90 degrees
  if (angle <= 90 && !isExerciseDown) {
    isExerciseDown = true;
    updateFormFeedback("Good Chest Depth! Push back up explosively!", "good");
    playTone(440, 0.08, 'sine');
  } else if (angle >= 155 && isExerciseDown) {
    isExerciseDown = false;
    incrementRep();
    updateFormFeedback("Solid Push-up Rep! Lock elbows at top.", "good");
  } else if (!isExerciseDown && angle < 140) {
    updateFormFeedback("Lower chest closer to floor!", "warning");
  }
}

// 3. Bicep Curl Analysis
function analyzeBicepCurl(kp) {
  const leftShoulder = kp['left_shoulder'];
  const leftElbow = kp['left_elbow'];
  const leftWrist = kp['left_wrist'];

  const rightShoulder = kp['right_shoulder'];
  const rightElbow = kp['right_elbow'];
  const rightWrist = kp['right_wrist'];

  const useLeft = (leftElbow && leftElbow.score > (rightElbow?.score || 0));
  const shoulder = useLeft ? leftShoulder : rightShoulder;
  const elbow = useLeft ? leftElbow : rightElbow;
  const wrist = useLeft ? leftWrist : rightWrist;

  if (!shoulder || !elbow || !wrist || shoulder.score < 0.35 || elbow.score < 0.35 || wrist.score < 0.35) {
    updateFormFeedback("Keep arm visible to track curling motion", "neutral");
    return;
  }

  const angle = calculateAngle(shoulder, elbow, wrist);
  drawJointAngleHUD(elbow.x, elbow.y, angle, 'Arm');

  // Curl Progress: 160 deg (0%) to 50 deg (100%)
  const progress = Math.max(0, Math.min(100, ((160 - angle) / (160 - 50)) * 100));
  drawRepProgressArc(progress);

  // Contraction threshold: < 55 deg
  if (angle <= 55 && !isExerciseDown) {
    isExerciseDown = true;
    updateFormFeedback("Peak Contraction! Squeeze bicep, then lower slowly.", "good");
    playTone(440, 0.08, 'sine');
  } else if (angle >= 150 && isExerciseDown) {
    isExerciseDown = false;
    incrementRep();
    updateFormFeedback("Full extension complete. Ready for next curl!", "good");
  } else if (!isExerciseDown && angle < 120) {
    updateFormFeedback("Curl all the way up to shoulder height!", "warning");
  }
}

// 4. Jumping Jacks Analysis
function analyzeJumpingJack(kp) {
  const leftWrist = kp['left_wrist'];
  const rightWrist = kp['right_wrist'];
  const leftAnkle = kp['left_ankle'];
  const rightAnkle = kp['right_ankle'];
  const leftShoulder = kp['left_shoulder'];
  const rightShoulder = kp['right_shoulder'];

  if (!leftWrist || !rightWrist || !leftAnkle || !rightAnkle || !leftShoulder || !rightShoulder) {
    updateFormFeedback("Ensure entire body is visible for jumping jacks", "neutral");
    return;
  }

  const handsUp = (leftWrist.y < leftShoulder.y) && (rightWrist.y < rightShoulder.y);
  const shoulderDist = Math.abs(rightShoulder.x - leftShoulder.x);
  const feetDist = Math.abs(rightAnkle.x - leftAnkle.x);
  const feetWide = feetDist > (shoulderDist * 1.35);

  const progress = (handsUp && feetWide) ? 100 : (handsUp || feetWide ? 50 : 0);
  drawRepProgressArc(progress);

  if (handsUp && feetWide && !isExerciseDown) {
    isExerciseDown = true;
    playTone(440, 0.08, 'sine');
  } else if (!handsUp && !feetWide && isExerciseDown) {
    isExerciseDown = false;
    incrementRep();
    updateFormFeedback("Jumping Jack Counted! Keep the rhythm!", "good");
  }
}

// Increment rep & trigger notifications
function incrementRep() {
  repCount++;
  playRepBeep();

  const countEl = document.getElementById('repCount');
  if (countEl) {
    countEl.innerText = repCount;
    countEl.classList.add('rep-pulse');
    setTimeout(() => countEl.classList.remove('rep-pulse'), 300);
  }

  // Calculate calories (MET formula approximation)
  const caloriesPerRep = {
    'squat': 0.35,
    'pushup': 0.42,
    'bicep_curl': 0.20,
    'jumping_jack': 0.25
  };
  caloriesBurned = (repCount * (caloriesPerRep[currentExercise] || 0.3)).toFixed(1);
  const calEl = document.getElementById('calCount');
  if (calEl) calEl.innerText = `${caloriesBurned} kcal`;

  // Check Target Goal
  if (targetReps > 0 && repCount === targetReps) {
    triggerGoalCelebration();
  }
}

// Goal celebration modal / overlay
function triggerGoalCelebration() {
  playGoalFanfare();
  const banner = document.getElementById('goalCelebrationBanner');
  if (banner) {
    banner.style.display = 'flex';
  }

  if (window.speechSynthesis && soundEnabled) {
    const msg = new SpeechSynthesisUtterance(`Congratulations! Target goal of ${targetReps} reps completed!`);
    msg.rate = 1.0;
    window.speechSynthesis.speak(msg);
  }
}

function closeGoalCelebration() {
  const banner = document.getElementById('goalCelebrationBanner');
  if (banner) banner.style.display = 'none';
}

// Real-time Form Feedback Box
function updateFormFeedback(text, status = 'neutral') {
  const el = document.getElementById('formFeedback');
  if (!el) return;
  el.innerText = text;

  if (status === 'good') {
    el.style.borderColor = 'rgba(255, 255, 255, 0.8)';
    el.style.color = '#ffffff';
  } else if (status === 'warning') {
    el.style.borderColor = 'rgba(255, 255, 255, 0.4)';
    el.style.color = '#e4e4e7';
  } else {
    el.style.borderColor = 'rgba(255, 255, 255, 0.15)';
    el.style.color = '#a1a1aa';
  }
}

// Session Timer
function startSessionTimer() {
  sessionStartTime = Date.now();
  clearInterval(sessionTimerInterval);

  sessionTimerInterval = setInterval(() => {
    const elapsedSec = Math.floor((Date.now() - sessionStartTime) / 1000);
    const m = Math.floor(elapsedSec / 60).toString().padStart(2, '0');
    const s = (elapsedSec % 60).toString().padStart(2, '0');
    const timerEl = document.getElementById('elapsedTime');
    if (timerEl) timerEl.innerText = `${m}:${s}`;

    // Pace calculation
    if (elapsedSec > 10) {
      repPace = ((repCount / elapsedSec) * 60).toFixed(1);
      const paceEl = document.getElementById('repPace');
      if (paceEl) paceEl.innerText = `${repPace} /min`;
    }
  }, 1000);
}

// UI Controls Binding
document.addEventListener('DOMContentLoaded', () => {
  const startCamBtn = document.getElementById('startCamBtn');
  if (startCamBtn) {
    startCamBtn.addEventListener('click', async () => {
      startCamBtn.disabled = true;
      startCamBtn.innerText = "Starting...";
      try {
        await tf.setBackend('webgl');
        await tf.ready();
        await initPoseDetection();
        startCamBtn.innerText = "Camera Active";
      } catch (err) {
        startCamBtn.disabled = false;
        startCamBtn.innerText = "Retry Camera";
      }
    });
  }

  const exerciseSelect = document.getElementById('exerciseMode');
  if (exerciseSelect) {
    exerciseSelect.addEventListener('change', (e) => {
      currentExercise = e.target.value;
      isExerciseDown = false;
      updateFormFeedback(`Switched to ${exerciseSelect.options[exerciseSelect.selectedIndex].text}. Get ready!`);
    });
  }

  const targetSelect = document.getElementById('targetRepSelect');
  if (targetSelect) {
    targetSelect.addEventListener('change', (e) => {
      targetReps = parseInt(e.target.value) || 0;
    });
  }

  const resetBtn = document.getElementById('resetRepsBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      repCount = 0;
      caloriesBurned = 0;
      isExerciseDown = false;
      sessionStartTime = Date.now();
      const countEl = document.getElementById('repCount');
      const calEl = document.getElementById('calCount');
      if (countEl) countEl.innerText = '0';
      if (calEl) calEl.innerText = '0 kcal';
      updateFormFeedback("Reps reset. Begin when ready!");
    });
  }

  const soundBtn = document.getElementById('poseSoundBtn');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      soundBtn.innerText = soundEnabled ? '🔊 Sound: ON' : '🔇 Sound: OFF';
    });
  }

    const simBtn = document.getElementById('simBtn');
  if (simBtn) {
    simBtn.addEventListener('click', toggleSimulation);
  }

  const closeGoalBtn = document.getElementById('closeGoalBtn');
  if (closeGoalBtn) {
    closeGoalBtn.addEventListener('click', closeGoalCelebration);
  }
});


// ============================================================================
// Interactive Demo & Simulation Engine
// Allows full interactive testing of rep counting, form HUD, angles, & fanfare
// without requiring a physical camera device.
// ============================================================================
let isSimulating = false;
let simAnimationId = null;
let simStartTime = null;
let simBottomReached = false;

function toggleSimulation() {
  if (isSimulating) {
    stopSimulation();
  } else {
    startSimulation();
  }
}

function stopSimulation() {
  isSimulating = false;
  if (simAnimationId) {
    cancelAnimationFrame(simAnimationId);
    simAnimationId = null;
  }
  const simBtn = document.getElementById('simBtn');
  if (simBtn) {
    simBtn.innerText = "🎬 Demo Simulation";
    simBtn.classList.remove('primary-highlight');
  }
  const camStatus = document.getElementById('camStatus');
  if (camStatus && !isCameraRunning) {
    camStatus.innerText = "Camera Ready • Click Start";
  }
  updateFormFeedback("Simulation paused. Click 'Start Camera' or 'Demo Simulation'.", "neutral");
}

function startSimulation() {
  // If camera was running, stop stream to prevent conflict
  if (webcam && webcam.srcObject) {
    webcam.srcObject.getTracks().forEach(track => track.stop());
    webcam.srcObject = null;
    isCameraRunning = false;
  }

  isSimulating = true;
  simStartTime = Date.now();
  simBottomReached = false;

  canvas = document.getElementById('pose-canvas');
  if (canvas) {
    canvas.width = 640;
    canvas.height = 480;
    ctx = canvas.getContext('2d');
  }

  const simBtn = document.getElementById('simBtn');
  if (simBtn) {
    simBtn.innerText = "⏹️ Stop Demo";
    simBtn.classList.add('primary-highlight');
  }

  const camStatus = document.getElementById('camStatus');
  if (camStatus) {
    camStatus.innerText = "⚡ Simulation Active • AI Engine Live";
  }

  startSessionTimer();
  updateFormFeedback(`Simulating ${currentExercise.toUpperCase()} exercise... Watch HUD and rep tracking!`, "good");

  runSimulationLoop();
}

function runSimulationLoop() {
  if (!isSimulating || !ctx || !canvas) return;

  const t = (Date.now() - simStartTime) / 1000;
  const cyclePeriod = 2.4; // 2.4 seconds per full repetition
  const cyclePhase = (t % cyclePeriod) / cyclePeriod;
  
  // Smooth sinusoidal ease-in-out movement: 0 (top) -> 1 (bottom) -> 0 (top)
  const s = (1 - Math.cos(cyclePhase * 2 * Math.PI)) / 2;

  // Render dark digital workspace background
  ctx.fillStyle = '#060608';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle digital grid background
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.lineWidth = 1;
  for (let x = 40; x < canvas.width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 40; y < canvas.height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
  ctx.restore();

  // Top simulation watermark badge
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(14, 14, 210, 26, 6);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.fillText("🤖 SIMULATED AI TRACKING", 24, 31);
  ctx.restore();

  let keypoints = [];
  let trackingAngle = 180;
  let trackingJoint = { x: 320, y: 240 };
  let trackingLabel = 'Angle';
  let progressPct = 0;

  if (currentExercise === 'squat') {
    const hipY = 240 + s * 90;
    const kneeY = 340 + s * 25;
    const kneeSpread = s * 30;

    keypoints = [
      { name: 'nose', x: 320, y: 100 + s * 80, score: 0.99 },
      { name: 'left_shoulder', x: 280, y: 155 + s * 85, score: 0.99 },
      { name: 'right_shoulder', x: 360, y: 155 + s * 85, score: 0.99 },
      { name: 'left_elbow', x: 250, y: 215 + s * 85, score: 0.99 },
      { name: 'right_elbow', x: 390, y: 215 + s * 85, score: 0.99 },
      { name: 'left_wrist', x: 280, y: 250 + s * 85, score: 0.99 },
      { name: 'right_wrist', x: 360, y: 250 + s * 85, score: 0.99 },
      { name: 'left_hip', x: 295, y: hipY, score: 0.99 },
      { name: 'right_hip', x: 345, y: hipY, score: 0.99 },
      { name: 'left_knee', x: 275 - kneeSpread, y: kneeY, score: 0.99 },
      { name: 'right_knee', x: 365 + kneeSpread, y: kneeY, score: 0.99 },
      { name: 'left_ankle', x: 285, y: 440, score: 0.99 },
      { name: 'right_ankle', x: 355, y: 440, score: 0.99 }
    ];

    trackingAngle = Math.round(172 - s * 85); // 172 deg to 87 deg
    trackingJoint = keypoints[9]; // left knee
    trackingLabel = 'Knee';
    progressPct = Math.min(100, Math.max(0, ((170 - trackingAngle) / (170 - 90)) * 100));

    if (s > 0.90 && !simBottomReached) {
      simBottomReached = true;
      playTone(440, 0.08, 'sine');
      updateFormFeedback("Perfect Parallel Squat Depth! Now driving up!", "good");
    } else if (s < 0.12 && simBottomReached) {
      simBottomReached = false;
      incrementRep();
      updateFormFeedback("Rep Complete! Full knee extension.", "good");
    } else if (s > 0.3 && !simBottomReached) {
      updateFormFeedback("Lowering... Keep chest upright and heels down.", "neutral");
    }

  } else if (currentExercise === 'pushup') {
    const depthY = s * 55;
    keypoints = [
      { name: 'nose', x: 140, y: 290 + depthY, score: 0.99 },
      { name: 'left_shoulder', x: 190, y: 310 + depthY, score: 0.99 },
      { name: 'right_shoulder', x: 200, y: 300 + depthY, score: 0.99 },
      { name: 'left_elbow', x: 170 - s * 15, y: 360 + s * 10, score: 0.99 },
      { name: 'right_elbow', x: 180, y: 350 + s * 10, score: 0.99 },
      { name: 'left_wrist', x: 190, y: 410, score: 0.99 },
      { name: 'right_wrist', x: 200, y: 400, score: 0.99 },
      { name: 'left_hip', x: 320, y: 310 + depthY * 0.75, score: 0.99 },
      { name: 'right_hip', x: 330, y: 300 + depthY * 0.75, score: 0.99 },
      { name: 'left_knee', x: 420, y: 325 + depthY * 0.45, score: 0.99 },
      { name: 'right_knee', x: 430, y: 315 + depthY * 0.45, score: 0.99 },
      { name: 'left_ankle', x: 520, y: 340, score: 0.99 },
      { name: 'right_ankle', x: 530, y: 330, score: 0.99 }
    ];

    trackingAngle = Math.round(165 - s * 95); // 165 deg to 70 deg
    trackingJoint = keypoints[3]; // left elbow
    trackingLabel = 'Elbow';
    progressPct = Math.min(100, Math.max(0, ((160 - trackingAngle) / (160 - 80)) * 100));

    if (s > 0.90 && !simBottomReached) {
      simBottomReached = true;
      playTone(440, 0.08, 'sine');
      updateFormFeedback("Chest to floor reached! Push up!", "good");
    } else if (s < 0.12 && simBottomReached) {
      simBottomReached = false;
      incrementRep();
      updateFormFeedback("Rep Complete! Full arm lockout.", "good");
    }

  } else if (currentExercise === 'bicep_curl') {
    const curlUp = s * 160;
    keypoints = [
      { name: 'nose', x: 320, y: 90, score: 0.99 },
      { name: 'left_shoulder', x: 270, y: 150, score: 0.99 },
      { name: 'right_shoulder', x: 370, y: 150, score: 0.99 },
      { name: 'left_elbow', x: 260, y: 260, score: 0.99 },
      { name: 'right_elbow', x: 380, y: 260, score: 0.99 },
      { name: 'left_wrist', x: 260 + s * 10, y: 380 - curlUp, score: 0.99 },
      { name: 'right_wrist', x: 380 - s * 10, y: 380 - curlUp, score: 0.99 },
      { name: 'left_hip', x: 290, y: 280, score: 0.99 },
      { name: 'right_hip', x: 350, y: 280, score: 0.99 },
      { name: 'left_knee', x: 290, y: 370, score: 0.99 },
      { name: 'right_knee', x: 350, y: 370, score: 0.99 },
      { name: 'left_ankle', x: 290, y: 450, score: 0.99 },
      { name: 'right_ankle', x: 350, y: 450, score: 0.99 }
    ];

    trackingAngle = Math.round(168 - s * 123); // 168 deg down to 45 deg
    trackingJoint = keypoints[3]; // left elbow
    trackingLabel = 'Arm';
    progressPct = Math.min(100, Math.max(0, ((160 - trackingAngle) / (160 - 50)) * 100));

    if (s > 0.90 && !simBottomReached) {
      simBottomReached = true;
      playTone(440, 0.08, 'sine');
      updateFormFeedback("Peak Bicep Contraction! Squeeze!", "good");
    } else if (s < 0.12 && simBottomReached) {
      simBottomReached = false;
      incrementRep();
      updateFormFeedback("Full extension complete.", "good");
    }

  } else {
    // Jumping Jack simulation
    const armSpread = s * 120;
    const legSpread = s * 60;
    keypoints = [
      { name: 'nose', x: 320, y: 100 - s * 15, score: 0.99 },
      { name: 'left_shoulder', x: 280, y: 150 - s * 15, score: 0.99 },
      { name: 'right_shoulder', x: 360, y: 150 - s * 15, score: 0.99 },
      { name: 'left_elbow', x: 240 - armSpread * 0.4, y: 200 - armSpread * 0.8, score: 0.99 },
      { name: 'right_elbow', x: 400 + armSpread * 0.4, y: 200 - armSpread * 0.8, score: 0.99 },
      { name: 'left_wrist', x: 210 - armSpread * 0.8, y: 260 - armSpread * 1.5, score: 0.99 },
      { name: 'right_wrist', x: 430 + armSpread * 0.8, y: 260 - armSpread * 1.5, score: 0.99 },
      { name: 'left_hip', x: 295, y: 270 - s * 10, score: 0.99 },
      { name: 'right_hip', x: 345, y: 270 - s * 10, score: 0.99 },
      { name: 'left_knee', x: 290 - legSpread * 0.5, y: 360, score: 0.99 },
      { name: 'right_knee', x: 350 + legSpread * 0.5, y: 360, score: 0.99 },
      { name: 'left_ankle', x: 290 - legSpread, y: 445, score: 0.99 },
      { name: 'right_ankle', x: 350 + legSpread, y: 445, score: 0.99 }
    ];

    trackingAngle = Math.round(35 + s * 120);
    trackingJoint = keypoints[1];
    trackingLabel = 'Arms';
    progressPct = Math.min(100, Math.max(0, s * 100));

    if (s > 0.90 && !simBottomReached) {
      simBottomReached = true;
      playTone(440, 0.08, 'sine');
      updateFormFeedback("Full Jumping Jack Reach!", "good");
    } else if (s < 0.12 && simBottomReached) {
      simBottomReached = false;
      incrementRep();
      updateFormFeedback("Rhythm locked in! Keep moving.", "good");
    }
  }

  // Draw simulated skeleton and HUD overlay
  drawSkeleton(keypoints);
  if (trackingJoint) {
    drawJointAngleHUD(trackingJoint.x, trackingJoint.y, trackingAngle, trackingLabel);
  }
  drawRepProgressArc(progressPct);

  simAnimationId = requestAnimationFrame(runSimulationLoop);
}

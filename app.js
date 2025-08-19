// Grab elements
const videoEl     = document.getElementById('webcam');
const startBtn    = document.getElementById('startButton');
const statusEl    = document.getElementById('status');
const alarmSound  = document.getElementById('alarmSound');
const container   = document.getElementById('videoContainer');

let posenetModel, isMonitoring = false;
let prevY = null, flapCount = 0;

// Thresholds
const FLAP_THRESHOLD   = 50;  // pixels
const FLAP_COUNT_LIMIT = 5;   // flaps

// 1) Setup webcam
async function setupCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  videoEl.srcObject = stream;
  return new Promise(res => videoEl.onloadedmetadata = () => { videoEl.play(); res(); });
}

// 2) Load model
async function loadModel() {
  posenetModel = await posenet.load();
  console.log('✅ PoseNet model loaded');
}

// 3) Play alarm
function playAlarm() {
  if (alarmSound.paused) {
    alarmSound.currentTime = 0;
    alarmSound.play().catch(console.error);
  }
  container.style.boxShadow = '0 0 20px 10px rgba(255,0,0,0.6)';
  setTimeout(() => container.style.boxShadow = '', 500);
}

// 4) Hand motion detection loop
async function motionLoop() {
  if (!isMonitoring) return;

  const pose = await posenetModel.estimateSinglePose(videoEl, { flipHorizontal: false });
  const rw = pose.keypoints.find(k => k.part === 'rightWrist' && k.score > 0.6);
  const lw = pose.keypoints.find(k => k.part === 'leftWrist' && k.score > 0.6);

  if (rw && lw) {
    const avgY = (rw.position.y + lw.position.y) / 2;
    if (prevY !== null && Math.abs(avgY - prevY) > FLAP_THRESHOLD) {
      flapCount++;
      console.log('Flap count:', flapCount);
    }
    prevY = avgY;

    if (flapCount >= FLAP_COUNT_LIMIT) {
      console.log('🟠 Hand flapping detected');
      playAlarm();
      flapCount = 0;
    }
  }

  requestAnimationFrame(motionLoop);
}

// 5) Start/Stop button
startBtn.addEventListener('click', () => {
  isMonitoring = !isMonitoring;
  if (isMonitoring) {
    startBtn.textContent = 'Stop Monitoring';
    statusEl.innerText  = 'Status: Monitoring…';
    prevY = null;
    flapCount = 0;
    motionLoop();
  } else {
    startBtn.textContent = 'Start Monitoring';
    statusEl.innerText  = 'Status: Not Monitoring';
  }
});

// 6) Init on load
window.addEventListener('DOMContentLoaded', async () => {
  await tf.setBackend('webgl');
  await tf.ready();
  await setupCamera();
  await loadModel();
  console.log('🚀 Ready!');
});

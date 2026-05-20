"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Camera, X, RotateCcw } from "lucide-react";

type Exercise = "pushups" | "squats" | "pullups";

interface RepCounterProps {
  exercise: Exercise;
  targetReps: number;
  onComplete: (count: number) => void;
  onClose: () => void;
}

// Angle between three points in degrees
function getAngle(a: { x: number; y: number }, b: { x: number; y: number }, c: { x: number; y: number }): number {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180) / Math.PI);
  if (angle > 180) angle = 360 - angle;
  return angle;
}

export default function RepCounter({ exercise, targetReps, onComplete, onClose }: RepCounterProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [count, setCount] = useState(0);
  const [phase, setPhase] = useState<"up" | "down">("up");
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("Get in position...");
  const countRef = useRef(0);
  const phaseRef = useRef<"up" | "down">("up");
  const poseRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const animFrameRef = useRef<number>(0);

  // Exercise-specific angle thresholds
  const thresholds: Record<Exercise, { joint: string; down: number; up: number }> = {
    pushups: { joint: "elbow", down: 90, up: 160 },
    squats: { joint: "knee", down: 90, up: 160 },
    pullups: { joint: "elbow", down: 160, up: 70 },
  };

  const initPose = useCallback(async () => {
    try {
      // Start camera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        cameraRef.current = stream;
      }

      // Load MediaPipe scripts dynamically
      await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/pose.js");
      await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils@0.3.1675466124/drawing_utils.js");
      await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils@0.3.1675466862/camera_utils.js");

      const mp = (window as any);

      const pose = new mp.Pose({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`,
      });

      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      pose.onResults((results: any) => {
        drawResults(results);
        processRep(results);
      });

      poseRef.current = pose;
      setReady(true);
      setFeedback("Position your full body in frame");

      // Start detection loop
      const detect = async () => {
        if (videoRef.current && videoRef.current.readyState >= 2 && poseRef.current) {
          await poseRef.current.send({ image: videoRef.current });
        }
        animFrameRef.current = requestAnimationFrame(detect);
      };
      detect();
    } catch (err: any) {
      setError(err.message || "Camera access denied");
    }
  }, []);

  useEffect(() => {
    initPose();
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      if (cameraRef.current) {
        cameraRef.current.getTracks().forEach((t: MediaStreamTrack) => t.stop());
      }
    };
  }, [initPose]);

  function loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
      const s = document.createElement("script");
      s.src = src;
      s.crossOrigin = "anonymous";
      s.onload = () => resolve();
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function drawResults(results: any) {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Mirror the video
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    if (results.poseLandmarks) {
      const mp = (window as any);
      // Draw connections
      if (mp.drawConnectors) {
        ctx.save();
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        mp.drawConnectors(ctx, results.poseLandmarks, mp.POSE_CONNECTIONS, {
          color: "#f97316",
          lineWidth: 3,
        });
        mp.drawLandmarks(ctx, results.poseLandmarks, {
          color: "#fff",
          lineWidth: 1,
          radius: 4,
          fillColor: "#f97316",
        });
        ctx.restore();
      }
    }
  }

  function processRep(results: any) {
    if (!results.poseLandmarks) return;

    const lm = results.poseLandmarks;
    const th = thresholds[exercise];
    let angle = 0;

    // Landmark indices (MediaPipe Pose)
    // 11=left_shoulder, 12=right_shoulder, 13=left_elbow, 14=right_elbow
    // 15=left_wrist, 16=right_wrist, 23=left_hip, 24=right_hip
    // 25=left_knee, 26=right_knee, 27=left_ankle, 28=right_ankle

    if (th.joint === "elbow") {
      // Average of both elbows
      const leftAngle = getAngle(lm[11], lm[13], lm[15]);
      const rightAngle = getAngle(lm[12], lm[14], lm[16]);
      angle = (leftAngle + rightAngle) / 2;
    } else if (th.joint === "knee") {
      // Average of both knees
      const leftAngle = getAngle(lm[23], lm[25], lm[27]);
      const rightAngle = getAngle(lm[24], lm[26], lm[28]);
      angle = (leftAngle + rightAngle) / 2;
    }

    // State machine for counting reps
    if (exercise === "pullups") {
      // Pullups: start with arms extended (up angle ~160), pull up (angle decreases to ~70)
      if (phaseRef.current === "up" && angle <= th.up) {
        phaseRef.current = "down";
        setPhase("down");
        setFeedback("Pull up! Good!");
      } else if (phaseRef.current === "down" && angle >= th.down) {
        phaseRef.current = "up";
        setPhase("up");
        countRef.current++;
        setCount(countRef.current);
        setFeedback(`${countRef.current} rep${countRef.current > 1 ? "s" : ""}!`);
      }
    } else {
      // Pushups/Squats: start extended (up angle ~160), go down (angle decreases to ~90)
      if (phaseRef.current === "up" && angle <= th.down) {
        phaseRef.current = "down";
        setPhase("down");
        setFeedback(exercise === "pushups" ? "Go down..." : "Squat down...");
      } else if (phaseRef.current === "down" && angle >= th.up) {
        phaseRef.current = "up";
        setPhase("up");
        countRef.current++;
        setCount(countRef.current);
        setFeedback(`${countRef.current} rep${countRef.current > 1 ? "s" : ""}! Keep going!`);
      }
    }

    // Auto-complete when target reached
    if (countRef.current >= targetReps) {
      setFeedback("Target reached!");
      setTimeout(() => onComplete(countRef.current), 1500);
    }
  }

  function resetCount() {
    countRef.current = 0;
    phaseRef.current = "up";
    setCount(0);
    setPhase("up");
    setFeedback("Reset! Go again.");
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-red-400 font-bold mb-4">{error}</p>
          <p className="text-stone-400 text-sm mb-6">Make sure to allow camera access</p>
          <button onClick={onClose} className="px-6 py-3 bg-stone-800 text-white rounded-xl font-bold">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] bg-black">
      {/* Camera + Canvas */}
      <div className="relative w-full h-full">
        <video ref={videoRef} className="hidden" playsInline muted />
        <canvas ref={canvasRef} className="w-full h-full object-cover" />

        {/* Overlay UI */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 p-4 flex items-start justify-between pointer-events-auto">
            <button onClick={onClose} className="p-3 rounded-2xl bg-black/50 backdrop-blur-sm text-white">
              <X className="w-6 h-6" />
            </button>
            <div className="text-right">
              <div className="px-4 py-2 rounded-2xl bg-black/50 backdrop-blur-sm">
                <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider">
                  {exercise.toUpperCase()}
                </p>
                <p className="text-white text-xs font-bold">
                  Target: {targetReps}
                </p>
              </div>
            </div>
          </div>

          {/* Center rep count */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-32 h-32 rounded-full bg-black/40 backdrop-blur-md flex flex-col items-center justify-center border-2 border-orange-500/50">
              <p className="text-6xl font-black text-white tabular-nums">{count}</p>
              <p className="text-[10px] text-orange-400 font-bold uppercase tracking-wider">reps</p>
            </div>
          </div>

          {/* Bottom feedback */}
          <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-auto">
            <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-4 text-center mb-4">
              <p className="text-white font-bold text-sm">{feedback}</p>
              {!ready && <p className="text-white/40 text-xs mt-1">Loading pose detection...</p>}
            </div>

            <div className="flex gap-3">
              <button onClick={resetCount}
                className="flex-1 py-4 bg-stone-800/80 backdrop-blur-sm text-white rounded-2xl font-bold flex items-center justify-center gap-2">
                <RotateCcw className="w-5 h-5" /> Reset
              </button>
              <button onClick={() => onComplete(count)}
                className="flex-1 py-4 bg-orange-500/90 backdrop-blur-sm text-white rounded-2xl font-bold">
                Done ({count} reps)
              </button>
            </div>
          </div>

          {/* Progress arc */}
          <div className="absolute bottom-32 left-1/2 -translate-x-1/2">
            <svg width="200" height="10" className="overflow-visible">
              <rect x="0" y="0" width="200" height="6" rx="3" fill="rgba(255,255,255,0.1)" />
              <rect x="0" y="0" width={Math.min((count / targetReps) * 200, 200)} height="6" rx="3" fill="#f97316"
                style={{ transition: "width 0.3s ease" }} />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

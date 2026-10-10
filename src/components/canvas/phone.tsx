import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef } from "react";
import { CanvasTexture, ExtrudeGeometry, SRGBColorSpace, Shape, Vector3 } from "three";
import type { BufferAttribute, Group, Mesh, MeshBasicMaterial, Points } from "three";

import { useInView } from "../../hooks/use-in-view";
import { reduceMotion } from "./motion";

const TEAL = "#0e7c72";
const MARIGOLD = "#f0a52e";
const RING_COUNT = 3;

// The phone, in scene units. It stands on its bottom edge, so its centre is half its height up.
const BODY = { width: 0.62, height: 1.1, depth: 0.08, corner: 0.085, edge: 0.018 };
const GLASS = { width: 0.6, height: 1.08, depth: 0.006, corner: 0.076, edge: 0.002 };
const DISPLAY = { width: 0.565, height: 1.025 };
// [x, y, height] of the power button on the right edge and the two volume buttons on the left
const SIDE_BUTTONS = [
  [0.31, 0.2, 0.11],
  [-0.31, 0.26, 0.075],
  [-0.31, 0.15, 0.075],
] as const;

const FRAME_METAL = { color: "#4a5257", metalness: 0.9, roughness: 0.24 };

// The call screen is drawn at the display's proportions and laid over the glass.
const SCREEN_WIDTH = 540;
const SCREEN_HEIGHT = 980;
const SCREEN_CORNER = 58;
const WAVE_BARS = 19;

const OVERVIEW = {
  position: new Vector3(3.3, 2.2, 5.4),
  target: new Vector3(0, 0.8, 0),
};
const CLOSE_UP = {
  position: new Vector3(0, 0.98, 3.5),
  target: new Vector3(0, 0.97, 0),
};
// Angle that turns the phone's screen toward the overview camera
const FACING_CAMERA = Math.atan2(OVERVIEW.position.x, OVERVIEW.position.z);

// A flat slab with rounded corners and softened edges, centred on the origin: the phone's body and its glass.
const roundedSlab = ({ width, height, depth, corner, edge }: typeof BODY) => {
  const w = width / 2 - edge;
  const h = height / 2 - edge;
  const r = corner - edge;
  const outline = new Shape()
    .absarc(w - r, -h + r, r, -Math.PI / 2, 0, false)
    .absarc(w - r, h - r, r, 0, Math.PI / 2, false)
    .absarc(-w + r, h - r, r, Math.PI / 2, Math.PI, false)
    .absarc(-w + r, -h + r, r, Math.PI, Math.PI * 1.5, false);

  return new ExtrudeGeometry(outline, {
    depth: depth - 2 * edge,
    bevelThickness: edge,
    bevelSize: edge,
    bevelSegments: 8,
    curveSegments: 24,
  }).center();
};

// Two slow sines multiplied give an uneven rise and fall between 0 and 1, close to the rhythm of speech.
const speechLoudness = (time: number) =>
  Math.abs(Math.sin(time * 1.7) * Math.sin(time * 0.63 + 1));

const formatCallTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60) % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
};

// Draws the phone's screen: ringing until the call is answered, then a live call with a waveform.
const drawCallScreen = (
  ctx: CanvasRenderingContext2D,
  time: number,
  callSeconds: number | null,
) => {
  const centerX = SCREEN_WIDTH / 2;
  const answered = callSeconds !== null;
  // Rounded display corners; outside them the texture stays clear so the glass shows through
  ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  ctx.fillStyle = "#0c0c0d";
  ctx.beginPath();
  ctx.roundRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, SCREEN_CORNER);
  ctx.fill();

  // Front camera
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.arc(centerX, 46, 13, 0, Math.PI * 2);
  ctx.fill();

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillStyle = "#9a9aa1";
  ctx.font = '500 34px "IBM Plex Mono", monospace';
  ctx.fillText(answered ? "Live call" : "Incoming call", centerX, 170);

  ctx.fillStyle = "#ffffff";
  ctx.font = '700 104px "Caveat", cursive';
  ctx.fillText("AI Agent", centerX, 275);

  ctx.fillStyle = "#9a9aa1";
  ctx.font = '500 40px "IBM Plex Mono", monospace';
  ctx.fillText(
    answered ? formatCallTime(Math.floor(callSeconds)) : "tap to answer",
    centerX,
    368,
  );

  if (answered) {
    const loudness = speechLoudness(time);
    ctx.fillStyle = MARIGOLD;
    for (let i = 0; i < WAVE_BARS; i++) {
      const wobble = 0.3 + 0.7 * Math.abs(Math.sin(i * 1.3 + time * 6));
      const height = 22 + loudness * 230 * wobble;
      const x = centerX + (i - (WAVE_BARS - 1) / 2) * 24;
      ctx.beginPath();
      ctx.roundRect(x - 6, 590 - height / 2, 12, height, 6);
      ctx.fill();
    }
  } else {
    // Rings that grow and fade around the centre while the phone rings
    ctx.strokeStyle = MARIGOLD;
    ctx.lineWidth = 5;
    for (let i = 0; i < 3; i++) {
      const phase = (time * 0.6 + i / 3) % 1;
      ctx.globalAlpha = 1 - phase;
      ctx.beginPath();
      ctx.arc(centerX, 590, 40 + phase * 110, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  // Answer button while ringing, hang-up button during the call
  ctx.lineWidth = 6;
  ctx.strokeStyle = "#ffffff";
  ctx.fillStyle = "#19a394";
  ctx.beginPath();
  ctx.arc(centerX, 840, 64, 0, Math.PI * 2);
  if (answered) ctx.stroke();
  else ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.roundRect(centerX - 32, 831, 64, 18, 9);
  ctx.fill();
};

type CallProps = {
  // performance.now() at the moment the call was answered, or null while it rings
  answeredAt: number | null;
};

// Dots on the studio floor that ripple outward from the plinth while the agent speaks.
const Ripple = ({ answeredAt }: CallProps) => {
  const ref = useRef<Points>(null);
  const positions = useMemo(() => {
    const points: number[] = [];
    for (let ring = 13; ring <= 36; ring++) {
      const radius = ring * 0.085;
      const count = 10 + ring * 6;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + ring * 0.37;
        points.push(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
      }
    }
    return new Float32Array(points);
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const time = reduceMotion ? 0 : clock.elapsedTime;
    const height = answeredAt === null ? 0.02 : 0.05 + 0.12 * speechLoudness(time);
    const position = ref.current.geometry.attributes.position as BufferAttribute;
    for (let i = 0; i < position.count; i++) {
      const radius = Math.hypot(position.getX(i), position.getZ(i));
      position.setY(
        i,
        0.03 + Math.sin(radius * 3.4 - time * 2.6) * height * Math.exp(-radius * 0.3),
      );
    }
    position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={TEAL} size={0.028} transparent opacity={0.55} />
    </points>
  );
};

// Rings that expand from behind the phone and fade, like a call going out.
const SignalRings = () => {
  const ref = useRef<Group>(null);

  useFrame(({ clock }) => {
    const time = reduceMotion ? 0.4 : clock.elapsedTime;
    ref.current?.children.forEach((child, i) => {
      const ring = child as Mesh;
      const phase = (time * 0.32 + i / RING_COUNT) % 1;
      ring.scale.setScalar(0.7 + phase * 1.1);
      (ring.material as MeshBasicMaterial).opacity = (1 - phase) * 0.4;
    });
  });

  return (
    <group ref={ref} position={[0, 1.05, -0.15]}>
      {Array.from({ length: RING_COUNT }, (_, i) => (
        <mesh key={i}>
          <torusGeometry args={[1, 0.007, 8, 120]} />
          <meshBasicMaterial color={TEAL} transparent />
        </mesh>
      ))}
    </group>
  );
};

// A live-drawn call screen laid just in front of the phone's glass.
const CallScreen = ({ answeredAt }: CallProps) => {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = SCREEN_WIDTH;
    canvas.height = SCREEN_HEIGHT;
    const canvasTexture = new CanvasTexture(canvas);
    canvasTexture.colorSpace = SRGBColorSpace;
    return canvasTexture;
  }, []);

  useEffect(() => () => texture.dispose(), [texture]);

  useFrame(({ clock }) => {
    const ctx = (texture.image as HTMLCanvasElement).getContext("2d");
    if (!ctx) return;
    const callSeconds =
      answeredAt === null ? null : (performance.now() - answeredAt) / 1000;
    drawCallScreen(ctx, reduceMotion ? 0 : clock.elapsedTime, callSeconds);
    texture.needsUpdate = true;
  });

  return (
    <mesh position={[0, 0, BODY.depth / 2 + GLASS.depth + 0.0005]}>
      <planeGeometry args={[DISPLAY.width, DISPLAY.height]} />
      <meshBasicMaterial map={texture} toneMapped={false} transparent />
    </mesh>
  );
};

const Phone = ({ answeredAt }: CallProps) => {
  const ref = useRef<Group>(null);
  const body = useMemo(() => roundedSlab(BODY), []);
  const glass = useMemo(() => roundedSlab(GLASS), []);

  useEffect(
    () => () => {
      body.dispose();
      glass.dispose();
    },
    [body, glass],
  );

  useFrame(({ clock, pointer }) => {
    if (!ref.current) return;
    const time = reduceMotion ? 0 : clock.elapsedTime;
    const sway = FACING_CAMERA + Math.sin(time * 0.4) * 0.3 + pointer.x * 0.3;
    const targetY = answeredAt === null ? sway : 0;
    ref.current.rotation.y += (targetY - ref.current.rotation.y) * (reduceMotion ? 1 : 0.07);
  });

  return (
    <group ref={ref} position={[0, 0.12, 0]} scale={1.5}>
      <group position={[0, BODY.height / 2, 0]}>
        {/* Metal frame and back */}
        <mesh geometry={body}>
          <meshPhysicalMaterial {...FRAME_METAL} />
        </mesh>
        {SIDE_BUTTONS.map(([x, y, height]) => (
          <mesh key={`${x}:${y}`} position={[x, y, 0]}>
            <boxGeometry args={[0.012, height, 0.022]} />
            <meshPhysicalMaterial {...FRAME_METAL} />
          </mesh>
        ))}
        {/* Front glass */}
        <mesh geometry={glass} position={[0, 0, BODY.depth / 2 + GLASS.depth / 2]}>
          <meshPhysicalMaterial color="#050506" roughness={0.08} clearcoat={1} />
        </mesh>
        <CallScreen answeredAt={answeredAt} />
      </group>
    </group>
  );
};

// Moves the camera between the studio overview and a close-up of the phone's screen.
const CameraRig = ({ answeredAt }: CallProps) => {
  const target = useRef(OVERVIEW.target.clone());

  useFrame(({ camera, size }) => {
    // On wide screens the pitch sits on the left, so the scene is framed right of centre.
    const shift = size.width >= 768 ? -0.2 * size.width : 0;
    camera.setViewOffset(size.width, size.height, shift, 0, size.width, size.height);

    const goal = answeredAt === null ? OVERVIEW : CLOSE_UP;
    const ease = reduceMotion ? 1 : 0.06;
    camera.position.lerp(goal.position, ease);
    target.current.lerp(goal.target, ease);
    camera.lookAt(target.current);
  });

  return null;
};

type PhoneCanvasProps = CallProps & {
  onToggle: () => void;
};

const PhoneCanvas = ({ answeredAt, onToggle }: PhoneCanvasProps) => {
  const { ref, isInView } = useInView({ initialVisible: true });

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      aria-pressed={answeredAt !== null}
      aria-label="Demo call from an AI agent. Press to answer, press again to hang up."
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        onToggle();
      }}
      className="relative h-[400px] md:absolute md:inset-0 md:h-full cursor-pointer"
    >
      {isInView && (
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{ position: OVERVIEW.position.toArray(), fov: 30 }}
          gl={{ alpha: true, antialias: true }}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={1.5} />
            <directionalLight position={[4, 7, 3]} intensity={2.6} />
            {/* Soft studio panels for the phone's metal and glass to reflect; built in the scene, so nothing is downloaded */}
            <Environment resolution={256}>
              <Lightformer intensity={3} position={[0, 5, 4]} rotation-x={-Math.PI / 3} scale={[10, 4, 1]} />
              <Lightformer intensity={2} position={[6, 2, 2]} rotation-y={-Math.PI / 2} scale={[8, 3, 1]} />
              <Lightformer
                intensity={1.5}
                color="#d9f1ed"
                position={[-6, 1, 1]}
                rotation-y={Math.PI / 2}
                scale={[8, 3, 1]}
              />
            </Environment>
            <CameraRig answeredAt={answeredAt} />
            <mesh position={[0, 0.06, 0]}>
              <cylinderGeometry args={[0.95, 0.95, 0.12, 72]} />
              <meshStandardMaterial color="#f4f7f6" roughness={0.9} />
            </mesh>
            <Ripple answeredAt={answeredAt} />
            <SignalRings />
            <Phone answeredAt={answeredAt} />
            <ContactShadows frames={1} opacity={0.3} scale={9} blur={2.6} far={2.5} color="#0b3a36" />
          </Suspense>
        </Canvas>
      )}
    </div>
  );
};

export default PhoneCanvas;

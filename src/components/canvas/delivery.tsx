import { Billboard, ContactShadows, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useRef } from "react";
import { Vector3 } from "three";
import type { Group, Mesh, MeshBasicMaterial } from "three";

import { useInView } from "../../hooks/use-in-view";
import { reduceMotion } from "./motion";

const ROAD_RADIUS = 2.35;
const LOOP_SECONDS = 9;
const DOORSTEP = new Vector3(-0.3, 0, 1.2);
// The truck parks to one side of the door, so the drop is not hidden behind it.
const STOP_ANGLE = -1.0;
const TRUCK_STOP = new Vector3(
  Math.sin(STOP_ANGLE) * ROAD_RADIUS,
  0.5,
  Math.cos(STOP_ANGLE) * ROAD_RADIUS,
);
const PARCEL_SIZE = 1.4;

// Points in the loop, as fractions of LOOP_SECONDS
const TRUCK_ARRIVES = 0.55;
const PARCEL_LEAVES = 0.6;
const PARCEL_LANDS = 0.72;
const CLEAR_UP_ENDS = 0.1;

const PULSE_COUNT = 2;
const CRUMB_COUNT = 8;

const easeInOut = (x: number) => x * x * (3 - 2 * x);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
// Eases out past 1 and settles back, for a pop that overshoots
const backOut = (x: number) => 1 + 2.7 * (x - 1) ** 3 + 1.7 * (x - 1) ** 2;
// 0 before `start`, rising to 1 over `length`, then held at 1
const progress = (cycle: number, start: number, length: number) =>
  clamp01((cycle - start) / length);

// A truck circles the block and drops a parcel at the front door; the landing sets off
// a squash, a hop from the house, ripples on the ground, a burst of crumbs and a "delivered" tick.
const Block = () => {
  const block = useRef<Group>(null);
  const houseRef = useRef<Group>(null);
  const pulses = useRef<Group>(null);
  const crumbs = useRef<Group>(null);
  const tick = useRef<Group>(null);
  const house = useGLTF("./models/house.glb").scene;
  const truck = useGLTF("./models/truck.glb").scene;
  const parcel = useGLTF("./models/parcel.glb").scene;

  useFrame(({ clock }) => {
    // With reduced motion the scene holds a moment just after the parcel has landed.
    const time = reduceMotion ? 7.2 : clock.elapsedTime;
    const cycle = (time % LOOP_SECONDS) / LOOP_SECONDS;

    const angle =
      STOP_ANGLE + Math.PI * 2 * easeInOut(progress(cycle, 0, TRUCK_ARRIVES));
    truck.position.set(Math.sin(angle) * ROAD_RADIUS, 0, Math.cos(angle) * ROAD_RADIUS);
    truck.rotation.y = angle + Math.PI / 2;

    // Before the drop the parcel waits on the doorstep, shrinking away as the truck sets off.
    const hop =
      cycle < PARCEL_LEAVES
        ? 1
        : easeInOut(progress(cycle, PARCEL_LEAVES, PARCEL_LANDS - PARCEL_LEAVES));
    parcel.position.lerpVectors(TRUCK_STOP, DOORSTEP, hop);
    parcel.position.y += Math.sin(hop * Math.PI) * 0.7;
    const present =
      PARCEL_SIZE * (cycle < PARCEL_LEAVES ? 1 - progress(cycle, 0, CLEAR_UP_ENDS) : 1);
    const squash = Math.sin(progress(cycle, PARCEL_LANDS, 0.06) * Math.PI) * 0.3;
    parcel.scale.set(
      present * (1 + squash * 0.5),
      present * (1 - squash),
      present * (1 + squash * 0.5),
    );

    // The house gives a small hop as the parcel hits the doorstep.
    if (houseRef.current) {
      houseRef.current.scale.y =
        1 + Math.sin(progress(cycle, PARCEL_LANDS, 0.08) * Math.PI) * 0.07;
    }

    pulses.current?.children.forEach((child, i) => {
      const pulse = child as Mesh;
      const spread = progress(cycle, PARCEL_LANDS + i * 0.05, 0.16);
      pulse.scale.setScalar(0.2 + spread * 1.3);
      (pulse.material as MeshBasicMaterial).opacity =
        spread > 0 && spread < 1 ? (1 - spread) * 0.8 : 0;
    });

    crumbs.current?.children.forEach((crumb, i) => {
      const flight = progress(cycle, PARCEL_LANDS, 0.14);
      const direction = (i / CRUMB_COUNT) * Math.PI * 2;
      crumb.position.set(
        DOORSTEP.x + Math.cos(direction) * flight * 0.9,
        0.1 + Math.sin(flight * Math.PI) * 0.6,
        DOORSTEP.z + Math.sin(direction) * flight * 0.9,
      );
      crumb.rotation.set(flight * 6, flight * 4 + i, 0);
      crumb.scale.setScalar(flight > 0 && flight < 1 ? 1 - flight : 0);
    });

    // The tick pops up above the house on delivery and shrinks away when the truck sets off again.
    if (tick.current) {
      const size =
        cycle >= PARCEL_LANDS
          ? backOut(progress(cycle, PARCEL_LANDS + 0.02, 0.07))
          : 1 - progress(cycle, 0, CLEAR_UP_ENDS);
      tick.current.scale.setScalar(Math.max(size, 0.0001));
      tick.current.position.y = 2.15 + Math.sin(time * 2) * 0.05;
    }

    if (block.current) block.current.rotation.y = Math.sin(time * 0.2) * 0.25;
  });

  return (
    <group ref={block}>
      <mesh position={[0, -0.045, 0]}>
        <cylinderGeometry args={[3.2, 3.2, 0.08, 72]} />
        <meshStandardMaterial color="#f4f7f6" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[ROAD_RADIUS - 0.42, ROAD_RADIUS + 0.42, 72]} />
        <meshStandardMaterial color="#d9e4e1" roughness={1} />
      </mesh>

      <group ref={houseRef}>
        <primitive object={house} rotation={[0, Math.PI, 0]} />
      </group>
      <primitive object={truck} />
      <primitive object={parcel} />

      {/* Ripples on the ground around the doorstep */}
      <group ref={pulses} position={[DOORSTEP.x, 0.012, DOORSTEP.z]}>
        {Array.from({ length: PULSE_COUNT }, (_, i) => (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.52, 0.56, 64]} />
            <meshBasicMaterial color="#0e7c72" transparent opacity={0} />
          </mesh>
        ))}
      </group>

      {/* Crumbs thrown up by the landing */}
      <group ref={crumbs}>
        {Array.from({ length: CRUMB_COUNT }, (_, i) => (
          <mesh key={i} scale={0}>
            <boxGeometry args={[0.07, 0.07, 0.07]} />
            <meshStandardMaterial color="#f0a52e" roughness={0.9} />
          </mesh>
        ))}
      </group>

      {/* "Delivered" tick that always faces the camera */}
      <group ref={tick} position={[0, 2.15, 0]}>
        <Billboard>
          <mesh>
            <circleGeometry args={[0.34, 48]} />
            <meshBasicMaterial color="#0e7c72" />
          </mesh>
          <mesh position={[-0.1, -0.04, 0.01]} rotation={[0, 0, -Math.PI / 4]}>
            <planeGeometry args={[0.17, 0.055]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0.073, 0.013, 0.01]} rotation={[0, 0, Math.PI / 4]}>
            <planeGeometry args={[0.32, 0.055]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </Billboard>
      </group>
    </group>
  );
};

const DeliveryCanvas = () => {
  const { ref, isInView } = useInView();

  return (
    <div ref={ref} className="w-full h-full">
      {isInView && (
        <Canvas
          dpr={[1, 2]}
          camera={{ position: [4.9, 4.2, 7.8], fov: 30 }}
          gl={{ alpha: true, antialias: true }}
          onCreated={({ camera }) => camera.lookAt(0, 0.55, 0)}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={1.5} />
            <directionalLight position={[4, 7, 3]} intensity={2.6} />
            <Block />
            <ContactShadows position={[0, -0.09, 0]} opacity={0.28} scale={12} blur={2.8} far={3} color="#0b3a36" />
          </Suspense>
        </Canvas>
      )}
    </div>
  );
};

export default DeliveryCanvas;

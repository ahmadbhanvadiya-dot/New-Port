"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Sparkles } from "@react-three/drei";
import { useRef, useState } from "react";
import * as THREE from "three";

const moods = [
  { crew: "straw", skull: "#f6efdc", shadow: "#17202b", accent: "#d7a943", ribbon: "#c93636", label: "STRAW HAT PIRATES" },
  { crew: "redhair", skull: "#f5dfb5", shadow: "#171923", accent: "#b72d36", ribbon: "#8f2527", label: "RED HAIR PIRATES" },
  { crew: "heart", skull: "#f0eee6", shadow: "#18202a", accent: "#a9b4c6", ribbon: "#202b3c", label: "HEART PIRATES · LAW" },
];

function Bone({ from, to, radius, color }: { from: [number, number, number]; to: [number, number, number]; radius: number; color: string }) {
  const start = new THREE.Vector3(...from);
  const end = new THREE.Vector3(...to);
  const direction = new THREE.Vector3().subVectors(end, start);
  const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
  return <group position={midpoint} quaternion={quaternion}>
    <mesh><cylinderGeometry args={[radius, radius, direction.length() * 0.84, 18]} /><meshStandardMaterial color={color} roughness={0.42} /></mesh>
    {[ -1, 1 ].map((side) => <group key={side} position={[0, side * direction.length() * 0.39, 0]} rotation={[0, 0, side * 0.42]}>
      <mesh position={[-radius * 1.15, 0, 0]}><sphereGeometry args={[radius * 1.45, 16, 12]} /><meshStandardMaterial color={color} roughness={0.4} /></mesh>
      <mesh position={[radius * 1.15, 0, 0]}><sphereGeometry args={[radius * 1.45, 16, 12]} /><meshStandardMaterial color={color} roughness={0.4} /></mesh>
    </group>)}
  </group>;
}

function JollyRoger({ mood, hovering, pointerTarget }: { mood: number; hovering: boolean; pointerTarget: React.MutableRefObject<THREE.Vector2> }) {
  const rig = useRef<THREE.Group>(null);
  const emblem = useRef<THREE.Group>(null);
  const compass = useRef<THREE.Group>(null);
  const pointer = useRef(new THREE.Vector2());
  const palette = moods[mood];
  useFrame((state, delta) => {
    pointer.current.lerp(pointerTarget.current, 0.14);
    if (rig.current) {
      const yawTarget = pointer.current.x * (hovering ? 0.62 : 0.025) + Math.sin(state.clock.elapsedTime * 0.42) * (hovering ? 0.055 : 0.025);
      const pitchTarget = -pointer.current.y * (hovering ? 0.42 : 0.02) + Math.sin(state.clock.elapsedTime * 0.8) * 0.025;
      rig.current.rotation.y = THREE.MathUtils.damp(rig.current.rotation.y, yawTarget, hovering ? 5.5 : 1.8, delta);
      rig.current.rotation.x = THREE.MathUtils.damp(rig.current.rotation.x, pitchTarget, hovering ? 5.5 : 1.8, delta);
      rig.current.rotation.z = THREE.MathUtils.damp(rig.current.rotation.z, -pointer.current.x * (hovering ? 0.24 : 0.015), hovering ? 5 : 1.8, delta);
      rig.current.position.x = THREE.MathUtils.damp(rig.current.position.x, pointer.current.x * (hovering ? 0.28 : 0.035), 4, delta);
      rig.current.position.y = Math.sin(state.clock.elapsedTime * (hovering ? 2.2 : 0.8)) * (hovering ? 0.09 : 0.045) + pointer.current.y * (hovering ? 0.13 : 0.02);
    }
    if (emblem.current) {
      emblem.current.rotation.y = Math.sin(state.clock.elapsedTime * (hovering ? 2.8 : 0.65)) * (hovering ? 0.2 : 0.08);
      emblem.current.rotation.z = Math.sin(state.clock.elapsedTime * (hovering ? 2.1 : 0.5)) * (hovering ? 0.055 : 0.018);
      const pulse = hovering ? 1 + Math.sin(state.clock.elapsedTime * 7) * 0.012 : 1;
      emblem.current.scale.setScalar(THREE.MathUtils.damp(emblem.current.scale.x, (hovering ? 1.085 : 1) * pulse, 6, delta));
    }
    if (compass.current) {
      compass.current.rotation.z += delta * (hovering ? 1.15 : 0.12);
      compass.current.rotation.y = THREE.MathUtils.damp(compass.current.rotation.y, pointer.current.x * (hovering ? 0.5 : 0.08), 3.5, delta);
      compass.current.rotation.x = Math.sin(state.clock.elapsedTime * (hovering ? 1.25 : 0.4)) * (hovering ? 0.2 : 0.1) + pointer.current.y * (hovering ? 0.24 : 0.04);
    }
  });
  const ivory = palette.skull;
  return <group ref={rig}>
    <ambientLight intensity={1.1} />
    <directionalLight position={[3, 4, 5]} intensity={3.1} color="#fff4df" />
    <pointLight position={[-2, 1.5, 2]} intensity={18} color={palette.accent} />
    <pointLight position={[2, -1.5, -1]} intensity={12} color={palette.ribbon} />
    <Float speed={hovering ? 2 : 1} rotationIntensity={hovering ? 0.12 : 0.045} floatIntensity={0.17}>
      <group ref={emblem}>
        {/* Crossbones sit behind the skull and have visible rounded ends. */}
        {palette.crew !== "redhair" && <group position={[0, -0.08, -0.16]}>
          <Bone from={[-0.98, -0.83, 0]} to={[0.98, 0.83, 0]} radius={0.105} color={ivory} />
          <Bone from={[-0.98, 0.83, -0.01]} to={[0.98, -0.83, -0.01]} radius={0.105} color={ivory} />
        </group>}
        {palette.crew === "redhair" && <group position={[0, -0.13, -0.23]}>
          {/* Crossed sabres make the Red Hair crew silhouette distinct from the other flags. */}
          {[ -1, 1 ].map((side) => <group key={side} rotation={[0, 0, side * -0.7]}>
            <mesh position={[side * 0.05, -0.03, 0]} rotation={[0, 0, side * 0.04]}>
              <boxGeometry args={[0.075, 2.15, 0.045]} />
              <meshStandardMaterial color="#cbd2dc" metalness={0.72} roughness={0.24} />
            </mesh>
            <mesh position={[0, -0.75, 0.015]} rotation={[0, 0, side * 0.06]}>
              <boxGeometry args={[0.34, 0.075, 0.07]} />
              <meshStandardMaterial color={palette.ribbon} metalness={0.22} roughness={0.38} />
            </mesh>
            <mesh position={[0, -0.91, 0.015]}>
              <cylinderGeometry args={[0.055, 0.055, 0.28, 12]} />
              <meshStandardMaterial color="#6e352b" roughness={0.45} />
            </mesh>
            <mesh position={[0, -1.07, 0.015]}>
              <sphereGeometry args={[0.075, 14, 10]} />
              <meshStandardMaterial color={palette.accent} metalness={0.35} roughness={0.3} />
            </mesh>
          </group>)}
        </group>}
        {/* Skull cranium and jaw: intentionally graphic, layered shapes. */}
        <mesh position={[0, 0.02, 0.16]} scale={[0.72, 0.73, 0.34]}><sphereGeometry args={[1, 48, 36]} /><meshStandardMaterial color={ivory} roughness={0.34} metalness={0.04} /></mesh>
        <mesh position={[0, -0.49, 0.2]} scale={[0.51, 0.27, 0.3]}><sphereGeometry args={[1, 40, 24]} /><meshStandardMaterial color={ivory} roughness={0.38} /></mesh>
        {/* Eye sockets */}
        <mesh position={[-0.29, 0.04, 0.467]} scale={[0.2, 0.245, 0.055]} rotation={[0, 0, 0.12]}><sphereGeometry args={[1, 32, 24]} /><meshStandardMaterial color={palette.shadow} roughness={0.3} /></mesh>
        <mesh position={[0.29, 0.04, 0.467]} scale={[0.2, 0.245, 0.055]} rotation={[0, 0, -0.12]}><sphereGeometry args={[1, 32, 24]} /><meshStandardMaterial color={palette.shadow} roughness={0.3} /></mesh>
        <mesh position={[0, -0.27, 0.49]} rotation={[0, 0, Math.PI]}><coneGeometry args={[0.095, 0.16, 3]} /><meshStandardMaterial color={palette.shadow} /></mesh>
        {/* Teeth are small, readable blocks along the jaw. */}
        {[-0.29,-0.145,0,0.145,0.29].map((x, i) => <mesh key={i} position={[x, -0.49, 0.466]}><boxGeometry args={[0.115, 0.13, 0.035]} /><meshStandardMaterial color={ivory} roughness={0.4} /></mesh>)}
        {[-0.2175,-0.0725,0.0725,0.2175].map((x, i) => <mesh key={`tooth-gap-${i}`} position={[x, -0.49, 0.487]}><boxGeometry args={[0.012, 0.115, 0.008]} /><meshStandardMaterial color={palette.shadow} roughness={0.55} /></mesh>)}
        {palette.crew === "straw" && <>
          {/* Straw Hat crew: broad golden brim, domed crown and red ribbon. */}
          <mesh position={[0, 0.67, 0.12]} rotation={[0.02, 0, -0.035]} scale={[1.02, 0.13, 0.49]}><sphereGeometry args={[1, 48, 24]} /><meshStandardMaterial color={palette.accent} roughness={0.52} /></mesh>
          <mesh position={[0, 0.84, 0.12]} scale={[0.57, 0.34, 0.38]}><sphereGeometry args={[1, 40, 24]} /><meshStandardMaterial color={palette.accent} roughness={0.47} /></mesh>
          <mesh position={[0, 0.73, 0.13]} scale={[0.78, 0.065, 0.43]}><sphereGeometry args={[1, 40, 20]} /><meshStandardMaterial color={palette.ribbon} roughness={0.38} /></mesh>
          {[-0.34,-0.17,0,0.17,0.34].map((x, i) => <mesh key={i} position={[x, 0.93 + (1-Math.abs(x))*0.025, 0.44]} rotation={[0,0,x*0.35]}><boxGeometry args={[0.018,0.12,0.012]} /><meshStandardMaterial color="#9b742d" roughness={0.6} /></mesh>)}
        </>}
        {palette.crew === "redhair" && <>
          {/* Red Hair crew: bare crown with Shanks-inspired diagonal scars. */}
          {[-0.13, 0.02, 0.17].map((x, i) => <mesh key={i} position={[x, 0.18 - i * 0.055, 0.505]} rotation={[0, 0, -0.42]}><boxGeometry args={[0.035, 0.35, 0.018]} /><meshStandardMaterial color={palette.ribbon} roughness={0.6} /></mesh>)}
          {/* Swept crimson hair tufts instead of a hat: the crossed sabres and three scars define this crew. */}
          {[-0.34, -0.12, 0.12, 0.34].map((x, i) => <mesh key={`red-hair-tuft-${i}`} position={[x, 0.66 + (i % 2) * 0.035, 0.11]} rotation={[0, 0, (x * -0.9) - 0.12]}><coneGeometry args={[0.19, 0.42, 5]} /><meshStandardMaterial color={i % 2 ? "#c64a43" : palette.accent} roughness={0.65} /></mesh>)}
        </>}
        {palette.crew === "heart" && <>
          {/* Heart Pirates: pale spotted cap with dark circular marks. */}
          <mesh position={[0, 0.66, 0.12]} scale={[0.94, 0.17, 0.46]}><sphereGeometry args={[1, 48, 24]} /><meshStandardMaterial color={palette.accent} roughness={0.55} /></mesh>
          <mesh position={[0, 0.83, 0.12]} scale={[0.57, 0.32, 0.38]}><sphereGeometry args={[1, 40, 24]} /><meshStandardMaterial color={palette.accent} roughness={0.5} /></mesh>
          {[-0.42,-0.22,0,0.22,0.42].map((x, i) => <mesh key={i} position={[x, 0.78 + (1-Math.abs(x))*0.04, 0.49]}><sphereGeometry args={[0.052, 16, 12]} /><meshStandardMaterial color={palette.shadow} roughness={0.5} /></mesh>)}
          {[-0.31,-0.1,0.1,0.31].map((x, i) => <mesh key={`cap-spot-${i}`} position={[x, 0.87, 0.45]}><sphereGeometry args={[0.034, 14, 10]} /><meshStandardMaterial color={palette.shadow} roughness={0.5} /></mesh>)}
          <mesh position={[0, 0.68, 0.53]} scale={[0.76, 0.045, 0.025]}><sphereGeometry args={[1, 32, 16]} /><meshStandardMaterial color={palette.ribbon} /></mesh>
        </>}
      </group>
    </Float>
    <group ref={compass}>
      {[1.32, 1.52].map((radius, i) => <mesh key={radius} rotation={[Math.PI / 2 + i * 0.48, i * 0.25, i * 0.18]}><torusGeometry args={[radius, i === 0 ? 0.012 : 0.006, 8, 144]} /><meshBasicMaterial color={i === 0 ? palette.accent : palette.ribbon} transparent opacity={i === 0 ? 0.82 : 0.42} /></mesh>)}
      {[0,1,2,3,4,5,6,7].map(i => <mesh key={i} position={[Math.cos(i*Math.PI/4)*1.52, Math.sin(i*Math.PI/4)*1.52, 0]} rotation={[0,0,i*Math.PI/4]}><coneGeometry args={[0.045,0.12,4]} /><meshStandardMaterial color={palette.accent} emissive={palette.accent} emissiveIntensity={0.18} /></mesh>)}
    </group>
    <Sparkles count={hovering ? 92 : 42} scale={4} size={hovering ? 2.5 : 1.6} speed={hovering ? 1 : 0.28} color={palette.accent} />
    <Environment preset="sunset" />
  </group>;
}

export default function OrbScene({ onCrewChange }: { onCrewChange?: (crew: string) => void }) {
  const [mood, setMood] = useState(0);
  const [hovering, setHovering] = useState(false);
  const pointerTarget = useRef(new THREE.Vector2(0, 0));
  const palette = moods[mood];
  const trackPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerTarget.current.set(THREE.MathUtils.clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1, 1), THREE.MathUtils.clamp(-(((event.clientY - rect.top) / rect.height) * 2 - 1), -1, 1));
    setHovering(true);
  };
  const releasePointer = () => { setHovering(false); pointerTarget.current.set(0, 0); };
  const recomposeCrew = () => {
    const nextMood = (mood + 1) % moods.length;
    setMood(nextMood);
    onCrewChange?.(moods[nextMood].label);
    pointerTarget.current.set(0, 0);
  };
  return <div className={`orb-canvas sculpture-canvas${hovering ? " is-hovering" : ""}`} onPointerEnter={() => setHovering(true)} onPointerMove={trackPointer} onPointerLeave={releasePointer} aria-label={`Interactive ${palette.label} Jolly Roger.`}>
    <Canvas camera={{ position: [0, 0, 5.3], fov: 42 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true, powerPreference: "low-power" }} fallback={<div className="scene-fallback" />}>
      <JollyRoger mood={mood} hovering={hovering} pointerTarget={pointerTarget} />
    </Canvas>
    <button className="sculpture-switch" type="button" onClick={recomposeCrew} aria-label="Recompose the Jolly Roger and switch pirate crew">
      <span className="switch-dot" style={{ background: palette.accent }} /><span>{palette.label}</span><span className="switch-icon">↻</span>
    </button>
    <div className="sculpture-hint" aria-hidden="true">HOVER TO AWAKEN · MOVE TO STEER · RECOMPOSE TO SWITCH CREW</div>
  </div>;
}

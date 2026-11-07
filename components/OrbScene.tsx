"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Sparkles } from "@react-three/drei";
import { useRef, useState } from "react";
import * as THREE from "three";

const moods = [
  { crew: "compass", skull: "#f4ecd8", shadow: "#14202e", accent: "#d9ad4a", ribbon: "#1f3a5f", label: "COMPASS CORSAIRS" },
  { crew: "cinder", skull: "#f3e3cf", shadow: "#1a1416", accent: "#ff7a2f", ribbon: "#b8321c", label: "CINDER SABRES" },
  { crew: "moontide", skull: "#eef3f4", shadow: "#16212b", accent: "#8fd0e8", ribbon: "#3b6fa8", label: "MOONTIDE CREW" },
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
        {palette.crew !== "cinder" && <group position={[0, -0.08, -0.16]}>
          <Bone from={[-0.98, -0.83, 0]} to={[0.98, 0.83, 0]} radius={0.105} color={ivory} />
          <Bone from={[-0.98, 0.83, -0.01]} to={[0.98, -0.83, -0.01]} radius={0.105} color={ivory} />
        </group>}
        {palette.crew === "cinder" && <group position={[0, -0.13, -0.23]}>
          {/* Crossed cutlasses with basket guards give the Cinder Sabres their own silhouette. */}
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
        {palette.crew === "compass" && <>
          {/* Compass Corsairs: navy tricorn with brass trim, a quill feather and a tiny brass compass badge. */}
          <mesh position={[0, 0.7, 0.12]} rotation={[0, Math.PI / 2, 0]} scale={[1.12, 1, 0.92]}><cylinderGeometry args={[0.8, 0.8, 0.075, 3]} /><meshStandardMaterial color={palette.ribbon} roughness={0.5} /></mesh>
          <mesh position={[0, 0.7, 0.12]} rotation={[0, Math.PI / 2, 0]} scale={[1.12, 1, 0.92]}><cylinderGeometry args={[0.83, 0.83, 0.03, 3]} /><meshStandardMaterial color={palette.accent} metalness={0.5} roughness={0.32} /></mesh>
          <mesh position={[0, 0.9, 0.12]} scale={[0.5, 0.3, 0.4]}><sphereGeometry args={[1, 40, 24]} /><meshStandardMaterial color={palette.ribbon} roughness={0.46} /></mesh>
          <mesh position={[0, 0.79, 0.14]} scale={[0.6, 0.05, 0.43]}><sphereGeometry args={[1, 32, 16]} /><meshStandardMaterial color={palette.accent} metalness={0.45} roughness={0.34} /></mesh>
          <mesh position={[0.5, 0.93, 0.18]} rotation={[0, 0, -0.9]}><coneGeometry args={[0.07, 0.55, 6]} /><meshStandardMaterial color="#f7f1e3" roughness={0.6} /></mesh>
          <mesh position={[0, 0.7, 0.53]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.085, 0.018, 10, 32]} /><meshStandardMaterial color={palette.accent} metalness={0.6} roughness={0.28} /></mesh>
          <mesh position={[0, 0.7, 0.535]} rotation={[0, 0, Math.PI / 4]}><boxGeometry args={[0.025, 0.15, 0.012]} /><meshStandardMaterial color={palette.ribbon} /></mesh>
        </>}
        {palette.crew === "cinder" && <>
          {/* Cinder Sabres: a crest of stylised flames instead of a hat, plus a smouldering brow band. */}
          {[-0.36, -0.18, 0, 0.18, 0.36].map((x, i) => {
            const tall = 0.62 - Math.abs(x) * 0.7;
            return <mesh key={`flame-${i}`} position={[x, 0.66 + tall * 0.42, 0.12]} rotation={[0, 0, x * -0.55 + (i % 2 ? 0.08 : -0.08)]}>
              <coneGeometry args={[0.15, tall, 6]} />
              <meshStandardMaterial color={i % 2 ? "#ffb347" : palette.accent} emissive={palette.accent} emissiveIntensity={0.35} roughness={0.5} />
            </mesh>;
          })}
          <mesh position={[0, 0.5, 0.2]} scale={[0.69, 0.05, 0.33]}><sphereGeometry args={[1, 40, 16]} /><meshStandardMaterial color={palette.ribbon} roughness={0.5} /></mesh>
        </>}
        {palette.crew === "moontide" && <>
          {/* Moontide Crew: a pale crescent rising over the skull, a tide-blue brow band and three stars. */}
          <mesh position={[0, 0.98, 0.14]} rotation={[0, 0, -Math.PI * 1.15]}><torusGeometry args={[0.44, 0.07, 16, 72, Math.PI * 1.3]} /><meshStandardMaterial color={palette.accent} metalness={0.25} roughness={0.35} emissive={palette.accent} emissiveIntensity={0.18} /></mesh>
          <mesh position={[0, 0.5, 0.2]} scale={[0.7, 0.05, 0.33]}><sphereGeometry args={[1, 40, 16]} /><meshStandardMaterial color={palette.ribbon} roughness={0.45} /></mesh>
          {[[-0.62, 1.16], [0.66, 1.2], [0.02, 1.48]].map(([x, y], i) => <mesh key={`star-${i}`} position={[x, y, 0.2]} rotation={[0, 0, Math.PI / 4]}><octahedronGeometry args={[0.055, 0]} /><meshStandardMaterial color="#ffffff" emissive={palette.accent} emissiveIntensity={0.6} /></mesh>)}
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

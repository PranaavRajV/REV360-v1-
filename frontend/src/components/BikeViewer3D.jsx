import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Float, MeshWobbleMaterial } from '@react-three/drei';
import * as THREE from 'three';

/* ─────────────────────────────────────────────────────────
   PROCEDURAL 3D BIKE MODELS
   Each model is assembled from primitive meshes to represent
   5 distinct motorcycle silhouettes.
───────────────────────────────────────────────────────── */

// ── Shared sub-parts ──────────────────────────────────────

function Wheel({ position, r = 0.55, t = 0.18, color }) {
  return (
    <group position={position}>
      {/* Tyre */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[r, t, 14, 36]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>
      {/* Rim */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[r - 0.1, 0.04, 8, 36]} />
        <meshStandardMaterial color={color} metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Hub */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, t + 0.04, 16]} />
        <meshStandardMaterial color={color} metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Spokes */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh
          key={i}
          rotation={[Math.PI / 2, 0, (i * Math.PI) / 3]}
        >
          <cylinderGeometry args={[0.015, 0.015, (r - 0.08) * 2, 6]} />
          <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function Exhaust({ position, accent }) {
  return (
    <group position={position}>
      <mesh rotation={[0, 0, Math.PI / 8]}>
        <cylinderGeometry args={[0.07, 0.05, 0.8, 12]} />
        <meshStandardMaterial color="#3a3a3a" metalness={0.9} roughness={0.3} />
      </mesh>
      <mesh position={[0.18, 0.12, 0]} rotation={[0, 0, Math.PI / 5]}>
        <cylinderGeometry args={[0.09, 0.07, 0.32, 12]} />
        <meshStandardMaterial color={accent} metalness={0.8} roughness={0.4} />
      </mesh>
    </group>
  );
}

function Handlebar({ position, color }) {
  return (
    <group position={position}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.035, 0.035, 0.9, 10]} />
        <meshStandardMaterial color={color} metalness={0.85} roughness={0.2} />
      </mesh>
      {[-0.42, 0.42].map((x, i) => (
        <mesh key={i} position={[x, -0.12, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.28, 10]} />
          <meshStandardMaterial color="#111" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function Seat({ position, w = 0.38, d = 0.7, h = 0.1 }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[w, h, d]} />
      <meshStandardMaterial color="#222" roughness={0.85} />
    </mesh>
  );
}

// ── Model 1: Royal Enfield Classic (retro cruiser) ────────
function RoyalEnfieldClassic({ primary, accent }) {
  return (
    <group>
      {/* Frame */}
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[0.12, 0.06, 1.5]} />
        <meshStandardMaterial color={primary} metalness={0.3} roughness={0.7} />
      </mesh>
      {/* Tank – long, rounded */}
      <mesh position={[0, 0.62, 0.08]}>
        <capsuleGeometry args={[0.24, 0.64, 6, 18]} />
        <meshStandardMaterial color={primary} metalness={0.6} roughness={0.35} />
      </mesh>
      {/* Engine block */}
      <mesh position={[0, 0.05, 0.04]}>
        <boxGeometry args={[0.38, 0.42, 0.46]} />
        <meshStandardMaterial color="#222" metalness={0.5} roughness={0.6} />
      </mesh>
      {/* Cylinder head */}
      <mesh position={[0, 0.32, 0.04]}>
        <cylinderGeometry args={[0.12, 0.14, 0.22, 12]} />
        <meshStandardMaterial color="#333" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Mud guards */}
      <mesh position={[0, 0.62, 0.72]} rotation={[0.4, 0, 0]}>
        <boxGeometry args={[0.22, 0.06, 0.5]} />
        <meshStandardMaterial color={primary} metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.62, -0.72]} rotation={[-0.4, 0, 0]}>
        <boxGeometry args={[0.22, 0.06, 0.5]} />
        <meshStandardMaterial color={primary} metalness={0.4} roughness={0.5} />
      </mesh>
      {/* Headlight */}
      <mesh position={[0, 0.72, 0.82]}>
        <sphereGeometry args={[0.14, 14, 14]} />
        <meshStandardMaterial color="#ddd" metalness={0.9} roughness={0.1} />
      </mesh>
      <Seat position={[0, 0.72, -0.15]} w={0.36} d={0.72} />
      <Handlebar position={[0, 0.84, 0.56]} color={accent} />
      <Wheel position={[0, 0, 0.76]} color={accent} />
      <Wheel position={[0, 0, -0.76]} color={accent} />
      <Exhaust position={[0.2, 0.08, -0.5]} accent={accent} />
    </group>
  );
}

// ── Model 2: KTM Duke (naked street fighter) ──────────────
function KTMDuke({ primary, accent }) {
  return (
    <group>
      {/* Trellis frame – visible orange tubes */}
      {[[-0.08, 0.35, 0], [0.08, 0.35, 0]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <cylinderGeometry args={[0.025, 0.025, 1.4, 8]} />
          <meshStandardMaterial color={primary} metalness={0.5} roughness={0.4} />
        </mesh>
      ))}
      {/* Tank – angular */}
      <mesh position={[0, 0.66, 0.06]}>
        <boxGeometry args={[0.38, 0.3, 0.56]} />
        <meshStandardMaterial color={primary} metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Engine */}
      <mesh position={[0, 0.04, 0.04]}>
        <boxGeometry args={[0.34, 0.38, 0.44]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.6} roughness={0.5} />
      </mesh>
      {/* Belly fairing */}
      <mesh position={[0, -0.1, 0.12]}>
        <boxGeometry args={[0.32, 0.2, 0.48]} />
        <meshStandardMaterial color={primary} metalness={0.4} roughness={0.3} />
      </mesh>
      {/* Headlight – angular square */}
      <mesh position={[0, 0.76, 0.76]}>
        <boxGeometry args={[0.22, 0.14, 0.08]} />
        <meshStandardMaterial color="#ccc" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Tail */}
      <mesh position={[0, 0.58, -0.72]} rotation={[0.35, 0, 0]}>
        <boxGeometry args={[0.3, 0.12, 0.4]} />
        <meshStandardMaterial color={primary} metalness={0.4} roughness={0.3} />
      </mesh>
      <Seat position={[0, 0.71, -0.12]} w={0.3} d={0.6} />
      <Handlebar position={[0, 0.72, 0.46]} color={accent} />
      <Wheel position={[0, 0, 0.78]} r={0.52} color={accent} />
      <Wheel position={[0, 0, -0.78]} r={0.52} color={accent} />
      <Exhaust position={[0.18, 0.1, -0.52]} accent={accent} />
    </group>
  );
}

// ── Model 3: Yamaha R15 (full fairing sport) ──────────────
function YamahaR15({ primary, accent }) {
  return (
    <group>
      {/* Full front fairing */}
      <mesh position={[0, 0.52, 0.72]}>
        <boxGeometry args={[0.46, 0.68, 0.28]} />
        <meshStandardMaterial color={primary} metalness={0.55} roughness={0.3} />
      </mesh>
      {/* Upper fairing cowl */}
      <mesh position={[0, 0.86, 0.62]}>
        <boxGeometry args={[0.38, 0.22, 0.22]} />
        <meshStandardMaterial color={primary} metalness={0.55} roughness={0.3} />
      </mesh>
      {/* Tank */}
      <mesh position={[0, 0.72, 0.08]}>
        <capsuleGeometry args={[0.2, 0.5, 5, 16]} />
        <meshStandardMaterial color={primary} metalness={0.55} roughness={0.3} />
      </mesh>
      {/* Engine */}
      <mesh position={[0, 0.1, 0.06]}>
        <boxGeometry args={[0.3, 0.35, 0.42]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.6} roughness={0.5} />
      </mesh>
      {/* Side fairings */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[s * 0.22, 0.4, 0.08]}>
          <boxGeometry args={[0.04, 0.52, 0.72]} />
          <meshStandardMaterial color={primary} metalness={0.5} roughness={0.3} />
        </mesh>
      ))}
      {/* Tail fairing */}
      <mesh position={[0, 0.64, -0.64]} rotation={[0.32, 0, 0]}>
        <boxGeometry args={[0.3, 0.22, 0.52]} />
        <meshStandardMaterial color={primary} metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Visor */}
      <mesh position={[0, 0.96, 0.7]}>
        <boxGeometry args={[0.34, 0.12, 0.06]} />
        <meshStandardMaterial color="#88ccff" metalness={0.9} roughness={0.05} transparent opacity={0.5} />
      </mesh>
      <Seat position={[0, 0.72, -0.16]} w={0.28} d={0.6} />
      <Handlebar position={[0, 0.74, 0.46]} color={accent} />
      <Wheel position={[0, 0, 0.8]} r={0.5} color={accent} />
      <Wheel position={[0, 0, -0.8]} r={0.5} color={accent} />
      <Exhaust position={[0.17, 0.08, -0.56]} accent={accent} />
    </group>
  );
}

// ── Model 4: Honda CBR (sport-tourer fairing) ─────────────
function HondaCBR({ primary, accent }) {
  return (
    <group>
      {/* Front fairing – wider, rounded */}
      <mesh position={[0, 0.48, 0.7]}>
        <capsuleGeometry args={[0.27, 0.52, 6, 18]} />
        <meshStandardMaterial color={primary} metalness={0.6} roughness={0.25} />
      </mesh>
      {/* Racing stripe decal strip */}
      <mesh position={[0, 0.52, 0.7]}>
        <boxGeometry args={[0.04, 0.72, 0.3]} />
        <meshStandardMaterial color="#fff" metalness={0.3} roughness={0.6} />
      </mesh>
      {/* Tank */}
      <mesh position={[0, 0.71, 0.09]}>
        <capsuleGeometry args={[0.21, 0.52, 5, 16]} />
        <meshStandardMaterial color={primary} metalness={0.6} roughness={0.25} />
      </mesh>
      {/* Engine */}
      <mesh position={[0, 0.08, 0.05]}>
        <boxGeometry args={[0.32, 0.36, 0.44]} />
        <meshStandardMaterial color="#1c1c1c" metalness={0.6} roughness={0.5} />
      </mesh>
      {/* Side panels */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[s * 0.25, 0.38, 0.06]}>
          <boxGeometry args={[0.04, 0.48, 0.68]} />
          <meshStandardMaterial color={primary} metalness={0.5} roughness={0.3} />
        </mesh>
      ))}
      {/* Tail */}
      <mesh position={[0, 0.62, -0.68]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[0.28, 0.24, 0.5]} />
        <meshStandardMaterial color={primary} metalness={0.5} roughness={0.3} />
      </mesh>
      <Seat position={[0, 0.73, -0.18]} w={0.3} d={0.62} />
      <Handlebar position={[0, 0.73, 0.48]} color={accent} />
      <Wheel position={[0, 0, 0.82]} r={0.5} color={accent} />
      <Wheel position={[0, 0, -0.82]} r={0.5} color={accent} />
      <Exhaust position={[0.18, 0.06, -0.56]} accent={accent} />
    </group>
  );
}

// ── Model 5: Bajaj Pulsar (naked aggro) ───────────────────
function BajajPulsar({ primary, accent }) {
  return (
    <group>
      {/* Tank – aggressive wedge */}
      <mesh position={[0, 0.68, 0.07]} rotation={[0.1, 0, 0]}>
        <boxGeometry args={[0.4, 0.28, 0.58]} />
        <meshStandardMaterial color={primary} metalness={0.45} roughness={0.35} />
      </mesh>
      {/* Tank chin */}
      <mesh position={[0, 0.55, 0.28]}>
        <boxGeometry args={[0.32, 0.18, 0.28]} />
        <meshStandardMaterial color={primary} metalness={0.45} roughness={0.35} />
      </mesh>
      {/* Accent stripes */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[s * 0.19, 0.68, 0.07]}>
          <boxGeometry args={[0.04, 0.28, 0.6]} />
          <meshStandardMaterial color={accent} metalness={0.3} roughness={0.5} />
        </mesh>
      ))}
      {/* Engine */}
      <mesh position={[0, 0.06, 0.05]}>
        <boxGeometry args={[0.36, 0.4, 0.46]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.6} roughness={0.5} />
      </mesh>
      {/* Radiator */}
      <mesh position={[0, 0.14, 0.3]}>
        <boxGeometry args={[0.3, 0.28, 0.06]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.7} roughness={0.4} />
      </mesh>
      {/* Headlight – sharp DRL */}
      <mesh position={[0, 0.72, 0.78]}>
        <boxGeometry args={[0.32, 0.12, 0.07]} />
        <meshStandardMaterial color="#ccc" metalness={0.9} roughness={0.05} />
      </mesh>
      {/* Tail cowl */}
      <mesh position={[0, 0.6, -0.72]} rotation={[0.38, 0, 0]}>
        <boxGeometry args={[0.28, 0.18, 0.46]} />
        <meshStandardMaterial color={primary} metalness={0.4} roughness={0.35} />
      </mesh>
      <Seat position={[0, 0.73, -0.14]} w={0.32} d={0.62} />
      <Handlebar position={[0, 0.79, 0.5]} color={accent} />
      <Wheel position={[0, 0, 0.8]} r={0.53} color={accent} />
      <Wheel position={[0, 0, -0.8]} r={0.53} color={accent} />
      <Exhaust position={[0.2, 0.1, -0.54]} accent={accent} />
    </group>
  );
}

/* ── Active accessory highlight spots ── */
function AccessorySpot({ position, color }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.intensity = 1.8 + Math.sin(clock.elapsedTime * 3) * 0.6;
    }
  });
  return (
    <pointLight
      ref={ref}
      position={position}
      color={color}
      intensity={2.0}
      distance={0.8}
      decay={2}
    />
  );
}

/* ── Model name → spot positions map ── */
const ACCESSORY_SPOTS = {
  crash_guard: { position: [0, 0.05, 0.1], color: '#f5a623' },
  led_headlight: { position: [0, 0.72, 0.88], color: '#74B9FF' },
  tank_pad: { position: [0, 0.72, 0.06], color: '#8B5CF6' },
  exhaust: { position: [0.22, 0.08, -0.6], color: '#E17055' },
  phone_mount: { position: [0, 0.88, 0.52], color: '#A29BFE' },
  seat_cover: { position: [0, 0.74, -0.15], color: '#F59E0B' },
  tail_light: { position: [0, 0.5, -0.82], color: '#EF4444' },
  chain_lube: { position: [-0.3, -0.1, -0.2], color: '#34D399' },
};

/* ── Auto-rotate wrapper ── */
function BikeScene({ modelId, primaryColor, accentColor, activeAccessories }) {
  const groupRef = useRef();
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.25;
    }
  });

  const BikeComponent = {
    royal_enfield_classic: RoyalEnfieldClassic,
    ktm_duke_200: KTMDuke,
    yamaha_r15: YamahaR15,
    honda_cbr: HondaCBR,
    bajaj_pulsar: BajajPulsar,
  }[modelId] ?? RoyalEnfieldClassic;

  const spots = activeAccessories
    .map((key) => ACCESSORY_SPOTS[key])
    .filter(Boolean);

  return (
    <group ref={groupRef}>
      <Float speed={1.2} rotationIntensity={0.04} floatIntensity={0.15}>
        <BikeComponent primary={primaryColor} accent={accentColor} />
        {spots.map((spot, i) => (
          <AccessorySpot key={i} position={spot.position} color={spot.color} />
        ))}
      </Float>
    </group>
  );
}

/* ═══════════════════════════════════════════════
   EXPORTED COMPONENT
   Props:
     modelId          – one of the 5 model keys
     primaryColor     – hex colour for the bike body
     accentColor      – hex for rims / accent
     activeAccessories – string[] of accessory keys
═══════════════════════════════════════════════ */
export default function BikeViewer3D({ modelId, primaryColor, accentColor, activeAccessories = [] }) {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: 360 }}>
      <Canvas
        camera={{ position: [2.4, 1.2, 3.2], fov: 40 }}
        shadows={false}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        {/* Lighting setup – professional "showroom" */}
        <ambientLight intensity={0.45} color="#d4d0ff" />
        <directionalLight position={[4, 6, 4]} intensity={1.4} color="#ffffff" />
        <directionalLight position={[-4, 2, -4]} intensity={0.5} color="#c0d0ff" />
        <pointLight position={[0, 4, 0]} intensity={0.6} color="#ffffff" distance={8} />

        <Environment preset="city" />

        <BikeScene
          modelId={modelId}
          primaryColor={primaryColor}
          accentColor={accentColor}
          activeAccessories={activeAccessories}
        />

        <OrbitControls
          enablePan={false}
          minDistance={2}
          maxDistance={7}
          maxPolarAngle={Math.PI / 1.7}
          minPolarAngle={0.3}
          autoRotate={false}
        />
      </Canvas>
    </div>
  );
}

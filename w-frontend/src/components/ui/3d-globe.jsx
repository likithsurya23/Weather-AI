/* eslint-disable */
"use client";

import React, { useRef, useMemo, useState, useCallback, Suspense, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { cn } from "@/lib/utils";

// ============================================================================
// Constants - Earth Texture URLs (NASA Blue Marble)
// ============================================================================

const DEFAULT_EARTH_TEXTURE =
  "https://unpkg.com/three-globe@2.31.0/example/img/earth-blue-marble.jpg";
const DEFAULT_BUMP_TEXTURE =
  "https://unpkg.com/three-globe@2.31.0/example/img/earth-topology.png";

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Convert latitude/longitude to 3D cartesian coordinates
 */
function latLngToVector3(lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

// ============================================================================
// Marker Component with Perfectly Connected Avatar Tip & Tooltip
// ============================================================================

function Marker({
  marker,
  radius,
  defaultSize = 28,
  onClick,
  onHover,
}) {
  const [hovered, setHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const groupRef = useRef(null);
  const { camera } = useThree();

  // Surface position (where the pin touches the globe)
  const surfacePosition = useMemo(() => {
    return latLngToVector3(marker.lat, marker.lng, radius * 1.003);
  }, [marker.lat, marker.lng, radius]);

  // Surface normal quaternion for orienting surface ring
  const surfaceQuaternion = useMemo(() => {
    const normal = surfacePosition.clone().normalize();
    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
    return quaternion;
  }, [surfacePosition]);

  // Check if marker is facing the camera
  useFrame(() => {
    if (!groupRef.current) return;

    const worldPos = new THREE.Vector3();
    groupRef.current.getWorldPosition(worldPos);

    const markerDirection = worldPos.clone().normalize();
    const cameraDirection = camera.position.clone().normalize();
    const dot = markerDirection.dot(cameraDirection);

    // Show marker only if facing camera
    setIsVisible(dot > 0.08);
  });

  const handlePointerEnter = useCallback(() => {
    setHovered(true);
    onHover?.(marker);
  }, [marker, onHover]);

  const handlePointerLeave = useCallback(() => {
    setHovered(false);
    onHover?.(null);
  }, [onHover]);

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    onClick?.(marker);
  }, [marker, onClick]);

  const isActive = hovered || marker.active;

  return (
    <group ref={groupRef} position={surfacePosition} visible={isVisible}>
      {/* 3D Pulsing Ground Ring on Globe Surface */}
      <mesh quaternion={surfaceQuaternion}>
        <ringGeometry args={[0.015, 0.03, 24]} />
        <meshBasicMaterial
          color={isActive ? "#60a5fa" : "#38bdf8"}
          transparent
          opacity={isActive ? 0.9 : 0.6}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Unified Connected HTML Pin (Pin Dot + Stem Line + Avatar + Tooltip) */}
      <Html
        transform={false}
        center
        distanceFactor={10}
        style={{
          pointerEvents: isVisible ? "auto" : "none",
          opacity: isVisible ? 1 : 0,
          transition: "opacity 0.2s ease-out",
          transform: "translate(-50%, -100%)",
        }}
      >
        <div className="relative flex flex-col items-center select-none cursor-pointer">
          {/* Place Tooltip Card Floating Above Avatar (Reduced compact size with state & city) */}
          {isActive && (
            <div
              className="absolute bottom-full mb-2 px-2.5 py-1.5 rounded-xl bg-slate-950/95 border border-slate-700/80 shadow-xl backdrop-blur-md text-white whitespace-nowrap pointer-events-none z-50 text-center animate-in fade-in zoom-in-95 duration-150 ring-1 ring-white/10"
              style={{ transform: "translateY(-2px)" }}
            >
              <div className="text-[11px] font-bold text-white flex items-center justify-center gap-1.5 leading-tight">
                <span>{marker.label || marker.name}</span>
                {marker.temp !== undefined && (
                  <span className="text-blue-400 font-black text-[11px]">{marker.temp}</span>
                )}
              </div>
              <div className="text-[9px] text-slate-300 mt-0.5 flex items-center justify-center gap-1">
                {marker.state && (
                  <span className="font-semibold text-emerald-400">{marker.state}</span>
                )}
                {marker.state && marker.condition && <span>•</span>}
                {marker.condition && <span>{marker.condition}</span>}
              </div>
              {/* Downward Caret Arrow Connecting Tooltip to Avatar Tip */}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-x-[3.5px] border-x-transparent border-t-[5px] border-t-slate-950" />
            </div>
          )}

          {/* Avatar Tip Circle (Compact Sleek Size) */}
          <div
            className={cn(
              "relative rounded-full bg-slate-900 shadow-xl border-2 transition-all duration-300 flex items-center justify-center overflow-hidden",
              isActive
                ? "border-blue-400 ring-2 ring-blue-500/40 scale-120 shadow-blue-500/50"
                : "border-white/90 hover:scale-110 hover:border-blue-400 shadow-black/60"
            )}
            style={{
              width: `${marker.size || defaultSize}px`,
              height: `${marker.size || defaultSize}px`,
            }}
            onMouseEnter={handlePointerEnter}
            onMouseLeave={handlePointerLeave}
            onClick={handleClick}
          >
            {marker.src ? (
              <img
                src={marker.src}
                alt={marker.label || marker.name || "Place"}
                className="h-full w-full object-cover rounded-full"
                draggable={false}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-[10px] flex items-center justify-center">
                {(marker.label || marker.name || "W").charAt(0)}
              </div>
            )}
          </div>

          {/* Connecting Pin Stem Line */}
          <div
            className={cn(
              "w-0.5 transition-all duration-200",
              isActive
                ? "h-4.5 bg-gradient-to-b from-blue-400 to-blue-600 shadow-sm shadow-blue-400"
                : "h-3.5 bg-gradient-to-b from-slate-200 to-blue-500 opacity-80"
            )}
          />

          {/* Base Pin Dot touching the Globe Surface */}
          <div
            className={cn(
              "rounded-full transition-all duration-200",
              isActive
                ? "w-2 h-2 bg-blue-400 ring-2 ring-blue-500/40 shadow-sm shadow-blue-400"
                : "w-1.5 h-1.5 bg-blue-500 ring-1 ring-white/60"
            )}
          />
        </div>
      </Html>
    </group>
  );
}

// ============================================================================
// Rotating Globe with Markers
// ============================================================================

function RotatingGlobe({
  config,
  markers = [],
  onMarkerClick,
  onMarkerHover,
}) {
  const groupRef = useRef(null);

  // Load Earth textures
  const [earthTexture, bumpTexture] = useTexture([
    config.textureUrl,
    config.bumpMapUrl,
  ]);

  // Configure textures
  useEffect(() => {
    if (earthTexture) {
      earthTexture.colorSpace = THREE.SRGBColorSpace;
      earthTexture.anisotropy = 16;
    }
    if (bumpTexture) {
      bumpTexture.anisotropy = 8;
    }
  }, [earthTexture, bumpTexture]);

  // Create geometries
  const geometry = useMemo(() => {
    return new THREE.SphereGeometry(config.radius, 64, 64);
  }, [config.radius]);

  const wireframeGeometry = useMemo(() => {
    return new THREE.SphereGeometry(config.radius * 1.002, 32, 16);
  }, [config.radius]);

  return (
    <group ref={groupRef}>
      {/* Main globe mesh with Earth Blue Marble texture */}
      <mesh geometry={geometry}>
        <meshStandardMaterial
          map={earthTexture}
          bumpMap={bumpTexture}
          bumpScale={config.bumpScale * 0.05}
          roughness={0.65}
          metalness={0.05}
        />
      </mesh>

      {/* Optional wireframe overlay */}
      {config.showWireframe && (
        <mesh geometry={wireframeGeometry}>
          <meshBasicMaterial
            color={config.wireframeColor}
            wireframe
            transparent
            opacity={0.08}
          />
        </mesh>
      )}

      {/* Markers with Avatar tips and place tooltips */}
      {markers.map((marker, index) => (
        <Marker
          key={`marker-${index}-${marker.lat}-${marker.lng}`}
          marker={marker}
          radius={config.radius}
          defaultSize={config.markerSize || 28}
          onClick={onMarkerClick}
          onHover={onMarkerHover}
        />
      ))}
    </group>
  );
}

// ============================================================================
// Atmosphere Component
// ============================================================================

function Atmosphere({ radius, color, intensity, blur }) {
  const fresnelPower = Math.max(0.5, 5 - blur);

  const atmosphereMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        atmosphereColor: { value: new THREE.Color(color) },
        intensity: { value: intensity },
        fresnelPower: { value: fresnelPower },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 atmosphereColor;
        uniform float intensity;
        uniform float fresnelPower;
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          float fresnel = pow(1.0 - abs(dot(vNormal, normalize(-vPosition))), fresnelPower);
          gl_FragColor = vec4(atmosphereColor, fresnel * intensity);
        }
      `,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
    });
  }, [color, intensity, fresnelPower]);

  return (
    <mesh scale={[1.14, 1.14, 1.14]}>
      <sphereGeometry args={[radius, 64, 32]} />
      <primitive object={atmosphereMaterial} attach="material" />
    </mesh>
  );
}

// ============================================================================
// Scene Component
// ============================================================================

function Scene({ markers, config, onMarkerClick, onMarkerHover, controlsRef }) {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 0, config.radius * 3.4);
    camera.lookAt(0, 0, 0);
  }, [camera, config.radius]);

  return (
    <>
      {/* Lighting setup */}
      <ambientLight intensity={config.ambientIntensity} />
      <directionalLight
        position={[config.radius * 5, config.radius * 2, config.radius * 5]}
        intensity={config.pointLightIntensity}
        color="#ffffff"
      />
      <directionalLight
        position={[-config.radius * 3, config.radius, -config.radius * 2]}
        intensity={config.pointLightIntensity * 0.4}
        color="#93c5fd"
      />

      {/* Rotating Globe with Avatar Pins */}
      <RotatingGlobe
        config={config}
        markers={markers}
        onMarkerClick={onMarkerClick}
        onMarkerHover={onMarkerHover}
      />

      {/* Atmosphere Glow */}
      {config.showAtmosphere && (
        <Atmosphere
          radius={config.radius}
          color={config.atmosphereColor}
          intensity={config.atmosphereIntensity}
          blur={config.atmosphereBlur}
        />
      )}

      {/* Smooth OrbitControls */}
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enablePan={config.enablePan}
        enableZoom={config.enableZoom}
        minDistance={config.minDistance}
        maxDistance={config.maxDistance}
        rotateSpeed={0.5}
        autoRotate={config.autoRotateSpeed > 0}
        autoRotateSpeed={config.autoRotateSpeed}
        enableDamping
        dampingFactor={0.08}
      />
    </>
  );
}

// ============================================================================
// Loading Fallback
// ============================================================================

function LoadingFallback() {
  return (
    <Html center>
      <div className="flex shrink-0 flex-col items-center gap-3 bg-slate-900/80 px-4 py-2 rounded-2xl border border-slate-800 backdrop-blur-md">
        <span className="inline-block shrink-0 text-xs font-semibold text-blue-400 animate-pulse">
          Loading 3D Realistic Earth & Textures...
        </span>
      </div>
    </Html>
  );
}

// ============================================================================
// Main Globe3D Component
// ============================================================================

const defaultConfig = {
  radius: 2,
  globeColor: "#0f172a",
  textureUrl: DEFAULT_EARTH_TEXTURE,
  bumpMapUrl: DEFAULT_BUMP_TEXTURE,
  showAtmosphere: true,
  atmosphereColor: "#38bdf8",
  atmosphereIntensity: 0.65,
  atmosphereBlur: 2.5,
  bumpScale: 1.2,
  autoRotateSpeed: 0.4,
  enableZoom: true,
  enablePan: false,
  minDistance: 4.5,
  maxDistance: 9,
  initialRotation: { x: 0, y: 0 },
  markerSize: 28,
  showWireframe: false,
  wireframeColor: "#38bdf8",
  ambientIntensity: 0.7,
  pointLightIntensity: 1.6,
  backgroundColor: null,
};

export function Globe3D({
  markers = [],
  config = {},
  className,
  onMarkerClick,
  onMarkerHover,
}) {
  const controlsRef = useRef(null);
  const mergedConfig = useMemo(
    () => ({ ...defaultConfig, ...config }),
    [config],
  );

  return (
    <div className={cn("relative h-[560px] w-full", className)}>
      <Canvas
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        dpr={[1, 2]}
        camera={{
          fov: 45,
          near: 0.1,
          far: 1000,
          position: [0, 0, mergedConfig.radius * 3.4],
        }}
        style={{
          background: mergedConfig.backgroundColor || "transparent",
        }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <Scene
            markers={markers}
            config={mergedConfig}
            onMarkerClick={onMarkerClick}
            onMarkerHover={onMarkerHover}
            controlsRef={controlsRef}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default Globe3D;

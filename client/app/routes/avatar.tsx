import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { Route } from "../+types/root";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, useGLTF } from "@react-three/drei";
import * as THREE from "three";

// Simple config to make swapping the file trivial. Replace the string below
// with your model filename in /public (e.g., "avatar-1.glb").
const DEFAULT_MODEL_FILE = "avatar-1.glb";

type MorphMap = Record<string, number>;

function AvatarModel({ url, activeMorphs }: { url: string; activeMorphs: MorphMap }) {
  // drei's useGLTF automatically serves from /public when given a relative URL
  const { scene } = useGLTF(url);
  const groupRef = useRef<THREE.Group>(null);

  // Collect all SkinnedMesh/meshes that contain morph targets
  const morphMeshes = useMemo(() => {
    const meshes: THREE.Mesh[] = [];
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.morphTargetInfluences && mesh.morphTargetInfluences.length > 0) {
        meshes.push(mesh);
      }
    });
    return meshes;
  }, [scene]);

  // Apply current morph influences from activeMorphs on every frame for smoothness
  useFrame(() => {
    morphMeshes.forEach((mesh) => {
      const dict = mesh.morphTargetDictionary ?? {};
      const infl = mesh.morphTargetInfluences ?? [];
      Object.keys(activeMorphs).forEach((name) => {
        const idx = (dict as Record<string, number>)[name];
        if (idx !== undefined) {
          infl[idx] = activeMorphs[name];
        }
      });
    });
  });

  // Ensure the scene is centered/scaled reasonably
  useEffect(() => {
    if (!groupRef.current) return;
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 1 / (maxDim || 1);
    groupRef.current.scale.setScalar(scale);
    const center = box.getCenter(new THREE.Vector3());
    groupRef.current.position.sub(center.multiplyScalar(scale));
  }, [scene]);

  return <primitive ref={groupRef} object={scene} />;
}

function MorphControls({ url, onChange }: { url: string; onChange: (values: MorphMap) => void }) {
  const { scene } = useGLTF(url);
  const [morphNames, setMorphNames] = useState<string[]>([]);
  const [values, setValues] = useState<MorphMap>({});

  // Discover morph target names across meshes
  useEffect(() => {
    const nameSet = new Set<string>();
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      const dict = mesh.morphTargetDictionary as Record<string, number> | undefined;
      if (dict) Object.keys(dict).forEach((k) => nameSet.add(k));
    });
    const names = Array.from(nameSet).sort();
    setMorphNames(names);
    const initial: MorphMap = {};
    names.forEach((n) => (initial[n] = 0));
    setValues(initial);
    onChange(initial);
  }, [scene, onChange]);

  const handleSet = (name: string, v: number) => {
    setValues((prev) => {
      const next = { ...prev, [name]: v };
      onChange(next);
      return next;
    });
  };

  const handlePulse = (name: string) => {
    // Simple pulse animation: ramp up to 1 then back to 0 over ~0.6s
    const steps = 20;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      const t = i / steps;
      const v = t < 0.5 ? t * 2 : (1 - t) * 2;
      handleSet(name, Math.max(0, Math.min(1, v)));
      if (i >= steps) {
        clearInterval(id);
        handleSet(name, 0);
      }
    }, 30);
  };

  return (
    <div className="flex flex-col gap-2 max-h-[60vh] overflow-auto">
      {morphNames.length === 0 ? (
        <div className="text-sm opacity-70">No morph targets found.</div>
      ) : (
        morphNames.map((name) => (
          <div key={name} className="flex items-center gap-2">
            <div className="w-48 truncate" title={name}>{name}</div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={values[name] ?? 0}
              onChange={(e) => handleSet(name, parseFloat(e.target.value))}
              className="flex-1"
            />
            <button className="px-2 py-1 border rounded" onClick={() => handlePulse(name)}>
              Pulse
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default function AvatarRoute() {
  const [modelFile, setModelFile] = useState<string>(DEFAULT_MODEL_FILE);
  const [morphs, setMorphs] = useState<MorphMap>({});

  return (
    <main className="p-4 container mx-auto flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Avatar Preview</h1>
      <div className="flex items-center gap-2">
        <label className="text-sm">Model file in /public:</label>
        <input
          className="border rounded px-2 py-1 w-72"
          value={modelFile}
          onChange={(e) => setModelFile(e.target.value)}
        />
        <span className="text-xs opacity-60">Replace this text with your filename</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 h-[60vh] rounded overflow-hidden border">
          <Canvas camera={{ position: [0, 0.5, 2.2], fov: 50 }}>
            <color attach="background" args={["#111315"]} />
            <ambientLight intensity={0.6} />
            <directionalLight position={[2, 2, 2]} intensity={0.8} />
            <Suspense fallback={null}>
              <AvatarModel url={"/" + modelFile} activeMorphs={morphs} />
              <Environment preset="city" />
            </Suspense>
            <OrbitControls enableDamping makeDefault />
          </Canvas>
        </div>
        <div className="border rounded p-3">
          <Suspense fallback={<div>Loading morphs…</div>}>
            <MorphControls url={"/" + modelFile} onChange={setMorphs} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Avatar" },
    { name: "description", content: "Preview GLB and control morph targets" },
  ];
}

useGLTF.preload("/" + DEFAULT_MODEL_FILE);


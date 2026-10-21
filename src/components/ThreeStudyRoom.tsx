import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  Lightbulb,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp,
  Volume2,
  VolumeX,
  Compass,
  Sparkles,
} from 'lucide-react';
import { Language } from '../types/index.ts';

interface ThreeStudyRoomProps {
  language: Language;
}

export const ThreeStudyRoom: React.FC<ThreeStudyRoomProps> = ({ language }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [lampOn, setLampOn] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [ambientAudio, setAmbientAudio] = useState(false);
  const [activeView, setActiveView] = useState<'overview' | 'desk' | 'laptop'>('overview');

  // Ref to hold mutable Three.js items for handlers
  const sceneStateRef = useRef<{
    lampLight?: THREE.PointLight;
    lampBulbMat?: THREE.MeshStandardMaterial;
    controls?: OrbitControls;
    camera?: THREE.PerspectiveCamera;
    targetCamPos?: THREE.Vector3;
    targetLookAt?: THREE.Vector3;
  }>({});

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#070c1a');
    scene.fog = new THREE.FogExp2('#070c1a', 0.04);

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 420;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(4.5, 3.8, 5.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 2. RoomEnvironment via PMREMGenerator
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 3. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.05; // don't go below floor
    controls.minDistance = 2.5;
    controls.maxDistance = 12;
    controls.target.set(0, 0.9, 0);
    controls.update();

    sceneStateRef.current.controls = controls;
    sceneStateRef.current.camera = camera;
    sceneStateRef.current.targetCamPos = camera.position.clone();
    sceneStateRef.current.targetLookAt = controls.target.clone();

    // 4. Studio PBR Lighting Rig
    const hemiLight = new THREE.HemisphereLight('#38bdf8', '#0b1329', 0.8);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight('#fef3c7', 2.0);
    keyLight.position.set(4, 6, 3);
    keyLight.castShadow = !isSoftwareGl;
    if (!isSoftwareGl) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.camera.near = 0.5;
      keyLight.shadow.camera.far = 15;
      const d = 3.5;
      keyLight.shadow.camera.left = -d;
      keyLight.shadow.camera.right = d;
      keyLight.shadow.camera.top = d;
      keyLight.shadow.camera.bottom = -d;
    }
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight('#60a5fa', 0.6);
    fillLight.position.set(-4, 3, -3);
    scene.add(fillLight);

    // 5. Floor & Contact Shadows Ground
    const floorGeo = new THREE.PlaneGeometry(16, 16);
    const floorMat = new THREE.MeshStandardMaterial({
      color: '#091126',
      roughness: 0.85,
      metalness: 0.1,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = !isSoftwareGl;
    scene.add(floor);

    // Soft contact shadow circle directly under study desk
    const contactCanvas = document.createElement('canvas');
    contactCanvas.width = 256;
    contactCanvas.height = 256;
    const ctx = contactCanvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(128, 128, 20, 128, 128, 128);
    grad.addColorStop(0, 'rgba(3, 7, 18, 0.8)');
    grad.addColorStop(0.5, 'rgba(3, 7, 18, 0.4)');
    grad.addColorStop(1, 'rgba(3, 7, 18, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    const contactTex = new THREE.CanvasTexture(contactCanvas);
    const contactShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 2.4),
      new THREE.MeshBasicMaterial({
        map: contactTex,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
      })
    );
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.set(0, 0.01, 0);
    scene.add(contactShadow);

    // 6. Composite 3–12 Part Procedural Models: The Study Desk (THREE.Group)
    const deskGroup = new THREE.Group();

    // Part 1: Solid Walnut Desk Tabletop with beveled finish
    const topGeo = new THREE.BoxGeometry(2.4, 0.08, 1.3);
    const topMat = new THREE.MeshStandardMaterial({
      color: '#1a243d',
      roughness: 0.4,
      metalness: 0.2,
    });
    const topMesh = new THREE.Mesh(topGeo, topMat);
    topMesh.position.y = 1.0;
    topMesh.castShadow = !isSoftwareGl;
    topMesh.receiveShadow = !isSoftwareGl;
    deskGroup.add(topMesh);

    // Part 2: Matte Steel Desk Frame & Legs (4 legs + crossbars)
    const legGeo = new THREE.CylinderGeometry(0.03, 0.025, 0.96, 16);
    const legMat = new THREE.MeshStandardMaterial({
      color: '#2a3b63',
      roughness: 0.35,
      metalness: 0.8,
    });
    const legPositions = [
      [-1.1, 0.48, -0.55],
      [1.1, 0.48, -0.55],
      [-1.1, 0.48, 0.55],
      [1.1, 0.48, 0.55],
    ];
    legPositions.forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(x, y, z);
      leg.castShadow = !isSoftwareGl;
      deskGroup.add(leg);

      // Part 3: Brass feet accents
      const foot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.035, 0.03, 16),
        new THREE.MeshStandardMaterial({ color: '#f59e0b', roughness: 0.25, metalness: 0.9 })
      );
      foot.position.set(x, 0.015, z);
      deskGroup.add(foot);
    });

    // Part 4: Desk Drawer unit on right side
    const drawer = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.35, 0.95),
      new THREE.MeshStandardMaterial({ color: '#131b30', roughness: 0.5, metalness: 0.25 })
    );
    drawer.position.set(0.75, 0.78, 0);
    drawer.castShadow = !isSoftwareGl;
    deskGroup.add(drawer);

    // Drawer handle
    const handle = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.02, 0.03),
      new THREE.MeshStandardMaterial({ color: '#38bdf8', roughness: 0.2, metalness: 0.9 })
    );
    handle.position.set(0.75, 0.8, 0.49);
    deskGroup.add(handle);

    // 7. Composite Procedural Model: Study Lamp (4 distinct parts + PointLight)
    const lampGroup = new THREE.Group();
    lampGroup.position.set(-0.85, 1.04, -0.35);

    // Lamp Base
    const lampBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.14, 0.03, 32),
      new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.3, metalness: 0.85 })
    );
    lampGroup.add(lampBase);

    // Lamp Stem
    const stemCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.05, 0.35, -0.05),
      new THREE.Vector3(0.15, 0.6, 0.1),
    ]);
    const stemGeo = new THREE.TubeGeometry(stemCurve, 20, 0.018, 12, false);
    const stemMat = new THREE.MeshStandardMaterial({ color: '#f59e0b', roughness: 0.25, metalness: 0.9 });
    const stem = new THREE.Mesh(stemGeo, stemMat);
    lampGroup.add(stem);

    // Lamp Shade Hood
    const shade = new THREE.Mesh(
      new THREE.ConeGeometry(0.14, 0.2, 24, 1, true),
      new THREE.MeshStandardMaterial({
        color: '#1e293b',
        roughness: 0.3,
        metalness: 0.7,
        side: THREE.DoubleSide,
      })
    );
    shade.position.set(0.18, 0.58, 0.14);
    shade.rotation.x = Math.PI / 3;
    lampGroup.add(shade);

    // Glowing Bulb interior
    const bulbMat = new THREE.MeshStandardMaterial({
      color: '#fef3c7',
      emissive: '#fef08a',
      emissiveIntensity: 2.2,
      roughness: 0.1,
    });
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.04, 16, 16), bulbMat);
    bulb.position.set(0.18, 0.55, 0.12);
    lampGroup.add(bulb);
    sceneStateRef.current.lampBulbMat = bulbMat;

    // Warm study desk lamp light
    const lampLight = new THREE.PointLight('#fed7aa', 3.5, 4.0, 1.5);
    lampLight.position.set(0.18, 0.52, 0.12);
    lampLight.castShadow = !isSoftwareGl;
    lampGroup.add(lampLight);
    sceneStateRef.current.lampLight = lampLight;

    deskGroup.add(lampGroup);

    // 8. Composite Procedural Model: Student Laptop with Code/Notes Screen
    const laptopGroup = new THREE.Group();
    laptopGroup.position.set(0.0, 1.04, -0.05);

    // Base chassis
    const laptopBase = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.02, 0.38),
      new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.25, metalness: 0.85 })
    );
    laptopGroup.add(laptopBase);

    // Procedural Screen Texture (C code & StudySaathi notes)
    const screenCanvas = document.createElement('canvas');
    screenCanvas.width = 512;
    screenCanvas.height = 320;
    const sCtx = screenCanvas.getContext('2d')!;
    sCtx.fillStyle = '#080e1e';
    sCtx.fillRect(0, 0, 512, 320);

    // Code lines
    sCtx.fillStyle = '#38bdf8';
    sCtx.font = 'bold 18px monospace';
    sCtx.fillText('// StudySaathi • Target: Pointers in C', 24, 38);
    sCtx.fillStyle = '#94a3b8';
    sCtx.font = '14px monospace';
    sCtx.fillText('#include <stdio.h>', 24, 70);
    sCtx.fillText('int main() {', 24, 94);
    sCtx.fillStyle = '#34d399';
    sCtx.fillText('  int examDaysLeft = 4; // C Programming', 24, 120);
    sCtx.fillText('  int *ptr = &examDaysLeft;', 24, 144);
    sCtx.fillStyle = '#f59e0b';
    sCtx.fillText('  printf("Focus Pomodoro 25m: %d", *ptr);', 24, 168);
    sCtx.fillStyle = '#94a3b8';
    sCtx.fillText('  return 0;', 24, 192);
    sCtx.fillText('}', 24, 216);

    // Mini UI progress bar on screen
    sCtx.fillStyle = '#1e293b';
    sCtx.fillRect(24, 250, 464, 16);
    sCtx.fillStyle = '#06b6d4';
    sCtx.fillRect(24, 250, 320, 16);
    sCtx.fillStyle = '#ffffff';
    sCtx.font = 'bold 12px sans-serif';
    sCtx.fillText('Today Progress: 70%', 36, 263);

    const screenTexture = new THREE.CanvasTexture(screenCanvas);
    screenTexture.colorSpace = THREE.SRGBColorSpace;

    // Laptop Lid / Screen
    const screenGroup = new THREE.Group();
    screenGroup.position.set(0, 0.01, -0.19);
    screenGroup.rotation.x = -Math.PI / 1.7; // open angle

    const screenBezel = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.38, 0.015),
      new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.3, metalness: 0.85 })
    );
    screenBezel.position.set(0, 0.19, 0);
    screenGroup.add(screenBezel);

    const screenMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.52, 0.34),
      new THREE.MeshStandardMaterial({
        map: screenTexture,
        roughness: 0.2,
        emissive: '#ffffff',
        emissiveMap: screenTexture,
        emissiveIntensity: 0.8,
      })
    );
    screenMesh.position.set(0, 0.19, 0.009);
    screenGroup.add(screenMesh);

    laptopGroup.add(screenGroup);
    deskGroup.add(laptopGroup);

    // 9. Composite Procedural Model: Open Engineering Textbook
    const bookGroup = new THREE.Group();
    bookGroup.position.set(0.65, 1.04, -0.1);
    bookGroup.rotation.y = -Math.PI / 7;

    // Hardcover base
    const bookCover = new THREE.Mesh(
      new THREE.BoxGeometry(0.48, 0.02, 0.34),
      new THREE.MeshStandardMaterial({ color: '#4f46e5', roughness: 0.5, metalness: 0.1 })
    );
    bookGroup.add(bookCover);

    // Fanned pages
    const bookPages = new THREE.Mesh(
      new THREE.BoxGeometry(0.46, 0.025, 0.32),
      new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.9, metalness: 0 })
    );
    bookPages.position.y = 0.018;
    bookGroup.add(bookPages);

    // Bookmark ribbon
    const ribbon = new THREE.Mesh(
      new THREE.BoxGeometry(0.015, 0.005, 0.36),
      new THREE.MeshStandardMaterial({ color: '#f43f5e', roughness: 0.3 })
    );
    ribbon.position.set(0, 0.032, 0);
    bookGroup.add(ribbon);

    deskGroup.add(bookGroup);

    // 10. Composite Procedural Model: Ceramic Coffee Cup & Steaming Focus
    const cupGroup = new THREE.Group();
    cupGroup.position.set(-0.55, 1.04, 0.25);

    const mug = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.04, 0.11, 24),
      new THREE.MeshStandardMaterial({ color: '#06b6d4', roughness: 0.2, metalness: 0.1 })
    );
    mug.position.y = 0.055;
    cupGroup.add(mug);

    // Coffee surface
    const coffeeLiquid = new THREE.Mesh(
      new THREE.CircleGeometry(0.046, 24),
      new THREE.MeshStandardMaterial({ color: '#3e2723', roughness: 0.1, metalness: 0.2 })
    );
    coffeeLiquid.rotation.x = -Math.PI / 2;
    coffeeLiquid.position.y = 0.1;
    cupGroup.add(coffeeLiquid);

    // Mug handle (Torus)
    const handleMug = new THREE.Mesh(
      new THREE.TorusGeometry(0.035, 0.009, 12, 24, Math.PI),
      new THREE.MeshStandardMaterial({ color: '#06b6d4', roughness: 0.2, metalness: 0.1 })
    );
    handleMug.position.set(-0.052, 0.055, 0);
    handleMug.rotation.z = Math.PI / 2;
    cupGroup.add(handleMug);

    deskGroup.add(cupGroup);

    // 11. Pen holder with colored highlighter pens
    const penHolder = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.045, 0.1, 24),
      new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.3, metalness: 0.7 })
    );
    penHolder.position.set(0.9, 1.09, 0.35);
    deskGroup.add(penHolder);

    const penColors = ['#f43f5e', '#38bdf8', '#fbbf24', '#34d399'];
    penColors.forEach((col, idx) => {
      const pen = new THREE.Mesh(
        new THREE.CylinderGeometry(0.006, 0.006, 0.14, 12),
        new THREE.MeshStandardMaterial({ color: col, roughness: 0.4 })
      );
      pen.position.set(0.89 + (idx % 2) * 0.02 - 0.01, 1.14, 0.34 + Math.floor(idx / 2) * 0.02 - 0.01);
      pen.rotation.z = (idx - 1.5) * 0.12;
      deskGroup.add(pen);
    });

    // 12. Floating ambient dust/motes particles around study lamp
    const particleCount = isSoftwareGl ? 20 : 60;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      particlePos[i * 3] = (Math.random() - 0.5) * 3;
      particlePos[i * 3 + 1] = 1.0 + Math.random() * 2;
      particlePos[i * 3 + 2] = (Math.random() - 0.5) * 3;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: '#fef08a',
      size: 0.03,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    scene.add(deskGroup);

    // Pre-warm shaders
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // 13. Animation Loop with Exponential Damping & Software WebGL Pacing
    let frameId = 0;
    let clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    const _targetPos = new THREE.Vector3();
    const _targetLook = new THREE.Vector3();

    function tick() {
      const delta = clock.getDelta();

      // Damped camera transition if view changed
      if (sceneStateRef.current.targetCamPos && sceneStateRef.current.targetLookAt) {
        camera.position.lerp(sceneStateRef.current.targetCamPos, 0.05);
        controls.target.lerp(sceneStateRef.current.targetLookAt, 0.05);
      }

      controls.update();

      // Gentle floating particles
      const positions = particles.geometry.attributes.position.array as Float32Array;
      for (let i = 1; i < particleCount * 3; i += 3) {
        positions[i] += Math.sin(clock.elapsedTime + i) * 0.0015;
      }
      particles.geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    // 14. Responsive Resize Listener
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Handle Lamp Toggle
  const toggleLamp = () => {
    const nextState = !lampOn;
    setLampOn(nextState);
    if (sceneStateRef.current.lampLight && sceneStateRef.current.lampBulbMat) {
      sceneStateRef.current.lampLight.intensity = nextState ? 3.5 : 0;
      sceneStateRef.current.lampBulbMat.emissiveIntensity = nextState ? 2.2 : 0;
    }
  };

  // Handle Camera Presets
  const setCameraView = (view: 'overview' | 'desk' | 'laptop') => {
    setActiveView(view);
    if (!sceneStateRef.current.targetCamPos || !sceneStateRef.current.targetLookAt) return;

    if (view === 'overview') {
      sceneStateRef.current.targetCamPos.set(4.5, 3.8, 5.2);
      sceneStateRef.current.targetLookAt.set(0, 0.9, 0);
    } else if (view === 'desk') {
      sceneStateRef.current.targetCamPos.set(0.2, 1.8, 2.2);
      sceneStateRef.current.targetLookAt.set(0, 1.1, 0);
    } else if (view === 'laptop') {
      sceneStateRef.current.targetCamPos.set(0.0, 1.35, 0.7);
      sceneStateRef.current.targetLookAt.set(0, 1.2, -0.05);
    }
  };

  // Toggle procedural binaural focus hum
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);

  const toggleFocusAudio = () => {
    const next = !ambientAudio;
    setAmbientAudio(next);
    try {
      if (next) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(144, ctx.currentTime); // calming 144Hz focus frequency
        gain.gain.setValueAtTime(0.015, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        oscRef.current = osc;
      } else {
        oscRef.current?.stop();
        audioCtxRef.current?.close();
      }
    } catch (e) {}
  };

  return (
    <div className="relative w-full rounded-2xl bg-[#070c1a] border border-[#1d2d54] overflow-hidden shadow-2xl">
      {/* 3D Canvas Mount Point */}
      <div
        ref={mountRef}
        className="w-full h-80 sm:h-96 cursor-grab active:cursor-grabbing"
      />

      {/* Top Overlay Badge */}
      <div className="absolute top-3 left-4 flex items-center gap-2 pointer-events-none">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0a1226]/90 border border-[#233c77] text-xs font-semibold text-cyan-300 backdrop-blur-md shadow-lg">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>{language === 'hinglish' ? '3D Study Zone • Three.js PBR' : '3D Focus Room • Three.js'}</span>
        </div>
        <span className="text-[11px] text-slate-400 hidden sm:inline bg-[#0a1226]/80 px-2 py-0.5 rounded-md border border-[#1b2b52]">
          {language === 'hinglish' ? 'Drag karke 360° ghumao' : 'Drag to rotate 360°'}
        </span>
      </div>

      {/* Unified Bottom Control Dock (<=15% viewport height, strictly collapsible) */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[92%] sm:w-auto z-20 transition-all duration-300">
        {/* Toggle Collapse Pill */}
        <div className="flex justify-center -mb-1">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-1 px-3 py-0.5 rounded-t-lg bg-[#0c1630] border-t border-x border-[#23386b] text-[10px] font-bold text-slate-300 hover:text-cyan-300 transition cursor-pointer"
          >
            {isCollapsed ? (
              <>
                <ChevronUp className="w-3 h-3" />
                <span>Show 3D Controls</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3" />
                <span>Hide Controls</span>
              </>
            )}
          </button>
        </div>

        {/* Control Bar Container */}
        {!isCollapsed && (
          <div className="p-2 sm:px-4 sm:py-2 rounded-xl bg-[#0b142c]/95 border border-[#233c77] shadow-2xl flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs">
            {/* Camera View Pills */}
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#070e22] border border-[#1a2d59]">
              <button
                onClick={() => setCameraView('overview')}
                className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
                  activeView === 'overview'
                    ? 'bg-cyan-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Room
              </button>
              <button
                onClick={() => setCameraView('desk')}
                className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
                  activeView === 'desk'
                    ? 'bg-cyan-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Desk
              </button>
              <button
                onClick={() => setCameraView('laptop')}
                className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
                  activeView === 'laptop'
                    ? 'bg-cyan-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Screen
              </button>
            </div>

            {/* Lamp Toggle Button */}
            <button
              onClick={toggleLamp}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer border ${
                lampOn
                  ? 'bg-amber-950/80 border-amber-600/60 text-amber-300'
                  : 'bg-[#121f3f] border-[#1f3366] text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle Desk Study Lamp"
            >
              <Lightbulb className={`w-3.5 h-3.5 ${lampOn ? 'fill-amber-400 text-amber-400' : ''}`} />
              <span>{lampOn ? (language === 'hinglish' ? 'Lamp On' : 'Lamp On') : (language === 'hinglish' ? 'Lamp Off' : 'Lamp Off')}</span>
            </button>

            {/* Binaural Focus Frequency Toggle */}
            <button
              onClick={toggleFocusAudio}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer border ${
                ambientAudio
                  ? 'bg-indigo-950/80 border-indigo-600/60 text-indigo-300'
                  : 'bg-[#121f3f] border-[#1f3366] text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle 144Hz Binaural Focus Tone"
            >
              {ambientAudio ? <Volume2 className="w-3.5 h-3.5 text-indigo-400" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{ambientAudio ? (language === 'hinglish' ? 'Zen Sound On' : '144Hz Zen') : (language === 'hinglish' ? 'Zen Sound' : 'Zen Sound')}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

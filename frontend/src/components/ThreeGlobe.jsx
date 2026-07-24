import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeGlobe = ({ isSimulating }) => {
    const mountRef = useRef(null);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        const width = mount.clientWidth || 650;
        const height = mount.clientHeight || 450;

        // 1. Scene, Camera, Renderer
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x020617); // Deep space black

        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(0, 20, 220);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        mount.appendChild(renderer.domElement);

        // 2. Starfield Particle Background
        const starsGeo = new THREE.BufferGeometry();
        const starCount = 2000;
        const starPositions = new Float32Array(starCount * 3);
        for (let i = 0; i < starCount * 3; i++) {
            starPositions[i] = (Math.random() - 0.5) * 900;
        }
        starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
        const starsMat = new THREE.PointsMaterial({ color: 0xcbd5e1, size: 1.2, transparent: true, opacity: 0.8 });
        const starField = new THREE.Points(starsGeo, starsMat);
        scene.add(starField);

        // 3. Realistic Sunlight & Ambient Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
        scene.add(ambientLight);

        const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
        sunLight.position.set(250, 150, 200);
        scene.add(sunLight);

        const backLight = new THREE.DirectionalLight(0x0284c7, 0.8);
        backLight.position.set(-200, -100, -150);
        scene.add(backLight);

        // 4. Photorealistic NASA Blue Marble Earth Texture Loading
        const radius = 68;
        const textureLoader = new THREE.TextureLoader();

        // High-Resolution NASA Satellite Textures
        const earthMapUrl = 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg';
        const bumpMapUrl = 'https://unpkg.com/three-globe/example/img/earth-topology.png';

        const earthTexture = textureLoader.load(earthMapUrl);
        const bumpTexture = textureLoader.load(bumpMapUrl);

        const earthGeo = new THREE.SphereGeometry(radius, 64, 64);
        const earthMat = new THREE.MeshPhongMaterial({
            map: earthTexture,
            bumpMap: bumpTexture,
            bumpScale: 1.5,
            shininess: 25,
            specular: new THREE.Color(0x1e3a8a)
        });
        const earth = new THREE.Mesh(earthGeo, earthMat);
        scene.add(earth);

        // 5. Realistic Atmospheric Shader Shell
        const atmosGeo = new THREE.SphereGeometry(radius + 4, 64, 64);
        const atmosMat = new THREE.MeshBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.18,
            side: THREE.BackSide
        });
        const atmosphere = new THREE.Mesh(atmosGeo, atmosMat);
        scene.add(atmosphere);

        // Helper to convert Lat/Lon to 3D Sphere Position
        const latLonToVector = (lat, lon, r) => {
            const phi = (90 - lat) * (Math.PI / 180);
            const theta = (lon + 180) * (Math.PI / 180);
            return new THREE.Vector3(
                -(r * Math.sin(phi) * Math.cos(theta)),
                r * Math.cos(phi),
                r * Math.sin(phi) * Math.sin(theta)
            );
        };

        // Exact Geolocated Cities
        const cities = [
            { name: 'Seoul', country: '🇰🇷 S. KOREA', lat: 37.56, lon: 126.97, color: 0x10b981 },
            { name: 'Berlin', country: '🇩🇪 GERMANY', lat: 52.52, lon: 13.40, color: 0x38bdf8 },
            { name: 'Rochester', country: '🇺🇸 USA', lat: 44.02, lon: -92.46, color: 0xa855f7 },
            { name: 'Stanford', country: '🇺🇸 USA', lat: 37.43, lon: -122.17, color: 0x06b6d4 }
        ];

        const nodeGroup = new THREE.Group();

        cities.forEach(city => {
            const pos = latLonToVector(city.lat, city.lon, radius + 1);

            // Glowing City Pin
            const pinGeo = new THREE.SphereGeometry(3.0, 16, 16);
            const pinMat = new THREE.MeshBasicMaterial({ color: city.color });
            const pin = new THREE.Mesh(pinGeo, pinMat);
            pin.position.copy(pos);
            nodeGroup.add(pin);

            // Pulsing Vertical Laser Beacon
            const rayEnd = latLonToVector(city.lat, city.lon, radius + 28);
            const rayGeo = new THREE.BufferGeometry().setFromPoints([pos, rayEnd]);
            const rayMat = new THREE.LineBasicMaterial({ color: city.color, linewidth: 2 });
            const rayLine = new THREE.Line(rayGeo, rayMat);
            nodeGroup.add(rayLine);
        });

        earth.add(nodeGroup);

        // 6. 3D Arching Flight Connections
        const arcGroup = new THREE.Group();
        const connections = [
            [0, 1], // Seoul -> Berlin
            [1, 2], // Berlin -> Rochester (Mayo Clinic)
            [2, 3], // Rochester -> Stanford
            [3, 0]  // Stanford -> Seoul
        ];

        connections.forEach(([fromIdx, toIdx]) => {
            const c1 = cities[fromIdx];
            const c2 = cities[toIdx];

            const p1 = latLonToVector(c1.lat, c1.lon, radius);
            const p2 = latLonToVector(c2.lat, c2.lon, radius);

            const distance = p1.distanceTo(p2);
            const midHeight = radius + Math.min(distance * 0.35, 45);
            const mid = p1.clone().add(p2).multiplyScalar(0.5).normalize().multiplyScalar(midHeight);

            const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
            const points = curve.getPoints(60);
            const arcGeo = new THREE.BufferGeometry().setFromPoints(points);

            const arcMat = new THREE.LineBasicMaterial({
                color: 0x38bdf8,
                transparent: true,
                opacity: 0.85
            });
            const arcLine = new THREE.Line(arcGeo, arcMat);
            arcGroup.add(arcLine);
        });

        earth.add(arcGroup);

        // 7. Interactive Controls & Animation Loop
        let animId;
        let isDragging = false;
        let prevMouse = { x: 0, y: 0 };

        const onMouseDown = (e) => {
            isDragging = true;
            prevMouse = { x: e.clientX, y: e.clientY };
        };

        const onMouseMove = (e) => {
            if (!isDragging) return;
            const dx = e.clientX - prevMouse.x;
            const dy = e.clientY - prevMouse.y;

            earth.rotation.y += dx * 0.006;
            earth.rotation.x += dy * 0.006;

            prevMouse = { x: e.clientX, y: e.clientY };
        };

        const onMouseUp = () => { isDragging = false; };

        const domElem = renderer.domElement;
        domElem.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);

        const animate = () => {
            animId = requestAnimationFrame(animate);

            if (!isDragging) {
                earth.rotation.y += isSimulating ? 0.012 : 0.003;
            }

            starField.rotation.y += 0.0003;

            renderer.render(scene, camera);
        };

        animate();

        return () => {
            cancelAnimationFrame(animId);
            domElem.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            if (mount.contains(renderer.domElement)) {
                mount.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, [isSimulating]);

    return (
        <div className="relative size-full flex items-center justify-center cursor-grab active:cursor-grabbing select-none rounded-3xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-950">
            <div ref={mountRef} className="w-full h-88 sm:h-[420px]" />
        </div>
    );
};

export default ThreeGlobe;

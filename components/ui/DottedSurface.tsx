
import { cn } from '../../lib/utils';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

type DottedSurfaceProps = Omit<React.ComponentProps<'div'>, 'ref'>;

export function DottedSurface({ className, ...props }: DottedSurfaceProps) {
    // Removed Next.js useTheme hook, defaulting to light mode logic or checking system preference if needed.
    // For Render XYZ, adapting to a specific look (dark dots on light bg or vice versa).
    const isDark = false; // Force light mode style for now based on current branding

    const containerRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<{
        scene: THREE.Scene;
        camera: THREE.PerspectiveCamera;
        renderer: THREE.WebGLRenderer;
        particles: THREE.Points[];
        animationId: number;
        count: number;
    } | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const SEPARATION = 150;
        const AMOUNTX = 40;
        const AMOUNTY = 60;

        // Scene setup
        const scene = new THREE.Scene();
        // Adjust fog to match background color
        const fogColor = 0xF2F2F2; // Render XYZ light bg color
        scene.fog = new THREE.Fog(fogColor, 2000, 10000); // Updated fog dist

        const camera = new THREE.PerspectiveCamera(
            60, // Changed FOV
            window.innerWidth / window.innerHeight,
            1,
            10000,
        );
        camera.position.set(0, 355, 1220);
        camera.lookAt(0, 0, 0); // Ensure camera looks at the particles

        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
        });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 0);

        containerRef.current.appendChild(renderer.domElement);

        // Create particles
        const particles: THREE.Points[] = [];
        const positions: number[] = [];
        const colors: number[] = [];

        // Create geometry for all particles
        const geometry = new THREE.BufferGeometry();

        for (let ix = 0; ix < AMOUNTX; ix++) {
            for (let iy = 0; iy < AMOUNTY; iy++) {
                const x = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
                const y = 0;
                const z = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2;

                positions.push(x, y, z);
                colors.push(0, 0, 0);
            }
        }

        geometry.setAttribute(
            'position',
            new THREE.Float32BufferAttribute(positions, 3),
        );
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        // Create material
        const material = new THREE.PointsMaterial({
            size: 8,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true,
        });

        // Create points object
        const points = new THREE.Points(geometry, material);
        scene.add(points);

        // Animation state
        let count = 0;
        let animationId: number;

        // Store references immediately so animate can access/update if needed
        const state = {
            scene,
            camera,
            renderer,
            particles: [points],
            animationId: 0,
            count: 0
        };
        sceneRef.current = state;

        // Animation function
        const animate = () => {
            state.animationId = requestAnimationFrame(animate);

            // Safety check
            if (!geometry.attributes.position) return;

            const positionAttribute = geometry.attributes.position;
            const positions = positionAttribute.array as Float32Array;

            let i = 0;
            for (let ix = 0; ix < AMOUNTX; ix++) {
                for (let iy = 0; iy < AMOUNTY; iy++) {
                    const index = i * 3;

                    // Animate Y position with sine waves
                    positions[index + 1] =
                        Math.sin((ix + count) * 0.3) * 50 +
                        Math.sin((iy + count) * 0.5) * 50;

                    i++;
                }
            }

            positionAttribute.needsUpdate = true;
            renderer.render(scene, camera);
            count += 0.1;
        };

        // Handle window resize
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', handleResize);

        // Start animation
        animate();

        // Cleanup function
        return () => {
            window.removeEventListener('resize', handleResize);
            if (state.animationId) {
                cancelAnimationFrame(state.animationId);
            }

            scene.traverse((object) => {
                if (object instanceof THREE.Points) {
                    geometry.dispose();
                    if (Array.isArray(material)) {
                        material.forEach((m) => m.dispose());
                    } else {
                        material.dispose();
                    }
                }
            });

            renderer.dispose();

            if (containerRef.current && renderer.domElement) {
                containerRef.current.removeChild(renderer.domElement);
            }
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className={cn('pointer-events-none fixed inset-0 -z-10 overflow-hidden', className)}
            {...props}
        />
    );
}

import { useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import * as THREE from "three";

export default function Scene() {
  const ref = useRef();
  const texture = useLoader(TextureLoader, "images/character.png"); // Put your image in `public/character.png`

  // Subtle floating animation
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    ref.current.position.y = Math.sin(t * 0.5) * 0.1;
  });

  return (
    <>
      {/* Character Image Plane */}
      <mesh ref={ref} position={[0, 0, 0]}>
        <planeGeometry args={[4, 3]} />
        <meshBasicMaterial map={texture} transparent />
      </mesh>

      {/* Handwriting Text */}
      <Html position={[0.5, 0.4, 0]} transform>
        <div
          style={{
            color: "#00ffff",
            fontFamily: "'Patrick Hand', cursive",
            fontSize: "1.2rem",
            textAlign: "left",
            width: "220px",
            lineHeight: "1.4",
            filter: "drop-shadow(0 0 5px #00ffff)",
          }}
        >
          Learn quantum computing<br />as Feynman teaching you
        </div>
      </Html>
    </>
  );
}

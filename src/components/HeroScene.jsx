// src/components/HeroScene.jsx
import React, { useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Image, Text } from "@react-three/drei"
import * as THREE from "three"

// ✅ CORRECT (for public folder)
const bgScene = "/images/character.png";

function Scene() {
  const imageRef = useRef()
  const textRef = useRef()
  const [textLength, setTextLength] = useState(0)

  const fullText = "Learn quantum computing as Feynman teaching you"

  // Animate the handwriting
  useFrame((state, delta) => {
    if (textLength < fullText.length) {
      setTextLength(prev => prev + 0.25) // Controls write speed
    }

    // Gentle floating animation
    if (imageRef.current) {
      imageRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.05
    }
  })

  return (
    <>
      {/* Background image with character, board, and neon ground */}
      <Image
        ref={imageRef}
        url={bgScene}
        scale={[3, 1.7, 1]}
        position={[0, 0, 0]}
      />

      {/* Handwriting animation */}
      <Text
        ref={textRef}
        position={[-0.7, 0.1, 0.1]} // Adjust this based on board location
        fontSize={0.08}
        maxWidth={1.8}
        color="white"
        anchorX="left"
        anchorY="middle"
        font="/fonts/handwriting.ttf" // Optional: Add a handwriting font
      >
        {fullText.substring(0, Math.floor(textLength))}
      </Text>
    </>
  )
}

export default function HeroScene() {
  return (
    <section className="w-full h-screen bg-black">
      <Canvas camera={{ position: [0, 0, 2.8], fov: 50 }}>
        <ambientLight intensity={1.2} />
        <Scene />
      </Canvas>
    </section>
  )
}


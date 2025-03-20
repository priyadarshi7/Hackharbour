import { useState } from "react"
import { MapIcon } from "lucide-react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, useGLTF, Text } from "@react-three/drei"

// Sample 3D Model component
function DuckModel(props) {
  const { scene } = useGLTF("/duck.glb")
  return <primitive object={scene} scale={2} position={[0, -1, 0]} {...props} />
}

// Tree model placeholder
function Tree({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      <mesh position={[0, 1, 0]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color="green" />
      </mesh>
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 2]} />
        <meshStandardMaterial color="brown" />
      </mesh>
    </group>
  )
}

// Ground/terrain component
function Terrain() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
      <planeGeometry args={[30, 30, 32, 32]} />
      <meshStandardMaterial color="#8B4513" wireframe={false} roughness={1} />
    </mesh>
  )
}

// Path component
function Path() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.48, 0]}>
      <planeGeometry args={[2, 15]} />
      <meshStandardMaterial color="#D2B48C" />
    </mesh>
  )
}

// Water body
function WaterBody() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[8, -1.4, 0]}>
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial color="#4682B4" transparent opacity={0.8} />
    </mesh>
  )
}

// Safari Map component
function SafariMap() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />

      <Terrain />
      <Path />
      <WaterBody />

      {/* Sample landmarks */}
      <DuckModel position={[3, 0, 2]} scale={0.5} />

      {/* Trees scattered around */}
      <Tree position={[-5, 0, -5]} />
      <Tree position={[-3, 0, -7]} />
      <Tree position={[-7, 0, -2]} />
      <Tree position={[5, 0, -5]} />
      <Tree position={[7, 0, -3]} />
      <Tree position={[4, 0, -8]} />
      <Tree position={[-5, 0, 5]} />
      <Tree position={[-8, 0, 3]} />

      {/* Map labels */}
      <Text position={[0, 0.5, 0]} color="black" fontSize={0.5} anchorX="center" anchorY="middle">
        Jungle Safari Raipur
      </Text>

      <Text position={[8, 0, 0]} color="black" fontSize={0.3} anchorX="center" anchorY="middle">
        Lake Area
      </Text>

      <OrbitControls enableZoom={true} maxPolarAngle={Math.PI / 2} minDistance={3} maxDistance={20} />
      <Environment preset="forest" />
    </>
  )
}

export default function SafariMapButton() {
  const [showMap, setShowMap] = useState(false)

  return (
    <>
      {/* Fixed position button in lower right */}
      <button
        onClick={() => setShowMap(true)}
        className="fixed bottom-6 right-6 bg-green-700 hover:bg-green-800 text-white p-4 rounded-full shadow-lg z-10 flex items-center justify-center transition-all duration-300 hover:scale-105"
        aria-label="Open 3D Safari Map"
      >
        <MapIcon className="w-6 h-6" />
      </button>

      {/* 3D Map Modal */}
      {showMap && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center">
          <div className="relative w-full h-full max-w-7xl max-h-[90vh] m-4 rounded-xl overflow-hidden">
            {/* Close button */}
            <button
              onClick={() => setShowMap(false)}
              className="absolute top-4 right-4 bg-white rounded-full p-2 z-10 hover:bg-gray-200 transition-colors"
              aria-label="Close map"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            {/* Instructions */}
            <div className="absolute bottom-4 left-4 bg-white bg-opacity-80 p-2 rounded z-10 text-sm">
              <p>Drag to rotate • Scroll to zoom • Double-click to reset view</p>
            </div>

            {/* 3D Canvas */}
            <Canvas camera={{ position: [0, 5, 10], fov: 50 }}>
              <SafariMap />
            </Canvas>
          </div>
        </div>
      )}
    </>
  )
}


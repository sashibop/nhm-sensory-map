import { Suspense } from 'react'
import { OrbitControls, Environment, Center } from '@react-three/drei'
import useAppStore from '../../store/useAppStore'
import Room from './Room' 

export default function Scene({ selectedDate }) {

  const showCrowd = useAppStore((state) => state.layers.crowd)

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} />
      <Environment preset="city" />

      <Suspense fallback={null}>
        <Center>
          <Room />

        </Center>
      </Suspense>

      <OrbitControls 
        makeDefault 
        maxPolarAngle={Math.PI / 2} 
        minDistance={2} 
        maxDistance={30} 
      />
    </>
  )
}
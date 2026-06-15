import { Suspense, useMemo, useRef, useEffect } from 'react'
import { Physics, RigidBody, CuboidCollider, BallCollider } from '@react-three/rapier'
import { Environment, useGLTF, useKeyboardControls, ContactShadows } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useAppStore from '../../store/useAppStore'

// ==========================================
// 1. CUSTOM KEYBOARD & CAMERA CONTROLLER
// ==========================================
function PlayerBall() {
    const bodyRef = useRef()
    const meshRef = useRef()
    const [, getKeys] = useKeyboardControls()

    // Pull the spawn position from your store
    const spawnPosition = useAppStore((state) => state.spawnPosition)

    const cameraAngle = useRef(0)
    const smoothCameraPos = useRef(new THREE.Vector3(0, 5, 10))
    const smoothLookAt = useRef(new THREE.Vector3(0, 5, 10))

    // 📡 TELEPORT LISTENER
    useEffect(() => {
        if (bodyRef.current && spawnPosition) {
            // Instantly move the physics body to the new coordinates
            bodyRef.current.setTranslation(spawnPosition, true)
            // Kill any leftover speed from rolling on the previous floor
            bodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
            bodyRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true)
        }
    }, [spawnPosition])

    useFrame((state, delta) => {
        const body = bodyRef.current
        if (!body) return

        const { forward, backward, leftward, rightward, jump } = getKeys()

        const turnSpeed = 2.5
        if (leftward) cameraAngle.current += turnSpeed * delta
        if (rightward) cameraAngle.current -= turnSpeed * delta

        const moveSpeed = 6
        const dir = new THREE.Vector3(0, 0, 0)
        if (forward) dir.z -= 1
        if (backward) dir.z += 1

        dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraAngle.current)
        dir.normalize().multiplyScalar(moveSpeed)

        const currentVel = body.linvel()
        let newYVelocity = currentVel.y

        if (jump && Math.abs(currentVel.y) < 0.1) {
            newYVelocity = 2
        }

        body.setLinvel({ x: dir.x, y: newYVelocity, z: dir.z }, true)


        // ---------------------------------------------------------
        // 💀 THE FAILSAFE: "KILL Z" RESPAWN SYSTEM
        // ---------------------------------------------------------
        const pos = body.translation()

        // If the ball falls 10 meters below the floor line...
        if (pos.y < -10) {
            console.log("Fell off the map! Respawning...")

            // Grab the last known safe spawn position from the store, 
            // OR default to the Floor 1 starting point if it's null
            const safeSpawn = spawnPosition || { x: 0, y: 5, z: 10 }

            // Instantly teleport the ball back up
            body.setTranslation(safeSpawn, true)

            // Kill all falling momentum
            body.setLinvel({ x: 0, y: 0, z: 0 }, true)
            body.setAngvel({ x: 0, y: 0, z: 0 }, true)
        }
        if (meshRef.current) {
            const hoverOffset = 0.55 // Offsets the visual mesh from the big physics ball
            meshRef.current.position.set(
                pos.x,
                pos.y + hoverOffset + Math.sin(state.clock.elapsedTime * 2) * 0.03,
                pos.z
            )
        }

        // ---------------------------------------------------------
        // 🎥 SMOOTH CAMERA
        // ---------------------------------------------------------
        const visualY = pos.y + 0.55

        const cameraDistance = 1
        const cameraHeight = 0.5

        const targetCamX = pos.x + Math.sin(cameraAngle.current) * cameraDistance
        const targetCamZ = pos.z + Math.cos(cameraAngle.current) * cameraDistance
        const targetCamY = visualY + cameraHeight

        smoothCameraPos.current.x = THREE.MathUtils.lerp(smoothCameraPos.current.x, targetCamX, delta * 10)
        smoothCameraPos.current.z = THREE.MathUtils.lerp(smoothCameraPos.current.z, targetCamZ, delta * 10)
        smoothCameraPos.current.y = THREE.MathUtils.lerp(smoothCameraPos.current.y, targetCamY, delta * 6)

        state.camera.position.copy(smoothCameraPos.current)

        smoothLookAt.current.x = THREE.MathUtils.lerp(smoothLookAt.current.x, pos.x, delta * 10)
        smoothLookAt.current.y = THREE.MathUtils.lerp(smoothLookAt.current.y, visualY, delta * 6)
        smoothLookAt.current.z = THREE.MathUtils.lerp(smoothLookAt.current.z, pos.z, delta * 10)

        state.camera.lookAt(smoothLookAt.current)
    })

    return (
        <group>
            <RigidBody
                ref={bodyRef}
                colliders={false}
                position={[0, 2, 10]}
                mass={1}
                friction={0.5}
                restitution={0}
            >
                {/* A much larger invisible ball that easily rolls over high steps */}
                <BallCollider args={[0.35]} />
            </RigidBody>

            <mesh ref={meshRef} castShadow>
                {/* Your orange visual drone stays exactly the same small size */}
                <sphereGeometry args={[0.1, 32, 32]} />
                <meshStandardMaterial color="#f97316" roughness={0.5} metalness={0.1} />
            </mesh>

            <ContactShadows
                position={[0, 0, 0]}
                opacity={0.9}
                scale={1}
                blur={1}
                far={1}
            />
        </group>
    )
}

// ==========================================
// 2. THE PHYSICS ENVIRONMENT (WALLS & FLOORS)
// ==========================================
// ==========================================
// 2. THE PHYSICS ENVIRONMENT (WALLS & FLOORS)
// ==========================================
function ExploreFloorCollider({ level }) {
    const { nodes } = useGLTF(`/models/museum_${level}f.glb`)
    const setActiveFloor = useAppStore((state) => state.setActiveFloor)

    // ---------------------------------------------------------
    // 🛡️ THE LOOP FIX: 1.5 SECOND TELEPORT COOLDOWN
    // ---------------------------------------------------------
    const isCooldown = useRef(true)

    useEffect(() => {
        // Unlock the triggers 1.5 seconds after the floor loads
        const timer = setTimeout(() => {
            isCooldown.current = false
        }, 1500)

        return () => clearTimeout(timer)
    }, [])

    const materials = useMemo(() => ({
        floor: new THREE.MeshStandardMaterial({ color: '#d8dbdd', roughness: 0.8, side: THREE.DoubleSide }),
        wallInt: new THREE.MeshStandardMaterial({ color: '#7f8b9c', roughness: 0.7, metalness: 0.15, side: THREE.DoubleSide, flatShading: true }),
        outsideWalls: new THREE.MeshStandardMaterial({ color: '#e2e8f0', roughness: 1.0, flatShading: true }),
        stairs: new THREE.MeshStandardMaterial({ color: '#cbd5e1', roughness: 0.9, flatShading: true }),
        stairsHighlight: new THREE.MeshStandardMaterial({ color: '#7dd3fc', emissive: '#7dd3fc', emissiveIntensity: 0.2, roughness: 0.7, transparent: true }),
        columns: new THREE.MeshStandardMaterial({ color: '#cbd5e1', roughness: 0.8, flatShading: true }),
        exhibits: new THREE.MeshStandardMaterial({ color: '#64748b', roughness: 0.4, metalness: 0.1 }),
        windows: new THREE.MeshStandardMaterial({ color: '#e0f2fe', roughness: 0.1, side: THREE.DoubleSide, transparent: true, depthWrite: false, opacity: 0.45 }),
        accessibility: new THREE.MeshStandardMaterial({ color: '#fbbf24', roughness: 0.2, side: THREE.DoubleSide, transparent: true, depthWrite: false, opacity: 0.6 }),
        labels: new THREE.MeshBasicMaterial({ color: '#495566', transparent: true }),
    }), [])

    const stairsNode = nodes['stairs-and-plantforms'] || nodes['stairs-and-platforms']

    return (
        <group>
            {nodes.floor && (
                <RigidBody type="fixed" colliders="trimesh">
                    <mesh geometry={nodes.floor.geometry} material={materials.floor} position={nodes.floor.position} rotation={nodes.floor.rotation} scale={nodes.floor.scale} receiveShadow />
                </RigidBody>
            )}

            {nodes.columns && (
                <RigidBody type="fixed" colliders="trimesh">
                    <mesh geometry={nodes.columns.geometry} material={materials.columns} position={nodes.columns.position} rotation={nodes.columns.rotation} scale={nodes.columns.scale} castShadow receiveShadow />
                </RigidBody>
            )}

            {nodes.wall && (
                <RigidBody type="fixed" colliders="trimesh">
                    <mesh geometry={nodes.wall.geometry} material={materials.wallInt} position={nodes.wall.position} rotation={nodes.wall.rotation} scale={nodes.wall.scale} castShadow receiveShadow />
                </RigidBody>
            )}

            {nodes['outside-walls'] && (
                <RigidBody type="fixed" colliders="trimesh">
                    <mesh geometry={nodes['outside-walls'].geometry} material={materials.outsideWalls} position={nodes['outside-walls'].position} rotation={nodes['outside-walls'].rotation} scale={nodes['outside-walls'].scale} castShadow receiveShadow />
                </RigidBody>
            )}

            {stairsNode && (
                <RigidBody type="fixed" colliders="trimesh">
                    <mesh geometry={stairsNode.geometry} material={materials.stairs} position={stairsNode.position} rotation={stairsNode.rotation} scale={stairsNode.scale} receiveShadow castShadow />
                </RigidBody>
            )}

            {nodes.exhibits && (
                <RigidBody type="fixed" colliders="trimesh">
                    <mesh geometry={nodes.exhibits.geometry} material={materials.exhibits} position={nodes.exhibits.position} rotation={nodes.exhibits.rotation} scale={nodes.exhibits.scale} castShadow receiveShadow />
                </RigidBody>
            )}

            {nodes.windows && (
                <RigidBody type="fixed" colliders="trimesh">
                    <mesh geometry={nodes.windows.geometry} material={materials.windows} position={nodes.windows.position} rotation={nodes.windows.rotation} scale={nodes.windows.scale} />
                </RigidBody>
            )}

            {/* ========================================== */}
            {/* 🚪 EXACT MAPPED TELEPORTERS               */}
            {/* ========================================== */}

            {/* 🔴 FLOOR 1 TRIGGERS -> TELEPORT TO FLOOR 2 */}
            {level === 1 && [
                // Pair 1
                { trigger: [-35.9, 3.46, -49.51], dest: { x: -35.23, y: 2, z: -44.56 + 2 } },
                // Pair 2
                { trigger: [-12.75, 3.18, 4.33], dest: { x: -7.38, y: 3, z: 7.86 + 2 } },
                // Pair 3
                { trigger: [-0.64, 2.2, 0.05], dest: { x: 1.03, y: 2, z: 4.03 + 2 } },
                // Pair 4
                { trigger: [11.31, 3.13, 3.94], dest: { x: 7.43, y: 3, z: 8.57 + 2 } },
                // Pair 5
                { trigger: [25.8, 1.85, -45.94], dest: { x: 26.47, y: 2, z: -42.55 + 2 } }
            ].map((data, i) => (
                <CuboidCollider
                    key={`f1-to-f2-${i}`}
                    sensor
                    args={[1.5, 2, 1.5]}
                    position={data.trigger}
                    onIntersectionEnter={() => {
                        if (isCooldown.current) return; // Prevent instant loop
                        console.log(`Going up to Floor 2 via Stair ${i + 1}!`)
                        setActiveFloor(2)
                        useAppStore.getState().setSpawnPosition(data.dest)
                    }}
                />
            ))}

            {/* 🔵 FLOOR 2 TRIGGERS -> TELEPORT TO FLOOR 1 */}
            {level === 2 && [
                // Pair 1
                { trigger: [-35.23, 3.41, -44.56], dest: { x: -35.9, y: 2, z: -49.51 + 2 } },
                // Pair 2
                { trigger: [-11.38, 0.43, 7.86], dest: { x: -12.75, y: 3, z: 4.33 + 2 } },
                // Pair 3
                { trigger: [1.03, -1.46, 4.03], dest: { x: -0.64, y: 2, z: 0.05 + 2 } },
                // Pair 4
                { trigger: [13.43, 0.11, 8.57], dest: { x: 11.31, y: 3, z: 3.94 + 2 } },
                // Pair 5
                { trigger: [26.47, 1.55, -42.55], dest: { x: 25.8, y: 2, z: -45.94 + 2 } }
            ].map((data, i) => (
                <CuboidCollider
                    key={`f2-to-f1-${i}`}
                    sensor
                    args={[1.5, 2, 1.5]}
                    position={data.trigger}
                    onIntersectionEnter={() => {
                        if (isCooldown.current) return; // Prevent instant loop
                        console.log(`Going down to Floor 1 via Stair ${i + 1}!`)
                        setActiveFloor(1)
                        useAppStore.getState().setSpawnPosition(data.dest)
                    }}
                />
            ))}
        </group>
    )
}

// ==========================================
// 3. MAIN EXPLORE SCENE WRAPPER
// ==========================================
export default function ExploreScene() {
    const activeFloor = useAppStore((state) => state.activeFloor)

    return (
        <>
            <ambientLight intensity={0.35} />

            {/* Main Warm Light */}
            <directionalLight
                position={[20, 40, 20]}
                intensity={1.2}
                color="#fffbeb"
                castShadow
                // 👈 THIS CONFIG MAKES SHADOWS SHARP AND STABLE
                shadow-mapSize={[1024, 1024]}
                shadow-camera-left={-20}
                shadow-camera-right={20}
                shadow-camera-top={20}
                shadow-camera-bottom={-20}
            />

            {/* Cool Fill Light to catch edges of walls */}
            <directionalLight
                position={[-20, 30, -20]}
                intensity={0.4}
                color="#bae6fd"
            />

            <Environment preset="city" />

            <Physics timeStep="vary">
                <PlayerBall />

                <Suspense fallback={null}>
                    {/* key prop destroys the ghost colliders when switching floors */}
                    <ExploreFloorCollider key={activeFloor} level={activeFloor} />
                </Suspense>
            </Physics>
        </>
    )
}
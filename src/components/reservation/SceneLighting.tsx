/** Ambient + directional fill for the wall of books. */
export default function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.38} color="#f4e9d8" />
      <hemisphereLight args={["#fff4df", "#241811", 0.28]} />
      <directionalLight
        position={[3.5, 4, 4]}
        intensity={0.85}
        color="#fff1dc"
      />
      <directionalLight
        position={[-4, -1.5, -2]}
        intensity={0.2}
        color="#973028"
      />
    </>
  );
}

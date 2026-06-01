# 3D Models Directory

Place `.glb` and `.gltf` 3D model files here for use with React Three Fiber.

## Optimization Tips

- Use [gltf-pipeline](https://github.com/CesiumGS/gltf-pipeline) or [glTF-Transform](https://gltf-transform.donmccurdy.com/) to compress models
- Prefer `.glb` (binary) over `.gltf` (JSON + separate binaries) for fewer network requests
- Use Draco compression for geometry-heavy models
- Keep models under 2MB for fast loading; use LOD (Level of Detail) for complex scenes
- Consider lazy-loading models with `React.lazy()` and `<Suspense>`

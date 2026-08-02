# 3D Centerpiece Model

Drop your model here as `centerpiece.glb` and it'll load automatically
(see `src/components/Centerpiece3D.tsx` if you want to rename it).

## Getting a web-ready file from a CGTrader / Sketchfab download

Most free landscape/terrain models are NOT web-ready out of the box —
a "16K" texture landscape can be hundreds of MB to several GB. Before
dropping it in here:

1. **Import into Blender** (free): File → Import → whatever format you
   downloaded (.fbx / .obj / .max needs a converter first).
2. **Shrink the textures.** 16K is print/film resolution. For a website
   hero, 2K (2048px) is usually plenty, 4K max. Resize each texture
   image in an image editor or Blender's Image Editor, then re-bake/
   re-link them.
3. **Decimate the mesh if it's dense.** Blender's Decimate modifier can
   cut polygon count drastically with minimal visible quality loss for
   a background/centerpiece element.
4. **Export as glTF Binary (.glb)** — File → Export → glTF 2.0,
   format: "glTF Binary (.glb)". Enable Draco compression in the
   export options if available; this component already supports it.
5. **Check the file size.** Aim for under ~10-15MB total if you can —
   ideally much less. Anything bigger will make your hero section slow
   to load, especially on mobile connections.

Once you have `centerpiece.glb` sized reasonably, place it here at
`public/models/centerpiece.glb` and restart `npm run dev`.

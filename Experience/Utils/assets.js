const base = import.meta.env.BASE_URL;

export default [
  {
    name: "room",
    type: "glbModel",
    path: `${base}models/finalroom.glb`,
  },

  {
    name: "tvscreen",
    type: "videoTexture",
    path: `${base}textures/anoyume.mp4`,
  },
  {
    name: "ica",
    type: "glbModel",
    path: `${base}Ica/Art_HyacineServant_00.glb`,
  },
  {
    name: "icaAnimations",
    type: "fbxModel",
    path: `${base}Ica/Art_HyacineServant_00.fbx`,
  },
];

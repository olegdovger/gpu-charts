import { getCanvasById, setupDevice } from "@gpu-charts/core";

const canvas = getCanvasById("canvas");

await setupDevice(canvas);

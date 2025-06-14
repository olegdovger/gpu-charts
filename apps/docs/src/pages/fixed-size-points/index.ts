import { initChart } from "@gpu-charts/core";

const chartInstance = await initChart("canvas");

chartInstance.setViewConfig({
  backgroundColor: "#000",
  padding: {
    topPercent: 10,
    rightPercent: 10,
    bottomPercent: 10,
    leftPercent: 10,
  },
});

chartInstance.render();

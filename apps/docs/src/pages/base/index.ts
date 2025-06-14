import { Chart } from "@gpu-charts/core";

// const chart = await initChart("canvas");
//
// chart.onResize(() => {
//   console.log("chart resized");
// });
//
// chart.setViewConfig({
//   backgroundColor: "#000",
//   padding: {
//     topPercent: 10,
//     rightPercent: 10,
//     bottomPercent: 10,
//     leftPercent: 10,
//   },
// });
//
// chart.setCrossPointer();
//
// chart.render();

const chart = new Chart({
  backgroundColor: "#AAA",
});

chart.render();
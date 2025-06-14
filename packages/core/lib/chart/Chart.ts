export class Chart {
  constructor(private readonly chartConfig: ChartConfig) {}

  render() {
    this.chartConfig.backgroundColor = "red";
  }
}
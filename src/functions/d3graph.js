import * as d3 from "d3";
import console_monkey_patch, { logArray } from "../console-monkey-patch";

export function initD3Graph() {
    console_monkey_patch();
    const width = 600;
    const height = 200;
    const margin = { top: 20, right: 20, bottom: 20, left: 40 };

    const svg = d3.select("#d3Graph")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const xScale = d3.scaleLinear().range([margin.left, width - margin.right]);
    const yScale = d3.scaleLinear().range([height - margin.bottom, margin.top]);

    const line = d3.line()
        .x((d, i) => xScale(i))
        .y(d => yScale(d))
        .curve(d3.curveMonotoneX);

    const path = svg.append("path")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2);

    function updateGraph() {
        // Update scales
        xScale.domain([0, logArray.length - 1]);
        yScale.domain([
            d3.min(logArray) ?? 0,
            d3.max(logArray) ?? 1
        ]);

        // Update line
        path.datum(logArray)
            .transition()
            .duration(100)
            .attr("d", line);

        requestAnimationFrame(updateGraph);
    }

    updateGraph();
}

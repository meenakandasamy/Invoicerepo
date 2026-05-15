import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useResizeObserver } from '@/hooks/UseResize';

interface BarChartProps {
  requestData: Array<any>;
  margin?: { top: number; right: number; bottom: number; left: number };
  color?: string;
  title: string;
  titleClass?: string;
  barLabel: string;
  xAxisLabel: string;
  yAxisLabel: string;
  groupBy: string | ((item: any) => string);
  aggregateFn?: (items: Array<any>) => number;
  orientation?: 'horizontal' | 'vertical';
}

/**
 * A horizontal or vertical bar chart component.
 *
 * @prop {Array<any>} requestData The data to render in the chart.
 * @prop {number} width The width of the chart. Defaults to 400.
 * @prop {number} height The height of the chart. Defaults to 320.
 * @prop {{top: number, right: number, bottom: number, left: number}} margin The margin around the chart. Defaults to { top: 20, right: 20, bottom: 40, left: 80 }.
 * @prop {string} color The color of the bars. Defaults to #3b82f6.
 * @prop {string} title The title of the chart. Defaults to an empty string.
 * @prop {string} barLabel The label to show on the bars. Defaults to an empty string.
 * @prop {string} xAxisLabel The label to show on the x-axis. Defaults to an empty string.
 * @prop {string} yAxisLabel The label to show on the y-axis. Defaults to an empty string.
 * @prop {(item: any) => string} groupBy The function to group the bars by. Can be either a string to group by a property of the data, or a function that takes an item and returns a string.
 * @prop {(items: Array<any>) => number} aggregateFn The function to aggregate the values of each group. Defaults to (v) => v.length.
 * @prop {"horizontal" | "vertical"} orientation The orientation of the chart. Defaults to "horizontal".
 */
export const BarChart = ({
  requestData,
  margin = { top: 20, right: 20, bottom: 40, left: 80 },
  color = '#3b82f6',
  title = '',
  titleClass = '',
  barLabel = '',
  xAxisLabel = '',
  yAxisLabel = '',
  groupBy,
  aggregateFn,
  orientation = 'horizontal',
}: BarChartProps) => {
  const [containerRef, size] = useResizeObserver<HTMLDivElement>();
  const chartRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!size) return;

    if (tooltipRef.current) {
      tooltipRef.current.remove();
    }

    const tooltip = d3
      .select('body')
      .append<HTMLDivElement>('div')
      .attr('id', 'bar-tooltip')
      .style('position', 'absolute')
      .style('background', 'rgba(0,0,0,0.75)')
      .style('color', '#fff')
      .style('padding', '6px 10px')
      .style('border-radius', '4px')
      .style('pointer-events', 'none')
      .style('opacity', '0')
      .style('font-size', '12px');

    tooltipRef.current = tooltip.node();

    drawChart(tooltip, size.width, size.height);
  }, [requestData, groupBy, aggregateFn, orientation, size]);

  const drawChart = (
    tooltip: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>,
    width: number,
    height: number,
  ) => {
    const groupAccessor =
      typeof groupBy === 'function' ? groupBy : (d: any) => d[groupBy];

    const data = d3.rollups(
      requestData,
      aggregateFn ?? ((v) => v.length),
      groupAccessor,
    );

    data.sort((a, b) => b[1] - a[1]);

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Clear previous chart
    d3.select(chartRef.current).selectAll('*').remove();

    const svg = d3
      .select(chartRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Check if the orientation is vertical or horizontal
    if (orientation === 'vertical') {
      // Vertical column chart

      // Create the x and y scales
      const x = d3
        .scaleBand()
        .domain(data.map((d) => d[0]))
        .range([0, innerWidth])
        .padding(0.1);

      const y = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d[1]) ?? 0])
        .nice()
        .range([innerHeight, 0]);

      // Create the x-axis
      svg
        .append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-0.6em')
        .attr('dy', '0.15em')
        .attr('transform', 'rotate(-40)');

      // Create the x-axis label
      svg
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight + margin.bottom - 5)
        .style('font-size', '12px')
        .text(xAxisLabel);

      // Create the y-axis
      svg.append('g').call(d3.axisLeft(y));

      // Create the y-axis label
      svg
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('x', -innerHeight / 2)
        .attr('y', -margin.left + 15)
        .style('font-size', '12px')
        .text(yAxisLabel);

      // Create the bars
      svg
        .selectAll('.bar')
        .data(data)
        .join('rect')
        .attr('class', 'bar')
        .attr('x', (d) => x(d[0])!)
        .attr('y', (d) => y(d[1]))
        .attr('width', x.bandwidth())
        .attr('height', (d) => innerHeight - y(d[1]))
        .attr('fill', color)
        .on('pointerover', function (_, d) {
          d3.select(this).attr(
            'fill',
            d3.color(color)?.darker(1).toString() ?? color,
          );
          tooltip
            .style('opacity', '1')
            .html(`<strong>${d[0]}</strong>: ${d[1]} ${barLabel}`);
        })
        .on('pointermove', function (event) {
          tooltip
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 20}px`);
        })
        .on('pointerout', function () {
          d3.select(this).attr('fill', color);
          tooltip.transition().duration(200).style('opacity', '0');
        });
    } else {
      // Horizontal bar chart (default)

      // Create the x and y scales
      const x = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d[1]) ?? 0])
        .nice()
        .range([0, innerWidth]);

      const y = d3
        .scaleBand()
        .domain(data.map((d) => d[0]))
        .range([0, innerHeight])
        .padding(0.1);

      // Create the x-axis
      svg
        .append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format('d')));

      // Create the x-axis label
      svg
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight + margin.bottom - 5)
        .style('font-size', '12px')
        .text(xAxisLabel);

      // Create the y-axis
      svg.append('g').call(d3.axisLeft(y));

      // Create the y-axis label
      svg
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', `rotate(-90)`)
        .attr('x', -innerHeight / 2)
        .attr('y', -margin.left + 15)
        .style('font-size', '12px')
        .text(yAxisLabel);

      // Create the bars
      svg
        .selectAll('.bar')
        .data(data)
        .join('rect')
        .attr('class', 'bar')
        .attr('x', 0)
        .attr('y', (d) => y(d[0])!)
        .attr('width', (d) => x(d[1]))
        .attr('height', y.bandwidth())
        .attr('fill', color)
        .on('pointerover', function (_, d) {
          d3.select(this).attr(
            'fill',
            d3.color(color)?.darker(1).toString() ?? color,
          );
          tooltip
            .style('opacity', '1')
            .html(`<strong>${d[0]}</strong>: ${d[1]} ${barLabel}`);
        })
        .on('pointermove', function (event) {
          tooltip
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 20}px`);
        })
        .on('pointerout', function () {
          d3.select(this).attr('fill', color);
          tooltip.transition().duration(200).style('opacity', '0');
        });
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col w-full h-full"
      style={{
        overflow: 'visible',
      }}
    >
      {title && (
        <h2 className={`text-xl sm:text-lg font-semibold ${titleClass}`}>
          {title}
        </h2>
      )}
      <div
        ref={chartRef}
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
};

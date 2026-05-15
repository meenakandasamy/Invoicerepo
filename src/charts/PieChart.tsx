import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useResizeObserver } from '@/hooks/UseResize';

interface PieChartProps {
  requestData: Array<any>;
  margin?: { top: number; right: number; bottom: number; left: number };
  innerRadius?: number;
  outerRadius?: number;
  colorScale?: d3.ScaleOrdinal<string, string, never>;
  totalLabel: string;
  title: string;
  titleClass?: string;
  groupBy: string | ((item: any) => string);
  aggregateFn?: (groupItems: Array<any>) => number;
  legendPosition?: 'right' | 'left' | 'top' | 'bottom';
}

export const PieChart = ({
  requestData,
  margin = { top: 0, right: 0, bottom: 0, left: 0 },
  innerRadius = 0,
  totalLabel = '',
  title = '',
  titleClass = '',
  colorScale = d3.scaleOrdinal(d3.schemeCategory10),
  groupBy,
  aggregateFn,
  legendPosition = 'right',
}: PieChartProps) => {
  const [containerRef, bounds] = useResizeObserver<HTMLDivElement>();
  const chartRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!bounds) return;

    if (tooltipRef.current) {
      tooltipRef.current.remove();
    }

    const tooltip = d3
      .select('body')
      .append<HTMLDivElement>('div')
      .attr('id', 'pie-tooltip')
      .style('position', 'absolute')
      .style('background', 'rgba(0,0,0,0.75)')
      .style('color', '#fff')
      .style('padding', '6px 10px')
      .style('border-radius', '4px')
      .style('pointer-events', 'none')
      .style('opacity', '0')
      .style('font-size', '12px');

    tooltipRef.current = tooltip.node();

    drawChart(tooltip, bounds.width, bounds.height);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestData, groupBy, aggregateFn, bounds]);

  const drawChart = (
    tooltip: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>,
    width: number,
    height: number,
  ) => {
    const groupAccessor =
      typeof groupBy === 'function' ? groupBy : (d: any) => d[groupBy];

    const data: Array<[string, number]> = d3.rollups(
      requestData,
      aggregateFn ?? ((v) => v.length),
      groupAccessor,
    );

    const total = d3.sum(data, (d) => d[1]);
    const radius = Math.min(width, height) / 2 - 40;

    d3.select(chartRef.current).selectAll('*').remove();

    const svg = d3
      .select(chartRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('overflow', 'visible')
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    const pie = d3.pie<[string, number]>().value((d) => d[1]);
    const data_ready = pie(data);

    const arc = d3
      .arc<d3.PieArcDatum<[string, number]>>()
      .innerRadius(innerRadius)
      .outerRadius(radius);

    const arcHover = d3
      .arc<d3.PieArcDatum<[string, number]>>()
      .innerRadius(innerRadius)
      .outerRadius(radius + 10);

    svg
      .selectAll('path')
      .data(data_ready)
      .join('path')
      .attr('d', arc)
      .attr('fill', (d) => colorScale(d.data[0]))
      .attr('stroke', 'white')
      .style('stroke-width', '2px')
      .on('pointerover', function (_, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', () => arcHover(d));
        tooltip
          .style('opacity', '1')
          .html(
            `<strong>${d.data[0]}</strong>: ${d.data[1]} (${((d.data[1] / total) * 100).toFixed(1)}%)`,
          );
      })
      .on('pointermove', function (event) {
        tooltip
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 20}px`);
      })
      .on('pointerout', function (_, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', () => arc(d));
        tooltip.transition().duration(200).style('opacity', '0');
      });

    // Legend
    const legend = svg.append('g').attr('class', 'legend');

    const legendItemPadding = 6;
    const legendRectSize = 14;
    const legendSpacing = 6;
    const fontSize = 12;

    const legendItems = legend
      .selectAll('.legend-item')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'legend-item');

    legendItems
      .append('rect')
      .attr('width', legendRectSize)
      .attr('height', legendRectSize)
      .attr('fill', (d) => colorScale(d[0]));

    legendItems
      .append('text')
      .attr('x', legendRectSize + legendSpacing)
      .attr('y', legendRectSize - 2)
      .style('font-size', `${fontSize}px`)
      .text((d) => `${d[0]}: ${d[1]} (${((d[1] / total) * 100).toFixed(1)}%)`);

    // Dynamically position legend items
    let currentY = 0;
    legendItems.each(function (_, _i) {
      d3.select(this).attr('transform', `translate(0, ${currentY})`);
      const h = legendRectSize + legendItemPadding;
      currentY += h;
    });

    // Add total at the bottom
    legend
      .append('text')
      .attr('x', 0)
      .attr('y', currentY + 10)
      .style('font-size', `${fontSize}px`)
      .style('font-weight', 'bold')
      .text(`Total ${totalLabel}: ${total}`);
    let legendX = 0;
    let legendY = 0;

    switch (legendPosition) {
      case 'right':
        legendX = radius + 20;
        legendY = -radius;
        break;
      case 'left':
        legendX = -radius - 150; // adjust spacing as needed
        legendY = -radius;
        break;
      case 'top':
        legendX = -radius;
        legendY = -radius - currentY - 20;
        break;
      case 'bottom':
        legendX = -radius;
        legendY = radius + 20;
        break;
      default:
        legendX = radius + 20;
        legendY = -radius;
    }

    legend.attr('transform', `translate(${legendX}, ${legendY})`);
  };

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      {title && (
        <h2 className={`text-xl sm:text-lg font-bold ${titleClass}`}>
          {title}
        </h2>
      )}
      <div
        ref={chartRef}
        style={{
          width: '100%',
          height: '100%',
          margin: `${margin.top}px ${margin.right}px ${margin.bottom}px ${margin.left}px`,
        }}
      />
    </div>
  );
};

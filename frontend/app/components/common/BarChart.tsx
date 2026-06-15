'use client';

import dynamic from 'next/dynamic';
import type { ChartDataPoint } from '@/app/store/notificationStore';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

const FALLBACK: ChartDataPoint[] = Array.from({ length: 7 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (6 - i));
  return {
    date: d.toISOString().slice(0, 10),
    label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    count: 0,
  };
});

interface Props { data?: ChartDataPoint[] }

export default function BarChart({ data }: Props) {
  const points = data?.length ? data : FALLBACK;
  const labels = points.map((p) => p.label);
  const values = points.map((p) => p.count);

  return (
    <Plot
      data={[
        {
          type: 'bar',
          x: labels,
          y: values,
          marker: {
            color: values.map((_, i) =>
              i === values.length - 1 ? '#4f46e5' : '#c7d2fe'
            ),
          },
          hovertemplate: '%{x}: <b>%{y} notifications</b><extra></extra>',
        },
      ]}
      layout={{
        autosize: true,
        margin: { t: 8, r: 8, b: 36, l: 36 },
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        xaxis: {
          tickfont: { size: 12, color: '#6b7280' },
          showgrid: false,
          zeroline: false,
          fixedrange: true,
        },
        yaxis: {
          tickfont: { size: 12, color: '#6b7280' },
          gridcolor: '#f3f4f6',
          zeroline: false,
          fixedrange: true,
        },
        bargap: 0.35,
      }}
      config={{ displayModeBar: false, responsive: true }}
      style={{ width: '100%', height: '220px' }}
    />
  );
}

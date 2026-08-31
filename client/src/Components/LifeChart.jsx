import React from 'react';
import { Line } from "react-chartjs-2";
import 'chart.js/auto';
import { useSimulation } from '../context/SimulationContext';

export default function LifeChart() {
  const { ladles } = useSimulation();

  // Dynamically group the 10 active ladles into health percentage bins
  const getBinCounts = () => {
    const bins = { '80': 0, '85': 0, '90': 0, '95': 0, '100': 0 };
    ladles.forEach(l => {
      const h = l.refractoryHealth || 100;
      if (h < 80) bins['80']++;
      else if (h < 85) bins['85']++;
      else if (h < 90) bins['90']++;
      else if (h < 95) bins['95']++;
      else bins['100']++;
    });
    return [bins['80'], bins['85'], bins['90'], bins['95'], bins['100']];
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)'
        },
        ticks: {
          color: '#94a3b8',
          font: {
            family: 'monospace',
            size: 9
          }
        }
      },
      y: {
        min: 0,
        max: 8,
        grid: {
          color: 'rgba(255, 255, 255, 0.05)'
        },
        ticks: {
          stepSize: 2,
          color: '#94a3b8',
          font: {
            family: 'monospace',
            size: 9
          }
        }
      }
    }
  };

  const lifeData = {
    labels: ['<80%', '80-85%', '85-90%', '90-95%', '95-100%'],
    datasets: [{
      data: getBinCounts(),
      fill: true,
      borderColor: "#eab308",
      backgroundColor: "rgba(234, 179, 8, 0.15)",
      tension: 0.3
    }]
  };

  return (
    <div className="w-full h-[120px]">
      <Line data={lifeData} options={chartOptions} />
    </div>
  );
}

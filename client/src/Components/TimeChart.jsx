import React from 'react';
import { Bar } from "react-chartjs-2";
import 'chart.js/auto';
import { useSimulation } from '../context/SimulationContext';

export default function TimeChart() {
  const { ladles } = useSimulation();

  const labels = ladles.map(l => l.ladleId.replace('LAD-', 'L-'));
  const dataValues = ladles.map(l => l.timeInState || 0);

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
          display: false
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
      }
    }
  };

  const timeData = {
    labels: labels,
    datasets: [{
      data: dataValues,
      backgroundColor: "white",
      borderColor: "white",
      borderWidth: 1,
      barThickness: 12
    }]
  };

  return (
    <div className="w-full h-[120px]">
      <Bar data={timeData} options={chartOptions} />
    </div>
  );
}

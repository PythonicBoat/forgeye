import React, {useState} from 'react'
import {Line} from "react-chartjs-2"
import { Chart as ChartJs} from 'chart.js/auto'
import DataObject from '../Assets/Data.json'

export default function LifeChart() {
    const chartOptions = {
        plugins: {
          legend: {
            display: false, // Set display to false to hide the legend completely
          },
        },
      };
    const [lifeData, setLifeData] = useState({
        labels: DataObject.lifeGraph.map((data) => data.life),
        datasets: [{
            
            data: DataObject.lifeGraph.map((data) => data.number),
            fill: true,
            borderColor: "#eab308",
            backgroundColor: "rgba(234, 179, 8, 0.2)",
            tension: 0.3
        }],
        options: {        
            legend: {
              display: false
            }
          }
        
    })
  return (
    <div>
        <Line data={lifeData} options={chartOptions}/>
    </div>
  )
}

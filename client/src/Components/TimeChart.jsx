import React, {useState} from 'react'
import {Bar} from "react-chartjs-2"
import { Chart as ChartJs} from 'chart.js/auto'
import DataObject from '../Assets/Data.json'

export default function TimeChart() {
    const chartOptions = {
        plugins: {
          legend: {
            display: false, 
          },
        },
      };
      console.log(DataObject.timeGraph);
    const [timeData, setTimeData] = useState({
        labels: DataObject.timeGraph.map((data)=> data.id),
        datasets: [{
            data: DataObject.timeGraph.map((data)=> data.time),
            fill: true,
            backgroundColor: "white",
        }],
        options: {        
            legend: {
              display: false
            }
          }
        
    })
  return (
    <div>
        <Bar data={timeData} options={chartOptions}/>
    </div>
  )
}

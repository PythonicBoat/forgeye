import React from 'react';
import data from './data.json'; // Assuming your JSON file is named data.json

function TabularData() {
  return (
    <div className="tabular-data">
      <h1>LTS</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Ldl</th>
            <th>Current Location</th>
            <th>Life</th>
            <th>Clr time</th>
            <th>Condition</th>
            <th>Time</th>
            <th>Type</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map(item => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.ldl}</td>
              <td>{item.currentLocation}</td>
              <td>{item.life}</td>
              <td>{item.clrTime}</td>
              <td>{item.condition}</td>
              <td>{item.time}</td>
              <td>{item.type}</td>
              <td>{item.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TabularData;
/* eslint-disable no-restricted-globals */

// Simple PRNG (Pseudo-Random Number Generator) for seedable, reproducible datasets
function createRandom(seed) {
  let h = seed ^ 0xdeadbeef;
  return function() {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

self.onmessage = function(e) {
  const { rowLimit = 1000000, anomalyRate = 1, season = 'Summer' } = e.data;
  
  const random = createRandom(12345);
  
  // Headers for the CSVs
  const telemetryHeader = 'timestamp,ladle_id,sensor_id,value,unit,location\n';
  const trackingHeader = 'timestamp,ladle_id,event_type,source,destination,duration_mins\n';
  const maintenanceHeader = 'timestamp,ladle_id,wear_percent,repair_required,technician\n';
  const alertHeader = 'timestamp,camera_id,alert_type,severity,metadata\n';

  // Constants
  const ladles = ['LAD-1001', 'LAD-1002', 'LAD-1003', 'LAD-1004', 'LAD-1005', 'LAD-1006', 'LAD-1007', 'LAD-1008', 'LAD-1009', 'LAD-1010'];
  const stations = ['BF1', 'BF2', 'BOF', 'LF1', 'LF2', 'RH', 'CC1', 'CC2', 'SLAG', 'MAINT', 'PREHEAT'];
  const techs = ['T. Sharma', 'V. Rao', 'S. Kumar', 'P. Patel', 'K. Reddy'];
  const alertTypes = ['HEAT_LEAK', 'PPE_VIOLATION', 'METAL_SPILL', 'GAS_LEAK', 'EMISSION_SPIKE'];
  const severities = ['INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

  // Start generation
  let currentTimestamp = Date.now() - (30 * 24 * 60 * 60 * 1000); // Start 30 days ago
  const stepTime = 5000; // 5 seconds step
  
  let telemetryRows = [telemetryHeader];
  let trackingRows = [trackingHeader];
  let maintenanceRows = [maintenanceHeader];
  let alertRows = [alertHeader];
  
  let totalRowsGenerated = 0;
  const chunkSize = 100000; // Send progress updates every 100k rows
  
  self.postMessage({ type: 'STATUS', status: 'Generating schema headers...' });

  // Seasonality factor
  const seasonalWearMultiplier = season === 'Summer' ? 1.25 : 0.95;

  for (let i = 0; i < rowLimit; i++) {
    currentTimestamp += stepTime;
    const timeStr = new Date(currentTimestamp).toISOString();
    
    // Shift variation: Shift A (6-14), B (14-22), C (22-6)
    const hour = new Date(currentTimestamp).getUTCHours();
    const shift = hour >= 6 && hour < 14 ? 'SHIFT_A' : hour >= 14 && hour < 22 ? 'SHIFT_B' : 'SHIFT_C';
    const shiftMultiplier = shift === 'SHIFT_C' ? 0.9 : 1.1; // Less throughput at night

    // 1. Generate Sensor Telemetry (80% of rows)
    const ladle = ladles[Math.floor(random() * ladles.length)];
    const station = stations[Math.floor(random() * stations.length)];
    
    // Ambient temperature shifts based on season & shift
    const baseTemp = season === 'Summer' ? 1560 : 1510;
    const shiftNoise = shift === 'SHIFT_A' ? 15 : 0;
    
    let sensorVal = baseTemp + Math.floor(random() * 90) + shiftNoise;
    let unit = '°C';
    let sensorId = `TEMP-IN-${ladle}`;

    // Random failure anomaly injection
    if (random() * 100 < anomalyRate) {
      if (random() > 0.5) {
        sensorVal = 0; // Flatline failure
      } else {
        sensorVal = 2100; // Out-of-bounds spike
      }
    }

    telemetryRows.push(`${timeStr},${ladle},${sensorId},${sensorVal},${unit},${station}\n`);
    totalRowsGenerated++;

    // 2. Generate Tracking Event (10% of rows)
    if (i % 10 === 0) {
      const src = stations[Math.floor(random() * stations.length)];
      const dest = stations[Math.floor(random() * stations.length)];
      const duration = Math.round(5 + random() * 45 * shiftMultiplier);
      trackingRows.push(`${timeStr},${ladle},TRANSIT_COMPLETED,${src},${dest},${duration}\n`);
      totalRowsGenerated++;
    }

    // 3. Generate Maintenance Record (5% of rows)
    if (i % 20 === 0) {
      const wear = Math.min(100, Math.floor(10 + random() * 85 * seasonalWearMultiplier));
      const repairReq = wear > 80;
      const tech = techs[Math.floor(random() * techs.length)];
      maintenanceRows.push(`${timeStr},${ladle},${wear},${repairReq},${tech}\n`);
      totalRowsGenerated++;
    }

    // 4. Generate Alert Incident (5% of rows)
    if (i % 20 === 1) {
      const type = alertTypes[Math.floor(random() * alertTypes.length)];
      const sev = severities[Math.floor(random() * severities.length)];
      const cam = `CAM-0${Math.floor(1 + random() * 12)}`;
      let meta = '';
      if (type === 'HEAT_LEAK') meta = 'Hotspot size 1.2m²';
      else if (type === 'PPE_VIOLATION') meta = 'No hardhat';
      else meta = 'Gas levels CO 180ppm';
      
      alertRows.push(`${timeStr},${cam},${type},${sev},"${meta}"\n`);
      totalRowsGenerated++;
    }

    // Periodically post progress and flush buffers if limits are reached
    if (totalRowsGenerated % chunkSize === 0 || i === rowLimit - 1) {
      const progress = Math.min(100, Math.round((i / rowLimit) * 100));
      self.postMessage({ 
        type: 'PROGRESS', 
        progress,
        generatedRows: totalRowsGenerated
      });
    }
  }

  self.postMessage({ type: 'STATUS', status: 'Compiling dataset buffers...' });

  // Compile full Blobs for download
  const telemetryBlob = new Blob(telemetryRows, { type: 'text/csv' });
  const trackingBlob = new Blob(trackingRows, { type: 'text/csv' });
  const maintenanceBlob = new Blob(maintenanceRows, { type: 'text/csv' });
  const alertBlob = new Blob(alertRows, { type: 'text/csv' });

  self.postMessage({
    type: 'COMPLETED',
    telemetryBlob,
    trackingBlob,
    maintenanceBlob,
    alertBlob,
    totalCount: totalRowsGenerated
  });
};

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const SimulationContext = createContext();

const STATIONS = {
  BF1: { id: 'BF1', name: 'Blast Furnace 1', x: 180, y: 120, type: 'source' },
  BF2: { id: 'BF2', name: 'Blast Furnace 2', x: 180, y: 220, type: 'source' },
  BOF: { id: 'BOF', name: 'Basic Oxygen Furnace', x: 320, y: 170, type: 'refine' },
  LF1: { id: 'LF1', name: 'Ladle Furnace 1', x: 480, y: 120, type: 'alloy' },
  LF2: { id: 'LF2', name: 'Ladle Furnace 2', x: 480, y: 220, type: 'alloy' },
  RH: { id: 'RH', name: 'RH Degasser', x: 620, y: 170, type: 'degas' },
  CC1: { id: 'CC1', name: 'Continuous Casting 1', x: 780, y: 120, type: 'cast' },
  CC2: { id: 'CC2', name: 'Continuous Casting 2', x: 780, y: 220, type: 'cast' },
  SLAG: { id: 'SLAG', name: 'Slag Dump', x: 900, y: 320, type: 'dump' },
  MAINT: { id: 'MAINT', name: 'Maintenance Stand', x: 320, y: 350, type: 'repair' },
  PREHEAT: { id: 'PREHEAT', name: 'Preheating Station', x: 480, y: 350, type: 'heat' },
  SCRAP: { id: 'SCRAP', name: 'Scrap Yard', x: 100, y: 170, type: 'scrap' }
};

const STATION_SEQUENCE = [
  'BF1', // BF1 or BF2
  'BOF',
  'LF1', // LF1 or LF2
  'RH',
  'CC1', // CC1 or CC2
  'SLAG',
  'MAINT',
  'PREHEAT'
];

export function SimulationProvider({ children }) {
  const [speed, setSpeed] = useState(1); // 0 = paused, 1 = 1x, 5 = 5x, etc.
  const [ladles, setLadles] = useState([]);
  const [cranes, setCranes] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [telemetryBuffer, setTelemetryBuffer] = useState([]);
  const [activeCameraId, setActiveCameraId] = useState(1);
  const [activeLadleId, setActiveLadleId] = useState('LAD-1001');
  const [selectedStation, setSelectedStation] = useState('BOF');
  
  // Custom manual anomaly trigger indicators
  const [manualAnomalies, setManualAnomalies] = useState({
    heatLeak: null,       // ladleId
    ppeViolation: null,   // stationId
    gasLeak: null,        // stationId
    sensorFailure: null,  // sensorId
    spill: null           // ladleId
  });

  const nextAlertId = useRef(1);
  const nextWorkOrderId = useRef(1);

  // Initialize data
  useEffect(() => {
    // 10 Ladles spaced out across the cycle sequence
    const initialLadles = Array.from({ length: 10 }, (_, i) => {
      const ladleId = `LAD-100${i + 1}`;
      const sequenceIndex = i % STATION_SEQUENCE.length;
      let startStation = STATION_SEQUENCE[sequenceIndex];
      
      // Alternate furnaces and casting bays
      if (startStation === 'BF1' && i % 2 === 1) startStation = 'BF2';
      if (startStation === 'LF1' && i % 2 === 1) startStation = 'LF2';
      if (startStation === 'CC1' && i % 2 === 1) startStation = 'CC2';

      const station = STATIONS[startStation];
      const cyclesCompleted = 40 + Math.floor(Math.random() * 80);
      const refractoryHealth = Math.max(50, 100 - (cyclesCompleted % 40) - Math.floor(Math.random() * 10));

      return {
        ladleId,
        capacity: 150,
        currentTemperature: startStation.startsWith('BF') || startStation === 'BOF' || startStation.startsWith('LF') || startStation === 'RH' || startStation.startsWith('CC') ? 1500 + Math.random() * 120 : 800 + Math.random() * 200,
        refractoryHealth,
        location: startStation,
        previousLocation: 'SCRAP',
        status: getInitialStatus(startStation),
        lastMaintenance: new Date(Date.now() - (15 + (i * 3)) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        cyclesCompleted,
        travelDistance: cyclesCompleted * 2.4 + Math.random() * 5,
        idleDuration: 0,
        transferDuration: 0,
        heatRetention: 92 + Math.random() * 5,
        routeHistory: ['SCRAP', startStation],
        currentCoordinate: { x: station.x, y: station.y },
        targetCoordinate: { x: station.x, y: station.y },
        transitProgress: 0, // 0 to 100
        materialWeight: startStation.startsWith('BF') || startStation === 'BOF' || startStation.startsWith('LF') || startStation === 'RH' || startStation.startsWith('CC') ? 130 + Math.random() * 20 : 0,
        slagWeight: startStation.startsWith('BF') || startStation === 'BOF' || startStation.startsWith('LF') || startStation === 'RH' || startStation.startsWith('CC') ? 5 + Math.random() * 8 : 0,
        timeInState: 0,
        hotspotDetected: false,
        hotspotSize: 0,
        hotspotDelta: 0,
        hotspotSeverity: 'NONE'
      };
    });

    // 3 overhead Cranes
    const initialCranes = [
      { id: 'CRN-01', name: 'Charge Crane', x: 250, y: 170, activeLadle: null, status: 'IDLE' },
      { id: 'CRN-02', name: 'Refining Crane', x: 550, y: 170, activeLadle: null, status: 'IDLE' },
      { id: 'CRN-03', name: 'Casting Crane', x: 750, y: 170, activeLadle: null, status: 'IDLE' }
    ];

    setLadles(initialLadles);
    setCranes(initialCranes);

    // Initial alert and log list
    setAlerts([
      { id: 1, timestamp: new Date().toLocaleTimeString(), category: 'INFO', severity: 'INFO', message: 'SteelTwin Platform Initialized - Monitoring active.', location: 'SYSTEM' },
      { id: 2, timestamp: new Date(Date.now() - 10000).toLocaleTimeString(), category: 'Sensor', severity: 'LOW', message: 'Vibration sensor VIB-102 recalibrated.', location: 'LF1' }
    ]);
    nextAlertId.current = 3;
  }, []);

  function getInitialStatus(station) {
    if (station.startsWith('BF')) return 'FILLING';
    if (station === 'BOF') return 'FULL';
    if (station.startsWith('LF')) return 'FULL';
    if (station === 'RH') return 'FULL';
    if (station.startsWith('CC')) return 'POURING';
    if (station === 'SLAG') return 'EMPTY';
    if (station === 'MAINT') return 'MAINTENANCE';
    if (station === 'PREHEAT') return 'HEATING';
    return 'IDLE';
  }

  // Trigger audio alert or speech synthesis
  const triggerAudioAlert = (message, severity) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      // Speak only high or critical alerts
      if (severity === 'CRITICAL' || severity === 'HIGH') {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.rate = 1.0;
        utterance.pitch = 0.9;
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  // Function to create alerts
  const addAlert = (category, severity, message, location) => {
    const time = new Date().toLocaleTimeString();
    const newAlert = {
      id: nextAlertId.current++,
      timestamp: time,
      category,
      severity,
      message,
      location
    };
    setAlerts(prev => [newAlert, ...prev].slice(0, 1000));
    triggerAudioAlert(message, severity);
  };

  // Generate Work Order
  const addWorkOrder = (ladleId, issue, priority, recommendations) => {
    const alreadyExists = workOrders.some(wo => wo.ladleId === ladleId && wo.status !== 'COMPLETED');
    if (alreadyExists) return;

    const newWO = {
      id: `WO-${String(nextWorkOrderId.current++).padStart(4, '0')}`,
      ladleId,
      issue,
      priority,
      status: 'PENDING',
      createdDate: new Date().toISOString().split('T')[0],
      recommendations,
      assignedTeam: ['Refractory Crew A', 'Maintenance Crew B', 'Sensors Specialists'][Math.floor(Math.random() * 3)]
    };
    setWorkOrders(prev => [newWO, ...prev]);
    addAlert('Maintenance', priority === 'IMMEDIATE' ? 'HIGH' : 'MEDIUM', `Auto-generated work order ${newWO.id} for ${ladleId} (${issue})`, 'MAINT');
  };

  // Trigger manual anomalies
  const triggerAnomaly = (type, target) => {
    setManualAnomalies(prev => ({ ...prev, [type]: target }));
    if (type === 'heatLeak') {
      addAlert('Heat Leak', 'HIGH', `MANUAL TRIGGER: Hotspot detected on ${target} shell!`, target);
    } else if (type === 'ppeViolation') {
      addAlert('PPE Violation', 'CRITICAL', `MANUAL TRIGGER: Unsafe worker detected on ${STATIONS[target].name} floor. Missing Helmet!`, target);
    } else if (type === 'gasLeak') {
      addAlert('Gas Leak', 'CRITICAL', `MANUAL TRIGGER: CO and SO2 gas sensors spike near ${STATIONS[target].name}.`, target);
    } else if (type === 'sensorFailure') {
      addAlert('Sensor Failure', 'MEDIUM', `MANUAL TRIGGER: Telemetry sensor ${target} stopped responding.`, 'SYSTEM');
    } else if (type === 'spill') {
      addAlert('Spill', 'CRITICAL', `MANUAL TRIGGER: Molten metal splash/spill detected at casting pit!`, target);
    }
  };

  const clearAnomaly = (type) => {
    setManualAnomalies(prev => ({ ...prev, [type]: null }));
  };

  // Perform maintenance manual fix
  const repairLadle = (ladleId) => {
    setLadles(prev => prev.map(l => {
      if (l.ladleId === ladleId) {
        // Find corresponding work order and complete it
        setWorkOrders(wos => wos.map(wo => wo.ladleId === ladleId ? { ...wo, status: 'COMPLETED' } : wo));
        addAlert('Maintenance', 'INFO', `Refractory repair completed on ${ladleId}. Health restored.`, 'MAINT');
        return {
          ...l,
          refractoryHealth: 100,
          lastMaintenance: new Date().toISOString().split('T')[0],
          hotspotDetected: false,
          hotspotSize: 0,
          hotspotDelta: 0,
          hotspotSeverity: 'NONE'
        };
      }
      return l;
    }));
    if (manualAnomalies.heatLeak === ladleId) {
      clearAnomaly('heatLeak');
    }
    if (manualAnomalies.spill === ladleId) {
      clearAnomaly('spill');
    }
  };

  // Main simulation effect loop
  useEffect(() => {
    if (speed === 0) return; // Paused

    const interval = setInterval(() => {
      // 1. Update Ladle States & Movements
      setLadles(prevLadles => {
        return prevLadles.map(ladle => {
          let {
            ladleId,
            location,
            previousLocation,
            status,
            currentTemperature,
            refractoryHealth,
            cyclesCompleted,
            travelDistance,
            idleDuration,
            transferDuration,
            heatRetention,
            routeHistory,
            currentCoordinate,
            transitProgress,
            materialWeight,
            slagWeight,
            timeInState,
            hotspotDetected,
            hotspotSize,
            hotspotDelta,
            hotspotSeverity
          } = ladle;

          timeInState += 1 * speed;

          // Apply manual heat leak anomaly
          if (manualAnomalies.heatLeak === ladleId) {
            hotspotDetected = true;
            hotspotSize = Math.min(2.5, hotspotSize + 0.05 * speed);
            hotspotDelta = Math.min(450, hotspotDelta + 15 * speed);
            hotspotSeverity = hotspotDelta > 350 ? 'CRITICAL' : hotspotDelta > 200 ? 'HIGH' : 'MEDIUM';
            refractoryHealth = Math.max(5, refractoryHealth - 0.3 * speed);
            currentTemperature = Math.max(1200, currentTemperature - 4 * speed); // Heat escape causes faster cooling
          } else {
            // Natural refractory degradation
            refractoryHealth = Math.max(10, refractoryHealth - 0.002 * speed);
          }

          // Trigger predictive maintenance if refractory health is low
          if (refractoryHealth < 75) {
            addWorkOrder(
              ladleId,
              `Refractory wear critical (${Math.floor(refractoryHealth)}% health)`,
              refractoryHealth < 60 ? 'IMMEDIATE' : 'HIGH',
              `Inspect inner brick layer. Relining of slag line required. Perform hot patch repair.`
            );
          }

          // State Machine
          if (status === 'TRANSIT') {
            transferDuration += 1 * speed;
            transitProgress += 4 * speed; // Speed of movement

            // Smooth linear interpolation on coordinates
            const sourceStation = STATIONS[previousLocation];
            const destStation = STATIONS[location];
            
            if (transitProgress >= 100) {
              // Arrived!
              currentCoordinate = { x: destStation.x, y: destStation.y };
              transitProgress = 0;
              timeInState = 0;
              
              // Transition to station operation status
              status = getStationWorkStatus(location);
              routeHistory = [...routeHistory, location].slice(-10); // Keep last 10
              
              // Telemetry alert on arrival
              addAlert('Tracking', 'INFO', `Ladle ${ladleId} arrived at ${destStation.name}`, location);
            } else {
              // Interpolate
              const pct = transitProgress / 100;
              currentCoordinate = {
                x: sourceStation.x + (destStation.x - sourceStation.x) * pct,
                y: sourceStation.y + (destStation.y - sourceStation.y) * pct
              };
            }

            // Cooling down in transit
            const heatLossFactor = manualAnomalies.heatLeak === ladleId ? 5.0 : 1.2;
            currentTemperature = Math.max(1000, currentTemperature - (heatLossFactor / heatRetention) * speed);
            travelDistance += 0.05 * speed;

          } else {
            // Ladle is AT STATION
            idleDuration += 1 * speed;

            // Define work completion times (number of ticks at station)
            const workDuration = getStationWorkDuration(location);

            // Temperature changes depending on station
            if (location.startsWith('BF')) {
              // Filling with molten iron (from Blast Furnace)
              status = 'FILLING';
              materialWeight = Math.min(145, materialWeight + 10 * speed);
              slagWeight = Math.min(10, slagWeight + 0.8 * speed);
              currentTemperature = Math.min(1600, currentTemperature + 25 * speed);
            } else if (location === 'BOF') {
              // Refining
              status = 'FULL';
              currentTemperature = Math.min(1650, currentTemperature + 15 * speed);
              // Spill anomaly check
              if (manualAnomalies.spill === ladleId && timeInState > 2) {
                materialWeight = Math.max(80, materialWeight - 8 * speed);
                addAlert('CV Spill', 'CRITICAL', `Molten metal spill/overflow detected at Basic Oxygen Furnace!`, 'BOF');
              }
            } else if (location.startsWith('LF')) {
              // Heating & alloying
              status = 'FULL';
              currentTemperature = Math.min(1630, currentTemperature + 10 * speed); // Heat input
            } else if (location === 'RH') {
              // Degassing
              status = 'FULL';
              currentTemperature = Math.max(1520, currentTemperature - 1 * speed);
            } else if (location.startsWith('CC')) {
              // Pouring steel into Tundish
              status = 'POURING';
              materialWeight = Math.max(0, materialWeight - 12 * speed);
              slagWeight = Math.max(0, slagWeight - 0.8 * speed);
              currentTemperature = Math.max(1480, currentTemperature - 3 * speed);
            } else if (location === 'SLAG') {
              // Dumper
              status = 'EMPTY';
              materialWeight = 0;
              slagWeight = 0;
              currentTemperature = Math.max(900, currentTemperature - 20 * speed);
            } else if (location === 'PREHEAT') {
              // Preheating empty ladle
              status = 'HEATING';
              currentTemperature = Math.min(1250, currentTemperature + 40 * speed);
            } else if (location === 'MAINT') {
              status = 'MAINTENANCE';
              // Slow cooling down
              currentTemperature = Math.max(100, currentTemperature - 30 * speed);
              // Auto-repair after time if health is bad
              if (refractoryHealth < 80 && timeInState > 15) {
                refractoryHealth = 100;
                cyclesCompleted = 0;
                addAlert('Maintenance', 'INFO', `${ladleId} refractory lining fully restored.`, 'MAINT');
              }
            }

            // Check if station operation is done -> Trigger Next Destination
            if (timeInState >= workDuration) {
              const nextStation = getNextStation(location, ladleId);
              previousLocation = location;
              location = nextStation;
              status = 'TRANSIT';
              transitProgress = 0;
              timeInState = 0;

              // Check if we completed a full cycle
              if (location.startsWith('BF')) {
                cyclesCompleted += 1;
              }

              addAlert('Tracking', 'INFO', `Ladle ${ladleId} departing ${STATIONS[previousLocation].name} to ${STATIONS[location].name}`, previousLocation);
            }
          }

          return {
            ...ladle,
            location,
            previousLocation,
            status,
            currentTemperature: Math.round(currentTemperature),
            refractoryHealth,
            cyclesCompleted,
            travelDistance: parseFloat(travelDistance.toFixed(2)),
            idleDuration,
            transferDuration,
            routeHistory,
            currentCoordinate,
            targetCoordinate: { x: STATIONS[location].x, y: STATIONS[location].y },
            transitProgress,
            materialWeight: Math.round(materialWeight),
            slagWeight: Math.round(slagWeight),
            timeInState,
            hotspotDetected,
            hotspotSize,
            hotspotDelta,
            hotspotSeverity
          };
        });
      });

      // 2. Update Crane Positions
      // 3. Generate Telemetry Logs & Sensor Readings
      setLadles(currentLadles => {
        const timestamp = new Date();
        const logs = [];
        
        currentLadles.forEach(l => {
          // Inner wall temperature
          logs.push({
            timestamp: timestamp.toISOString(),
            ladleId: l.ladleId,
            sensorId: `TEMP-IN-${l.ladleId}`,
            value: l.currentTemperature,
            unit: '°C',
            location: l.location
          });
          // Shell temperature
          const shellTemp = l.currentTemperature * 0.22 + (l.hotspotDetected ? l.hotspotDelta : 0) + (Math.random() * 8);
          logs.push({
            timestamp: timestamp.toISOString(),
            ladleId: l.ladleId,
            sensorId: `TEMP-SH-${l.ladleId}`,
            value: Math.round(shellTemp),
            unit: '°C',
            location: l.location
          });
          // Weight
          logs.push({
            timestamp: timestamp.toISOString(),
            ladleId: l.ladleId,
            sensorId: `WT-${l.ladleId}`,
            value: l.materialWeight + l.slagWeight,
            unit: 'tons',
            location: l.location
          });
          // Vibration
          let vib = 0.5 + Math.random() * 0.5;
          if (l.status === 'TRANSIT') vib = 2.5 + Math.random() * 1.5;
          if (l.location === 'BOF' && l.status === 'FULL') vib = 6.8 + Math.random() * 4.0;
          logs.push({
            timestamp: timestamp.toISOString(),
            ladleId: l.ladleId,
            sensorId: `VIB-${l.ladleId}`,
            value: parseFloat(vib.toFixed(2)),
            unit: 'RMS (g)',
            location: l.location
          });
        });

        // Add gas sensor readings around selected station
        const coValue = Math.round(8 + Math.random() * 4 + (manualAnomalies.gasLeak ? 120 : 0));
        logs.push({
          timestamp: timestamp.toISOString(),
          ladleId: 'ALL',
          sensorId: `GAS-CO-${selectedStation}`,
          value: coValue,
          unit: 'ppm',
          location: selectedStation
        });

        setTelemetryBuffer(prev => [...logs, ...prev].slice(0, 1000));
        return currentLadles;
      });

    }, 1000);

    return () => clearInterval(interval);
  // The simulation engine intentionally owns these locally defined state-machine helpers.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speed, manualAnomalies, selectedStation]);

  // Routing sequences
  function getNextStation(currentLoc, ladleId) {
    const isOdd = parseInt(ladleId.replace('LAD-10', '')) % 2 === 1;

    switch (currentLoc) {
      case 'BF1':
      case 'BF2':
        return 'BOF';
      case 'BOF':
        return isOdd ? 'LF1' : 'LF2';
      case 'LF1':
      case 'LF2':
        return 'RH';
      case 'RH':
        return isOdd ? 'CC1' : 'CC2';
      case 'CC1':
      case 'CC2':
        return 'SLAG';
      case 'SLAG':
        // Check if refractory health is < 85, if so send to MAINTENANCE, else PREHEAT
        // Fetch current health for this ladle
        const l = ladles.find(ldl => ldl.ladleId === ladleId);
        if (l && l.refractoryHealth < 85) {
          return 'MAINT';
        }
        return 'PREHEAT';
      case 'MAINT':
        return 'PREHEAT';
      case 'PREHEAT':
        return isOdd ? 'BF1' : 'BF2';
      default:
        return isOdd ? 'BF1' : 'BF2';
    }
  }

  function getStationWorkStatus(loc) {
    if (loc.startsWith('BF')) return 'FILLING';
    if (loc === 'BOF') return 'FULL';
    if (loc.startsWith('LF')) return 'FULL';
    if (loc === 'RH') return 'FULL';
    if (loc.startsWith('CC')) return 'POURING';
    if (loc === 'SLAG') return 'EMPTY';
    if (loc === 'MAINT') return 'MAINTENANCE';
    if (loc === 'PREHEAT') return 'HEATING';
    return 'IDLE';
  }

  function getStationWorkDuration(loc) {
    // Return ticks required at each station
    switch (loc) {
      case 'BF1':
      case 'BF2':
        return 12; // Time to fill
      case 'BOF':
        return 8; // Time to blow/convert
      case 'LF1':
      case 'LF2':
        return 10; // Metallurgy refining
      case 'RH':
        return 6; // Degassing
      case 'CC1':
      case 'CC2':
        return 15; // Pouring steel
      case 'SLAG':
        return 4; // Slag dump
      case 'MAINT':
        return 15; // Relining inspection
      case 'PREHEAT':
        return 8; // Heating before furnace
      default:
        return 10;
    }
  }

  return (
    <SimulationContext.Provider value={{
      speed,
      setSpeed,
      ladles,
      setLadles,
      cranes,
      alerts,
      setAlerts,
      workOrders,
      setWorkOrders,
      telemetryBuffer,
      activeCameraId,
      setActiveCameraId,
      activeLadleId,
      setActiveLadleId,
      selectedStation,
      setSelectedStation,
      manualAnomalies,
      triggerAnomaly,
      clearAnomaly,
      repairLadle,
      addAlert
    }}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
}

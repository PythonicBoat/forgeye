import json
import random
from datetime import datetime, timedelta

def generate_dataset():
    ladles = ['LAD-1001', 'LAD-1002', 'LAD-1003', 'LAD-1004', 'LAD-1005', 
               'LAD-1006', 'LAD-1007', 'LAD-1008', 'LAD-1009', 'LAD-1010']
    stations = ['BF1', 'BF2', 'BOF', 'LF1', 'LF2', 'RH', 'CC1', 'CC2', 'SLAG', 'MAINT', 'PREHEAT']
    
    start_time = datetime(2026, 1, 1)
    end_time = datetime(2026, 12, 31, 23, 59, 59)
    total_records = 100000
    
    delta_seconds = int((end_time - start_time).total_seconds())
    
    data = []
    # Generate time steps evenly spaced across the year
    step = delta_seconds / total_records
    
    # Track states of each ladle to make them realistic
    ladle_states = {}
    for l in ladles:
        ladle_states[l] = {
            'location': random.choice(stations),
            'temp': 1200 + random.randint(0, 300),
            'weight': 130 + random.randint(0, 20),
            'status': 'FULL'
        }

    for i in range(total_records):
        t = start_time + timedelta(seconds=i * step)
        ladle = ladles[i % len(ladles)]
        
        # State machine update
        state = ladle_states[ladle]
        if random.random() < 0.1: # 10% chance to transition
            state['location'] = random.choice(stations)
            if state['location'].startswith('BF') or state['location'] == 'BOF':
                state['status'] = 'FILLING' if random.random() > 0.5 else 'FULL'
                state['temp'] = 1500 + random.randint(0, 150)
                state['weight'] = 130 + random.randint(0, 20)
            elif state['location'].startswith('CC'):
                state['status'] = 'POURING'
                state['temp'] = 1450 + random.randint(0, 100)
                state['weight'] = random.randint(10, 50)
            elif state['location'] == 'SLAG':
                state['status'] = 'EMPTY'
                state['temp'] = 900 + random.randint(0, 200)
                state['weight'] = 0
            elif state['location'] == 'MAINT':
                state['status'] = 'MAINTENANCE'
                state['temp'] = 100 + random.randint(0, 400)
                state['weight'] = 0
            else:
                state['status'] = 'HEATING'
                state['temp'] = 800 + random.randint(0, 400)
                state['weight'] = 0
        
        # Add slight temperature/weight fluctuations
        if state['status'] == 'FULL':
            state['temp'] = max(1000, state['temp'] - random.randint(1, 5))
        elif state['status'] == 'FILLING':
            state['temp'] = min(1600, state['temp'] + random.randint(5, 15))
            state['weight'] = min(150, state['weight'] + random.randint(1, 4))
        
        data.append({
            'timestamp': t.strftime('%Y-%m-%dT%H:%M:%SZ'),
            'ladleId': ladle,
            'location': state['location'],
            'status': state['status'],
            'temperature': state['temp'],
            'weight': round(state['weight'], 1)
        })
        
    with open('telemetry_100k.json', 'w') as f:
        json.dump(data, f, indent=2)
    print("Generation complete!")

if __name__ == '__main__':
    generate_dataset()

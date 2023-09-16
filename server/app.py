from flask import Flask, jsonify

app = Flask(__name__)

# Sample data (replace this with your real-time data handling)
data = [
    {"name": "Sensor 1", "value": 50},
    {"name": "Sensor 2", "value": 75},
    {"name": "Sensor 3", "value": 60},
]

@app.route('/api/data', methods=['GET'])
def get_data():
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)

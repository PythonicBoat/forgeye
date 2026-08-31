from datetime import datetime, timezone
import os
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory

BUILD_DIR = Path(__file__).resolve().parent.parent / "client" / "build"
app = Flask(__name__, static_folder=str(BUILD_DIR / "static"), static_url_path="/static")
STATIONS = ["BF1", "BF2", "BOF", "LF1", "LF2", "RH", "CC1", "CC2", "SLAG", "MAINT"]
STATUSES = ["FILLING", "TRANSIT", "FULL", "POURING", "EMPTY", "MAINTENANCE"]
DATA_MODE = os.getenv("FORGEYE_DATA_MODE", "demo").lower()
ALLOWED_ORIGIN = os.getenv("FORGEYE_ALLOWED_ORIGIN", "")


def now():
    return datetime.now(timezone.utc).isoformat()


def build_ladles():
    return [
        {
            "ladleId": f"LAD-{1001 + index}",
            "capacity": 150,
            "currentTemperature": 1460 + (index * 13),
            "refractoryHealth": 96 - (index * 2),
            "location": STATIONS[index],
            "status": STATUSES[index % len(STATUSES)],
            "cyclesCompleted": 44 + (index * 7),
            "materialWeight": 140 if index < 8 else 0,
            "hotspotDetected": False,
            "hotspotSeverity": "NONE",
        }
        for index in range(10)
    ]


LADLES = build_ladles()
ALERTS = [
    {
        "id": 1,
        "timestamp": now(),
        "category": "Tracking",
        "severity": "INFO",
        "message": "ESP32 telemetry network online.",
        "location": "SYSTEM",
    }
]
WORK_ORDERS = []


def refresh_live_state():
    return None


def telemetry():
    timestamp = now()
    rows = []
    for ladle in LADLES:
        rows.extend(
            [
                {
                    "timestamp": timestamp,
                    "ladleId": ladle["ladleId"],
                    "sensorId": f"TEMP-IN-{ladle['ladleId']}",
                    "value": ladle["currentTemperature"],
                    "unit": "°C",
                    "location": ladle["location"],
                },
                {
                    "timestamp": timestamp,
                    "ladleId": ladle["ladleId"],
                    "sensorId": f"TEMP-SH-{ladle['ladleId']}",
                    "value": round(ladle["currentTemperature"] * 0.22),
                    "unit": "°C",
                    "location": ladle["location"],
                },
            ]
        )
    return rows


def filtered(items):
    result = list(items)
    for field in ("ladleId", "status", "location", "severity", "category", "priority"):
        expected = request.args.get(field)
        if expected:
            result = [
                item for item in result
                if str(item.get(field, "")).lower() == expected.lower()
            ]
    limit = request.args.get("limit", type=int)
    return result[:max(limit, 0)] if limit is not None else result


def response(resource, items):
    data = filtered(items)
    return jsonify({
        "status": "success",
        "resource": resource,
        "timestamp": now(),
        "data_mode": DATA_MODE,
        "authoritative": DATA_MODE == "live",
        "count": len(data),
        "filters_applied": request.args.to_dict(),
        "data": data,
    })


@app.after_request
def allow_client(response):
    if ALLOWED_ORIGIN:
        response.headers["Access-Control-Allow-Origin"] = ALLOWED_ORIGIN
    response.headers["Cache-Control"] = "no-store"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    return response


@app.route("/api", methods=["GET"])
def api_root():
    return jsonify({
        "message": "Forgeye REST API",
        "status": "online",
        "data_mode": DATA_MODE,
        "authoritative": DATA_MODE == "live",
        "hardware_node": "ESP32 Edge Node",
        "protocol": "Modbus over TCP/IP",
        "timestamp": now(),
        "endpoints": {
            "ladles": "/api/ladles",
            "telemetry": "/api/telemetry",
            "alerts": "/api/alerts",
            "work-orders": "/api/work-orders",
        },
    })

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "data_mode": DATA_MODE,
        "authoritative": DATA_MODE == "live",
        "timestamp": now(),
    })


@app.route("/api/ladles", methods=["GET"])
def get_ladles():
    refresh_live_state()
    return response("ladles", LADLES)


@app.route("/api/telemetry", methods=["GET"])
def get_telemetry():
    refresh_live_state()
    return response("telemetry", telemetry())


@app.route("/api/alerts", methods=["GET"])
def get_alerts():
    return response("alerts", ALERTS)


@app.route("/api/work-orders", methods=["GET"])
def get_work_orders():
    return response("work-orders", WORK_ORDERS)


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_react_app(path):
    if path == "api" or path.startswith("api/"):
        return jsonify({"status": "error", "error": "Unknown REST resource", "timestamp": now()}), 404
    requested_file = BUILD_DIR / path
    if path and requested_file.is_file():
        return send_from_directory(BUILD_DIR, path)
    return send_from_directory(BUILD_DIR, "index.html")


@app.errorhandler(404)
def not_found(_error):
    return jsonify({"status": "error", "error": "Unknown REST resource", "timestamp": now()}), 404


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=False, use_reloader=False)

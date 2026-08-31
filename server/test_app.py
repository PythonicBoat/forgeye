import unittest

from app import app


class ForgeyeApiTest(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_root_reports_esp32_and_endpoints(self):
        payload = self.client.get("/api").get_json()

        self.assertEqual(payload["hardware_node"], "ESP32 Edge Node")
        self.assertIn("ladles", payload["endpoints"])
        self.assertFalse(payload["authoritative"])

    def test_health_reports_data_mode(self):
        payload = self.client.get("/api/health").get_json()

        self.assertEqual(payload["status"], "healthy")
        self.assertEqual(payload["data_mode"], "demo")

    def test_site_root_serves_react_app(self):
        response = self.client.get("/")

        self.assertEqual(response.status_code, 200)
        self.assertIn(b"<div id=\"root\"></div>", response.data)

    def test_ladles_endpoint_supports_limit(self):
        payload = self.client.get("/api/ladles?limit=2").get_json()

        self.assertEqual(payload["status"], "success")
        self.assertEqual(payload["count"], 2)

    def test_unknown_resource_returns_404(self):
        response = self.client.get("/api/not-real")

        self.assertEqual(response.status_code, 404)


if __name__ == "__main__":
    unittest.main()

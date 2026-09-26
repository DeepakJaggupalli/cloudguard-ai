import random
from datetime import datetime

class TelemetryGenerator:
  def __init__(self):
    self.active_scenario = "normal_load"
    self.tick_counter = 0

  def set_scenario(self, scenario: str):
    allowed = ["normal_load", "cpu_spike", "memory_leak", "db_pool_leak", "latency_burst"]
    if scenario in allowed:
      self.active_scenario = scenario
      return True
    return False

  def generate_tick(self):
    self.tick_counter += 1
    now_str = datetime.now().strftime("%H:%M:%S")

    if self.active_scenario == "cpu_spike":
      cpu = round(random.uniform(92.0, 98.5), 1)
      memory = round(random.uniform(75.0, 85.0), 1)
      latency = random.randint(750, 950)
      error_rate = round(random.uniform(12.0, 18.0), 1)
    elif self.active_scenario == "memory_leak":
      cpu = round(random.uniform(60.0, 75.0), 1)
      memory = min(99.0, round(70.0 + (self.tick_counter % 20) * 1.4, 1))
      latency = random.randint(300, 600)
      error_rate = round(random.uniform(3.0, 6.0), 1)
    elif self.active_scenario == "db_pool_leak":
      cpu = round(random.uniform(85.0, 92.0), 1)
      memory = round(random.uniform(82.0, 88.0), 1)
      latency = random.randint(600, 850)
      error_rate = round(random.uniform(8.0, 14.0), 1)
    elif self.active_scenario == "latency_burst":
      cpu = round(random.uniform(55.0, 68.0), 1)
      memory = round(random.uniform(65.0, 72.0), 1)
      latency = random.randint(1200, 1850)
      error_rate = round(random.uniform(4.0, 9.0), 1)
    else: # normal_load
      cpu = round(random.uniform(38.0, 52.0), 1)
      memory = round(random.uniform(58.0, 66.0), 1)
      latency = random.randint(40, 110)
      error_rate = round(random.uniform(0.01, 0.4), 2)

    return {
      "timestamp": now_str,
      "cpu": cpu,
      "memory": memory,
      "disk": round(52.0 + (self.tick_counter % 10) * 0.2, 1),
      "networkIn": random.randint(140, 380),
      "networkOut": random.randint(210, 520),
      "iops": random.randint(1100, 4200),
      "latency": latency,
      "packetLoss": round(random.uniform(0.01, 1.2), 2),
      "temperature": round(random.uniform(52.0, 66.0), 1),
      "errorRate": error_rate,
      "scenario": self.active_scenario
    }

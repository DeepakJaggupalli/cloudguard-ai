import { TelemetryPoint, TimeRange } from '../types';

export const generateMockTelemetry = (range: TimeRange): TelemetryPoint[] => {
  const points: TelemetryPoint[] = [];
  const now = Date.now();
  let count = 20;
  let intervalMs = 60 * 1000;

  switch (range) {
    case '1m':
      count = 12;
      intervalMs = 5 * 1000;
      break;
    case '5m':
      count = 20;
      intervalMs = 15 * 1000;
      break;
    case '15m':
      count = 30;
      intervalMs = 30 * 1000;
      break;
    case '1h':
      count = 24;
      intervalMs = 2.5 * 60 * 1000;
      break;
    case '24h':
      count = 24;
      intervalMs = 60 * 60 * 1000;
      break;
  }

  for (let i = count - 1; i >= 0; i--) {
    const timestamp = new Date(now - i * intervalMs).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: range === '1m' || range === '5m' ? '2-digit' : undefined,
    });

    // Add a synthetic spike in recent points to show realistic anomaly curves
    const isRecentSpike = i < 4;
    const cpu = isRecentSpike ? 88 + Math.random() * 8 : 42 + Math.sin(i / 2) * 12 + Math.random() * 5;
    const memory = isRecentSpike ? 89 + Math.random() * 5 : 64 + Math.cos(i / 3) * 6 + Math.random() * 3;
    const disk = 52 + (count - i) * 0.15;
    const networkIn = isRecentSpike ? 340 + Math.random() * 50 : 180 + Math.random() * 30;
    const networkOut = isRecentSpike ? 490 + Math.random() * 60 : 220 + Math.random() * 40;
    const iops = isRecentSpike ? 3800 + Math.random() * 600 : 1200 + Math.random() * 200;
    const latency = isRecentSpike ? 680 + Math.random() * 150 : 115 + Math.random() * 25;
    const packetLoss = isRecentSpike ? 1.4 + Math.random() * 0.8 : 0.02 + Math.random() * 0.05;
    const temperature = isRecentSpike ? 68 + Math.random() * 4 : 54 + Math.random() * 3;

    points.push({
      timestamp,
      cpu: Number(cpu.toFixed(1)),
      memory: Number(memory.toFixed(1)),
      disk: Number(disk.toFixed(1)),
      networkIn: Math.round(networkIn),
      networkOut: Math.round(networkOut),
      iops: Math.round(iops),
      latency: Math.round(latency),
      packetLoss: Number(packetLoss.toFixed(2)),
      temperature: Number(temperature.toFixed(1)),
    });
  }

  return points;
};

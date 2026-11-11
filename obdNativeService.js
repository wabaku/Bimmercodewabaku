// Native Bluetooth Low Energy (BLE) & Wi-Fi ENET Bridge for Capacitor Android
import { BleClient } from '@capacitor-community/bluetooth-le';

// Common OBD-II BLE UUIDs (Vgate vLinker, OBDLink CX, ELM327 BLE)
export const OBD_SERVICE_UUID = '0000fff0-0000-1000-8000-00805f9b34fb';
export const OBD_WRITE_UUID   = '0000fff2-0000-1000-8000-00805f9b34fb';
export const OBD_NOTIFY_UUID  = '0000fff1-0000-1000-8000-00805f9b34fb';

export class NativeOBDService {
  constructor() {
    this.deviceId = null;
  }

  async initializeBLE() {
    await BleClient.initialize({ androidNeverForLocation: true });
  }

  async scanAndConnect(onDataReceived) {
    await this.initializeBLE();
    const device = await BleClient.requestDevice({
      services: [OBD_SERVICE_UUID],
      optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb']
    });
    this.deviceId = device.deviceId;
    await BleClient.connect(this.deviceId, (disconnectedDeviceId) => {
      console.log('Disconnected from:', disconnectedDeviceId);
    });

    await BleClient.startNotifications(
      this.deviceId,
      OBD_SERVICE_UUID,
      OBD_NOTIFY_UUID,
      (value) => {
        const text = new TextDecoder().decode(value);
        if (onDataReceived) onDataReceived(text);
      }
    );

    // Initialize ELM327 / STN1110 / vLinker
    await this.sendCommand('ATZ\r');
    await this.sendCommand('ATE0\r');
    await this.sendCommand('ATSP6\r'); // ISO 15765-4 CAN (11 bit ID, 500 kbaud)
    return device;
  }

  async sendCommand(cmd) {
    if (!this.deviceId) throw new Error('OBD Adapter not connected');
    const encoder = new TextEncoder();
    const data = encoder.encode(cmd.endsWith('\r') ? cmd : cmd + '\r');
    await BleClient.write(this.deviceId, OBD_SERVICE_UUID, OBD_WRITE_UUID, new DataView(data.buffer));
  }
}

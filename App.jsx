import React, { useState } from 'react';

export default function App() {
  const [connected, setConnected] = useState(false);
  const [adapter, setAdapter] = useState('vLinker MC+ BLE');
  const [voltage, setVoltage] = useState(13.8);
  const [selectedEcu, setSelectedEcu] = useState('BDC_BODY2');
  const [logs, setLogs] = useState([
    '[SYS] BimmerTech Studio Android Build Ready.',
    '[SYS] Capacitor BLE & Socket Bridge Initialized.'
  ]);

  const ecus = [
    { id: 'BDC_BODY2', name: 'Body Domain Controller', status: 'OK', params: [
      { id: '3020_TCM_LOGIC', name: 'Auto Start/Stop Memory', value: 'aktiv (0x01)', offset: '0x3020', mask: '0x01' },
      { id: '3053_KOMFORT_SCHLIESSEN', name: 'Fold Mirrors on Lock', value: 'aktiv (0x00)', offset: '0x3053', mask: '0x0F' },
      { id: '3068_WELCOME_LIGHT', name: 'Angel Eyes Brightness', value: '100% (0x64)', offset: '0x3068', mask: '0xFF' }
    ]},
    { id: 'HU_MGU', name: 'Headunit MGU (iDrive 7)', status: 'OK', params: [
      { id: '3000_M_STARTUP', name: 'Boot Animation Logo', value: 'M Performance (0x01)', offset: '0x3000', mask: '0x07' },
      { id: '3000_VIDEO_SPEEDLOCK', name: 'Video in Motion', value: 'aktiv (0xFF)', offset: '0x3004', mask: '0xFF' },
      { id: '3002_ASD_SOUND', name: 'Active Sound Design (ASD)', value: 'nicht_aktiv (0x00)', offset: '0x3002', mask: '0x01' }
    ]},
    { id: 'DKOMBI4', name: 'Instrument Cluster', status: 'OK', params: [
      { id: '3000_BC_DIGITAL_V', name: 'Digital Speedometer', value: 'aktiv (0x01)', offset: '0x3000', mask: '0x01' },
      { id: '3001_ALPINA_LAYOUT', name: 'Cluster Theme Layout', value: 'M_SPORT (0x02)', offset: '0x3001', mask: '0x0F' }
    ]}
  ];

  const currentEcu = ecus.find(e => e.id === selectedEcu);

  const handleConnect = () => {
    setConnected(!connected);
    setLogs(prev => [...prev, !connected ? `[OBD] Connected via ${adapter} (ISO 15765-4 CAN 500k)` : '[OBD] Disconnected.']);
  };

  const handleCodeEcu = () => {
    if (voltage < 12.5) {
      setLogs(prev => [...prev, '[ERR] Voltage below 12.5V! Coding aborted for ECU safety.']);
      return;
    }
    setLogs(prev => [
      ...prev,
      `[UDS] > 10 03 (DiagnosticSessionControl: ExtendedSession) -> 50 03`,
      `[UDS] > 27 01 (SecurityAccess: RequestSeed) -> 67 01 4A 9F`,
      `[UDS] > 2E 30 20 01 (WriteDataByIdentifier ${selectedEcu}) -> 6E 30 20`,
      `[UDS] > 11 01 (ECUReset: HardReset) -> 51 01`,
      `[OK] ${selectedEcu} FDL Coding Completed Successfully.`
    ]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 font-sans">
      <header className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4 mb-4 gap-3">
        <div>
          <h1 className="text-xl font-bold text-sky-400">BimmerTech Studio Mobile</h1>
          <p className="text-xs text-slate-400">OBD-II / UDS / DoIP ECU Coding & Diagnostics</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs px-2.5 py-1 rounded bg-slate-900 border border-slate-800 font-mono">
            KL30: {voltage.toFixed(1)}V
          </span>
          <select
            value={adapter}
            onChange={e => setAdapter(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs rounded px-2.5 py-1.5"
          >
            <option>vLinker MC+ BLE</option>
            <option>OBDLink CX BLE</option>
            <option>ENET Wi-Fi / USB-C</option>
          </select>
          <button
            onClick={handleConnect}
            className={`px-4 py-1.5 rounded text-xs font-semibold ${connected ? 'bg-emerald-600' : 'bg-sky-600'}`}
          >
            {connected ? 'Connected' : 'Connect OBD'}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Control Units (ECUs)</h2>
          <div className="space-y-2">
            {ecus.map(ecu => (
              <button
                key={ecu.id}
                onClick={() => setSelectedEcu(ecu.id)}
                className={`w-full text-left p-2.5 rounded border text-sm transition ${
                  selectedEcu === ecu.id ? 'bg-sky-950/60 border-sky-500' : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="font-bold">{ecu.id}</div>
                <div className="text-xs text-slate-400">{ecu.name}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-base">{currentEcu.id} — {currentEcu.name}</h2>
              <p className="text-xs text-slate-400">CAFD_000017BE_085_010_142</p>
            </div>
            <button
              onClick={handleCodeEcu}
              disabled={!connected}
              className="px-4 py-2 bg-amber-600 disabled:opacity-40 text-xs font-bold rounded shadow"
            >
              Code ECU (UDS 0x2E)
            </button>
          </div>

          <div className="space-y-2 mb-4">
            {currentEcu.params.map(p => (
              <div key={p.id} className="p-3 bg-slate-950 border border-slate-800 rounded flex justify-between items-center">
                <div>
                  <div className="text-sm font-medium">{p.name}</div>
                  <div className="text-xs font-mono text-slate-500">{p.id} | Offset {p.offset} | Mask {p.mask}</div>
                </div>
                <span className="text-xs font-mono bg-sky-950 text-sky-300 border border-sky-800 px-2.5 py-1 rounded">
                  {p.value}
                </span>
              </div>
            ))}
          </div>

          <div className="bg-black border border-slate-800 rounded p-3 font-mono text-xs h-40 overflow-y-auto">
            {logs.map((L, idx) => (
              <div key={idx} className="text-emerald-400 mb-1">{L}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import { initializeCommunicationSystem, MusicalConductor, eventBus } from '../../../dist/modules/communication/index.js';

// Initialize the communication system to ensure sequences are registered
let conductorInstance;
try {
  const sys = initializeCommunicationSystem();
  conductorInstance = sys?.conductor ?? MusicalConductor.getInstance(eventBus);
} catch (e) {
  // Fallback: try to get instance directly if initialization fails
  try {
    conductorInstance = MusicalConductor.getInstance(eventBus);
  } catch (err) {
    console.log('MusicalConductor fallback initialization failed:', err);
  }
}

const MC = {
  play: (pluginId, sequenceId, context, priority) => conductorInstance.play(pluginId, sequenceId, context, priority),
  getStatus: () => conductorInstance.getStatus(),
  getStatistics: () => conductorInstance.getStatistics(),
  registerCIAPlugins: (...args) => conductorInstance.registerCIAPlugins(...args),
  on: (evt, cb, ctx) => conductorInstance.on(evt, cb, ctx),
  off: (evt, cb) => conductorInstance.off(evt, cb),
};

if (typeof globalThis !== 'undefined') {
  globalThis.MusicalConductor = MC;
} else if (typeof window !== 'undefined') {
  window.MusicalConductor = MC;
} else if (typeof global !== 'undefined') {
  global.MusicalConductor = MC;
}


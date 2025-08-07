/**
 * MusicalConductor E2E Test Application
 * 
 * This application demonstrates and tests MusicalConductor functionality
 * in a real browser environment using the npm package
 */

// Global state
let conductor = null;
let eventBus = null;
let communicationSystem = null;
let eventCount = 0;
let sequenceCount = 0;
let pluginCount = 0;
let errorCount = 0;

// DOM elements
const statusEl = document.getElementById('status');
const logContainer = document.getElementById('log-container');
const eventCountEl = document.getElementById('event-count');
const sequenceCountEl = document.getElementById('sequence-count');
const pluginCountEl = document.getElementById('plugin-count');
const errorCountEl = document.getElementById('error-count');

// Logging utility
function log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${type}`;
    logEntry.textContent = `[${timestamp}] ${message}`;
    logContainer.appendChild(logEntry);
    logContainer.scrollTop = logContainer.scrollHeight;
    
    // Also log to browser console with emoji prefixes
    const emoji = type === 'error' ? '❌' : type === 'warn' ? '⚠️' : type === 'info' ? 'ℹ️' : '📝';
    console.log(`${emoji} [E2E-TEST] ${message}`);
    
    if (type === 'error') {
        errorCount++;
        updateMetrics();
    }
}

// Update metrics display
function updateMetrics() {
    eventCountEl.textContent = eventCount;
    sequenceCountEl.textContent = sequenceCount;
    pluginCountEl.textContent = pluginCount;
    errorCountEl.textContent = errorCount;
}

// Status update utility
function updateStatus(message, type = 'info') {
    statusEl.textContent = message;
    statusEl.className = `status ${type}`;
    log(message, type);
}

// Initialize MusicalConductor
async function initializeConductor() {
    try {
        updateStatus('Loading MusicalConductor package...', 'info');
        
        // Import MusicalConductor from the npm package
        const { 
            initializeCommunicationSystem,
            MusicalConductor,
            EventBus,
            SPAValidator 
        } = await import('musical-conductor');
        
        log('✅ MusicalConductor package loaded successfully');
        
        // Initialize the communication system
        communicationSystem = initializeCommunicationSystem();
        conductor = communicationSystem.conductor;
        eventBus = communicationSystem.eventBus;
        
        log(`🎼 Communication system initialized`);
        log(`📊 Registered sequences: ${communicationSystem.sequenceResults.registeredSequences}`);
        
        // Set up event listeners for testing
        setupEventListeners();
        
        updateStatus('MusicalConductor initialized successfully!', 'success');
        
        // Enable test buttons
        document.querySelectorAll('button:not(#init-conductor)').forEach(btn => {
            btn.disabled = false;
        });
        
        return true;
    } catch (error) {
        log(`❌ Failed to initialize MusicalConductor: ${error.message}`, 'error');
        updateStatus('Failed to initialize MusicalConductor', 'error');
        console.error('Initialization error:', error);
        return false;
    }
}

// Set up event listeners for testing
function setupEventListeners() {
    if (!eventBus) return;
    
    // Listen to all MusicalConductor events
    const eventTypes = [
        'musical-conductor:beat:started',
        'musical-conductor:beat:completed',
        'musical-conductor:beat:error',
        'musical-conductor:sequence:started',
        'musical-conductor:sequence:completed',
        'musical-conductor:sequence:error'
    ];
    
    eventTypes.forEach(eventType => {
        eventBus.subscribe(eventType, (data) => {
            log(`🎵 Event: ${eventType}`, 'info');
            eventCount++;
            updateMetrics();
        });
    });
    
    log('📡 Event listeners set up for MusicalConductor events');
}

// Test EventBus functionality
function testEventBus() {
    if (!eventBus) {
        log('❌ EventBus not initialized', 'error');
        return;
    }
    
    log('🧪 Testing EventBus functionality...');
    
    // Test basic pub/sub
    const testEvent = 'e2e-test-event';
    let receivedData = null;
    
    const unsubscribe = eventBus.subscribe(testEvent, (data) => {
        receivedData = data;
        log(`📨 Received test event with data: ${JSON.stringify(data)}`);
        eventCount++;
        updateMetrics();
    });
    
    // Emit test event
    const testData = { message: 'Hello from E2E test!', timestamp: Date.now() };
    eventBus.emit(testEvent, testData);
    
    // Verify data was received
    setTimeout(() => {
        if (receivedData && receivedData.message === testData.message) {
            log('✅ EventBus test passed - data received correctly');
        } else {
            log('❌ EventBus test failed - data not received', 'error');
        }
        unsubscribe();
    }, 100);
}

// Test sequence execution
function testSequences() {
    if (!conductor) {
        log('❌ Conductor not initialized', 'error');
        return;
    }
    
    log('🧪 Testing sequence execution...');
    
    try {
        // Get available sequences
        const sequences = conductor.getRegisteredSequences();
        log(`📋 Available sequences: ${sequences.length}`);
        
        if (sequences.length > 0) {
            const firstSequence = sequences[0];
            log(`🎵 Testing sequence: ${firstSequence}`);
            
            // Start the sequence
            const requestId = conductor.startSequence(firstSequence, {
                testData: 'E2E test execution',
                timestamp: Date.now()
            });
            
            log(`🚀 Started sequence with request ID: ${requestId}`);
            sequenceCount++;
            updateMetrics();
        } else {
            log('⚠️ No sequences available for testing', 'warn');
        }
    } catch (error) {
        log(`❌ Sequence test failed: ${error.message}`, 'error');
    }
}

// Test plugin system
async function testPlugins() {
    if (!conductor) {
        log('❌ Conductor not initialized', 'error');
        return;
    }
    
    log('🧪 Testing plugin system...');
    
    try {
        // Create a test plugin
        const testPlugin = {
            name: 'E2E Test Plugin',
            version: '1.0.0',
            movements: [{
                name: 'Test Movement',
                beats: [{
                    beat: 1,
                    event: 'e2e-plugin-test',
                    timing: 'immediate',
                    data: { source: 'test-plugin' }
                }]
            }]
        };
        
        const testHandlers = {
            'Test Movement': (context) => {
                log(`🔌 Plugin handler executed with context: ${JSON.stringify(context)}`);
                return { success: true, message: 'Plugin test completed' };
            }
        };
        
        // Mount the plugin
        const mountResult = await conductor.mount(testPlugin, testHandlers, 'e2e-test-plugin');
        
        if (mountResult.success) {
            log('✅ Plugin mounted successfully');
            pluginCount++;
            updateMetrics();
            
            // Test plugin execution
            const playResult = conductor.play('e2e-test-plugin', 'E2E Test Plugin', {
                testData: 'Plugin execution test'
            });
            
            log(`🎮 Plugin play result: ${JSON.stringify(playResult)}`);
        } else {
            log(`❌ Plugin mount failed: ${mountResult.reason}`, 'error');
        }
    } catch (error) {
        log(`❌ Plugin test failed: ${error.message}`, 'error');
    }
}

// Test SPA validation
function testSPAValidation() {
    if (!eventBus) {
        log('❌ EventBus not initialized', 'error');
        return;
    }
    
    log('🧪 Testing SPA validation...');
    
    try {
        // This should trigger SPA validation warnings
        log('⚠️ Attempting direct eventBus.emit() call (should be caught by SPA validator)');
        
        // Direct emit call - this should be caught by SPA validator
        eventBus.emit('direct-emit-test', { 
            message: 'This is a direct emit call for testing SPA validation',
            timestamp: Date.now()
        });
        
        eventCount++;
        updateMetrics();
        
        log('📝 Check browser console for SPA validation warnings');
        
        // Proper way using conductor
        if (conductor) {
            log('✅ Now testing proper conductor.play() usage');
            // This would be the correct way, but we need a registered sequence
        }
        
    } catch (error) {
        log(`❌ SPA validation test failed: ${error.message}`, 'error');
    }
}

// Clear logs
function clearLogs() {
    logContainer.innerHTML = '<div class="log-entry info">Logs cleared</div>';
    eventCount = 0;
    sequenceCount = 0;
    errorCount = 0;
    updateMetrics();
    log('🧹 Logs cleared');
}

// Event listeners for buttons
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('init-conductor').addEventListener('click', initializeConductor);
    document.getElementById('test-eventbus').addEventListener('click', testEventBus);
    document.getElementById('test-sequences').addEventListener('click', testSequences);
    document.getElementById('test-plugins').addEventListener('click', testPlugins);
    document.getElementById('test-spa-validation').addEventListener('click', testSPAValidation);
    document.getElementById('clear-logs').addEventListener('click', clearLogs);
    
    // Disable test buttons initially
    document.querySelectorAll('button:not(#init-conductor)').forEach(btn => {
        btn.disabled = true;
    });
    
    log('🚀 E2E Test Application loaded and ready');
});

// Global error handler
window.addEventListener('error', (event) => {
    log(`💥 Global error: ${event.error.message}`, 'error');
    console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    log(`💥 Unhandled promise rejection: ${event.reason}`, 'error');
    console.error('Unhandled rejection:', event.reason);
});

// Export for testing
window.E2ETestApp = {
    initializeConductor,
    testEventBus,
    testSequences,
    testPlugins,
    testSPAValidation,
    clearLogs,
    getConductor: () => conductor,
    getEventBus: () => eventBus,
    getMetrics: () => ({
        eventCount,
        sequenceCount,
        pluginCount,
        errorCount
    })
};

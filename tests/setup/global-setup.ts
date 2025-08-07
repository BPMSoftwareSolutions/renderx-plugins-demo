/**
 * Jest Global Setup
 * Runs once before all tests start
 */

export default async function globalSetup() {
  console.log('🎼 Setting up MusicalConductor test environment...');
  
  // Set up global test environment variables
  process.env.NODE_ENV = 'test';
  process.env.JEST_WORKER_ID = process.env.JEST_WORKER_ID || '1';
  
  // Mock browser APIs that might be needed
  if (typeof window === 'undefined') {
    // Mock window object for Node.js environment
    (global as any).window = {
      location: { href: 'http://localhost:3000' },
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    };
    
    // Mock fetch for plugin loading tests
    (global as any).fetch = jest.fn();
    
    // Mock URL for blob URL creation
    (global as any).URL = {
      createObjectURL: jest.fn(() => 'blob:mock-url'),
      revokeObjectURL: jest.fn(),
    };
  }
  
  // Initialize test database or external services if needed
  // (Currently not needed for MusicalConductor)
  
  console.log('✅ MusicalConductor test environment ready');
}

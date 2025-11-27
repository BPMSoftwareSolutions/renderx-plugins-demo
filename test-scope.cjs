#!/usr/bin/env node

// Test if the issue is with variable scope
async function testScope() {
  const val1 = "test1";
  const val2 = "test2";
  
  const report = `
Value 1: ${val1}
Value 2: ${val2}
`;
  
  console.log(report);
}

testScope().catch(err => console.error('Error:', err.message));

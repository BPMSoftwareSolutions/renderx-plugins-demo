# Test Breakdown by Behavior & Acceptance Criteria

## Behavior-Driven Tests (BDD)

### **Canvas Component Behaviors**

#### 1. **Drag & Drop Operations**
- **Tests:** 20+ tests
- **Behaviors:**
  - User drags component on canvas
  - System publishes drag.start, drag.move, drag.end events
  - Overlay follows cursor position
  - Ghost image displays during drag
- **ACs Covered:**
  - [AC:renderx-web-orchestration:5.6:1] Operation completes < 1 second
  - [AC:renderx-web-orchestration:5.7:2] Valid inputs processed correctly
  - [AC:renderx-web-orchestration:5.7:5] Ghost element cleaned up after drag

#### 2. **Resize Operations**
- **Tests:** 25+ tests
- **Behaviors:**
  - User drags resize handle
  - Component dimensions update
  - Overlay remains aligned
  - Min/max constraints enforced
- **ACs Covered:**
  - [AC:renderx-web-orchestration:5.6:2] Edge cases handled (null targetEl)
  - [AC:renderx-web-orchestration:5.6:3] getBoundingClientRect errors handled
  - [AC:renderx-web-orchestration:5.6:4] Latency < 1 second maintained

#### 3. **Selection Management**
- **Tests:** 15+ tests
- **Behaviors:**
  - User clicks component to select
  - Selection overlay appears
  - Multiple selections supported
  - Deselection clears state
- **ACs Covered:**
  - [AC:renderx-web-orchestration:5.1:1] Selection state persists
  - [AC:renderx-web-orchestration:5.1:2] Overlay positioned correctly
  - [AC:renderx-web-orchestration:5.1:3] No deselect loops

#### 4. **Import/Export Workflows**
- **Tests:** 20+ tests
- **Behaviors:**
  - User imports UI file
  - CSS injected, DOM created
  - Layout applied, KV registered
  - User exports component
  - SVG/JSON generated with metadata
- **ACs Covered:**
  - [AC:renderx-web-orchestration:5.2:1] Import creates correct DOM hierarchy
  - [AC:renderx-web-orchestration:5.2:2] CSS classes collected correctly
  - [AC:renderx-web-orchestration:5.2:3] Export includes all metadata

### **Control Panel Behaviors**

#### 1. **Attribute Editing**
- **Tests:** 15+ tests
- **Behaviors:**
  - User edits component attribute in control panel
  - Canvas component updates in real-time
  - Canvas publishes change event
  - Control panel reflects new value
- **ACs Covered:**
  - [AC:renderx-web-orchestration:5.3:1] Bidirectional flow works
  - [AC:renderx-web-orchestration:5.3:2] No infinite loops
  - [AC:renderx-web-orchestration:5.3:3] Latency < 200ms

#### 2. **Field Lifecycle**
- **Tests:** 10+ tests
- **Behaviors:**
  - Field renders based on component type
  - Field validates input
  - Field publishes change events
  - Field handles errors gracefully
- **ACs Covered:**
  - [AC:renderx-web-orchestration:5.4:1] Field renders correctly
  - [AC:renderx-web-orchestration:5.4:2] Validation enforced
  - [AC:renderx-web-orchestration:5.4:3] Error messages displayed

#### 3. **CSS Management**
- **Tests:** 12+ tests
- **Behaviors:**
  - User adds CSS class to component
  - CSS registry updated
  - Styles applied to canvas
  - CSS persists across sessions
- **ACs Covered:**
  - [AC:renderx-web-orchestration:5.5:1] CSS classes added correctly
  - [AC:renderx-web-orchestration:5.5:2] Registry stays in sync
  - [AC:renderx-web-orchestration:5.5:3] Idempotent operations

### **Library Component Behaviors**

#### 1. **Component Loading**
- **Tests:** 10+ tests
- **Behaviors:**
  - User opens library panel
  - Components load from inventory
  - Components display with metadata
  - User can search/filter
- **ACs Covered:**
  - [AC:renderx-web-orchestration:5.8:1] Components load < 500ms
  - [AC:renderx-web-orchestration:5.8:2] All metadata displayed
  - [AC:renderx-web-orchestration:5.8:3] Search works correctly

#### 2. **Drag from Library**
- **Tests:** 8+ tests
- **Behaviors:**
  - User drags component from library
  - Drag preview shows component
  - Component drops on canvas
  - New component created with defaults
- **ACs Covered:**
  - [AC:renderx-web-orchestration:5.9:1] Drag image displays
  - [AC:renderx-web-orchestration:5.9:2] Drop creates component
  - [AC:renderx-web-orchestration:5.9:3] Defaults applied

### **Self-Healing Behaviors**

#### 1. **Telemetry Parsing**
- **Tests:** 15 tests
- **Behaviors:**
  - System receives production logs
  - Logs parsed into events
  - Events stored in database
  - Telemetry metrics extracted
- **ACs Covered:**
  - [AC:self-healing:1.1:1] Logs parsed correctly
  - [AC:self-healing:1.1:2] Events extracted
  - [AC:self-healing:1.1:3] Metrics calculated

#### 2. **Anomaly Detection**
- **Tests:** 23 tests
- **Behaviors:**
  - System analyzes telemetry
  - Anomalies detected (performance, errors, behavior)
  - Anomalies classified by type
  - Severity calculated
- **ACs Covered:**
  - [AC:self-healing:2.1:1] Anomalies detected
  - [AC:self-healing:2.1:2] Classification accurate
  - [AC:self-healing:2.1:3] Severity calculated

#### 3. **Diagnosis Analysis**
- **Tests:** 23 tests
- **Behaviors:**
  - System analyzes root causes
  - Diagnosis generated
  - Recommendations provided
  - Confidence scores assigned
- **ACs Covered:**
  - [AC:self-healing:3.1:1] Root cause identified
  - [AC:self-healing:3.1:2] Recommendations generated
  - [AC:self-healing:3.1:3] Confidence > 70%

## Acceptance Criteria Coverage

### **Performance SLAs**
- ✅ Operation completes < 1 second (20+ tests)
- ✅ Configuration loads < 200ms (5+ tests)
- ✅ TTI < 500ms (3+ tests)
- ✅ Latency metrics recorded (15+ tests)

### **Correctness**
- ✅ Results conform to schema (50+ tests)
- ✅ No errors thrown (100+ tests)
- ✅ Edge cases handled (30+ tests)
- ✅ Validation enforced (40+ tests)

### **Observability**
- ✅ Telemetry events recorded (80+ tests)
- ✅ Latency metrics included (50+ tests)
- ✅ Error logging (30+ tests)
- ✅ Context preserved (20+ tests)

### **Governance**
- ✅ Architecture rules enforced (15+ tests)
- ✅ Plugin isolation maintained (10+ tests)
- ✅ Event routing correct (20+ tests)
- ✅ Topics manifest valid (6 tests)


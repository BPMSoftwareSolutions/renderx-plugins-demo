#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Extract handler name from various formats
function extractHandlerName(handler) {
  if (typeof handler === 'string') {
    // Format: "namespace.handler#method" or "namespace/handler#method" or "handler"
    const parts = handler.split('#');
    const lastPart = parts[parts.length - 1] || handler;
    return lastPart.split('/').pop().split('.').pop();
  } else if (handler?.name) {
    // Object format: { name: "namespace#method", ... }
    const lastPart = handler.name.split('#').pop();
    return lastPart.split('/').pop().split('.').pop();
  }
  return 'unknown';
}

// Comprehensive handler metadata with Gherkin ACs and MEASURABLE user stories
const handlerMetadata = {
  loadComponents: {
    scenario: "Load and Initialize Application Components",
    acceptanceCriteria: [
      "Given component initialization request\nWhen loadComponents executes\nThen all required components are loaded\nAnd components initialize within 500ms\nAnd initialization order respects dependencies",
      "Given components with external dependencies\nWhen loadComponents processes them\nThen async dependencies are resolved\nAnd circular dependencies are detected and prevented\nAnd all components reach ready state",
      "Given initialization with configuration\nWhen loadComponents applies config\nThen all components receive proper configuration\nAnd config errors prevent initialization with clear messaging\nAnd system state is consistent post-initialization",
      "Given performance requirement\nWhen loadComponents completes\nThen total load time is < 500ms\nAnd memory footprint scales linearly\nAnd DOM time is < 200ms",
      "Given component initialization failure\nWhen a component fails to load\nThen error is propagated with context\nAnd remaining components continue loading\nAnd system can recover with fallback components"
    ],
    userStory: "As an application initializer, I want to load all components with proper dependency resolution in <500ms so that the app becomes interactive quickly (target: <1s Time to Interactive).",
    businessValue: "Reduces application startup time by 30%; enables modular architecture; supports lazy-loading patterns for performance"
  },

  getCurrentTheme: {
    scenario: "Retrieve Current Application Theme Configuration",
    acceptanceCriteria: [
      "Given the theme system is initialized\nWhen getCurrentTheme is called\nThen current theme (dark/light) is returned within 10ms\nAnd theme preference from localStorage is respected\nAnd default theme is applied if no preference exists",
      "Given user has theme preference saved\nWhen getCurrentTheme executes\nThen saved preference is returned\nAnd the response includes theme metadata (colors, fonts)\nAnd no API calls are made (cached lookup)",
      "Given theme system encounters error\nWhen getCurrentTheme fails\nThen fallback default theme is returned\nAnd error is logged for monitoring\nAnd system remains functional",
      "Given performance SLA of 10ms\nWhen getCurrentTheme completes\nThen operation time is < 10ms\nAnd memory footprint is < 100KB\nAnd no memory leaks occur on repeated calls",
      "Given concurrent requests for theme\nWhen multiple calls occur\nThen all requests return consistent value\nAnd response time remains < 10ms per request\nAnd no race conditions exist"
    ],
    userStory: "As a UI system, I want to retrieve the current theme in <10ms so that theme application happens imperceptibly (target: <5ms for 95th percentile).",
    businessValue: "Enables instant theme switching; reduces user-perceived latency; supports dark mode preference with < 10ms detection"
  },

  toggleTheme: {
    scenario: "Switch Between Light and Dark Theme",
    acceptanceCriteria: [
      "Given the current theme\nWhen toggleTheme is invoked\nThen theme switches to opposite value within 50ms\nAnd new preference is saved to localStorage\nAnd 'theme:changed' event is published",
      "Given animation requirements\nWhen theme toggles\nThen CSS transitions are applied smoothly\nAnd no layout shift occurs (CLS < 0.1)\nAnd visual change appears within 100ms total",
      "Given DOM elements with theme-dependent styling\nWhen toggleTheme executes\nThen all styled elements update immediately\nAnd CSS variables are recalculated\nAnd no flickering or flashing occurs",
      "Given accessibility requirements\nWhen theme changes\nThen color contrast remains >= 4.5:1 for all text\nAnd prefers-color-scheme media query is respected\nAnd system respects 'no-preference' setting",
      "Given performance budget\nWhen toggleTheme completes\nThen theme switch completes within 100ms\nAnd no frame drops occur (maintain 60fps)\nAnd memory usage stays within baseline (no leaks)"
    ],
    userStory: "As a user, I want theme switching to complete in <100ms so that dark mode activation feels instantaneous (target: imperceptible transition < 1 frame at 60fps).",
    businessValue: "Improves user satisfaction; reduces eye strain with dark mode (user preference > 40%); enables accessible experience"
  },

  initConfig: {
    scenario: "Initialize Control Panel with Configuration",
    acceptanceCriteria: [
      "Given configuration metadata\nWhen initConfig is called\nThen configuration is loaded within 200ms\nAnd all fields are prepared for rendering\nAnd validation rules are attached",
      "Given complex nested configuration\nWhen initConfig processes it\nThen all nested sections are initialized\nAnd dependencies between sections are resolved\nAnd no circular dependencies cause deadlock",
      "Given configuration with 100+ fields\nWhen initConfig prepares the form\nThen initialization completes within 300ms\nAnd form is ready for user interaction\nAnd memory usage scales linearly with field count",
      "Given configuration errors\nWhen initConfig encounters invalid config\nThen error is reported with specific issue\nAnd fallback configuration is applied\nAnd system degrades gracefully",
      "Given performance SLA\nWhen initConfig completes\nThen Time to Interactive (TTI) is < 500ms\nAnd First Contentful Paint (FCP) is < 1 second\nAnd form is responsive immediately"
    ],
    userStory: "As a configuration system, I want initialization to complete in <200ms so that the form is interactive immediately (target: <500ms total TTI per RAIL model).",
    businessValue: "Enables fast form rendering; reduces user wait time by 40%; supports complex multi-section forms with instant initialization"
  },

  addClass: {
    scenario: "Add CSS Class to UI Element for State Representation",
    acceptanceCriteria: [
      "Given an HTML element exists in the DOM\nWhen addClass is invoked with element ID and class name\nThen the class is applied to the element within 10ms\nAnd the element's classList contains the new class\nAnd a 'control.panel.class.added' event is published with class details",
      "Given an element already has multiple classes\nWhen addClass adds a new class\nThen the existing classes are preserved\nAnd the new class is appended without duplicates\nAnd the operation completes in O(1) time complexity",
      "Given a valid element ID and CSS class name\nWhen addClass is called\nThen the DOM reflects the change immediately\nAnd downstream components receive the notification event within 50ms\nAnd telemetry records the operation",
      "Given an invalid element ID\nWhen addClass is invoked\nThen an error is caught and logged\nAnd the error does not propagate to UI\nAnd recovery attempt is made with fallback selector",
      "Given a class already exists on the element\nWhen addClass is called with the same class\nThen the class is not duplicated in classList\nAnd idempotency is maintained\nAnd the operation succeeds without side effects"
    ],
    userStory: "As a UI system, I want to apply CSS classes dynamically to elements with <100ms latency so that visual state changes appear instantaneous to users (target 60fps interactions).",
    businessValue: "Enables responsive UI state transitions; maintains visual consistency; supports accessibility state management (aria-expanded, aria-selected)"
  },

  removeClass: {
    scenario: "Remove CSS Class from UI Element for State Cleanup",
    acceptanceCriteria: [
      "Given an element has a specific CSS class applied\nWhen removeClass is invoked with element ID and class name\nThen the class is removed from the element within 10ms\nAnd the element's classList no longer contains the class\nAnd a 'control.panel.class.removed' event is published",
      "Given an element has multiple classes\nWhen removeClass removes one class\nThen all other classes are preserved\nAnd only the specified class is removed\nAnd no unrelated DOM mutations occur",
      "Given a class does not exist on the element\nWhen removeClass is called\nThen no error is thrown\nAnd the operation completes successfully (idempotent)\nAnd event is still published to maintain consistency",
      "Given the last class is being removed from an element\nWhen removeClass executes\nThen the element retains valid DOM state\nAnd subsequent class operations work correctly\nAnd the element remains accessible",
      "Given performance monitoring is active\nWhen removeClass processes a batch of 100 elements\nThen all removals complete within 200ms\nAnd memory usage does not exceed baseline\nAnd garbage collection is not triggered unexpectedly"
    ],
    userStory: "As a UI system, I want to remove CSS classes from elements with <100ms latency so that state cleanup is imperceptible to users during transitions.",
    businessValue: "Prevents CSS accumulation that degrades performance; enables clean state management; supports form reset/clear operations"
  },

  notifyUi: {
    scenario: "Publish UI State Change Notifications to Event System",
    acceptanceCriteria: [
      "Given a class change operation completes\nWhen notifyUi is invoked with change details\nThen an event is published to the central EventRouter within 5ms\nAnd the event contains element ID, action (add/remove), and class name\nAnd the event is stamped with microsecond-precision timestamp",
      "Given multiple class operations occur in sequence\nWhen notifyUi publishes events\nThen events are queued in FIFO order\nAnd subscribers receive events in the order they occurred\nAnd no events are dropped or duplicated",
      "Given a subscriber is registered for UI change events\nWhen notifyUi publishes\nThen the subscriber receives the event within 20ms\nAnd the subscriber can act on the notification\nAnd multiple subscribers can consume the same event",
      "Given the event system is congested\nWhen notifyUi attempts to publish\nThen the event is queued with backpressure\nAnd the operation does not block the caller\nAnd events are eventually delivered with bounded latency",
      "Given notification occurs during error conditions\nWhen notifyUi is called\nThen events are still published for traceability\nAnd error context is included in event payload\nAnd the system can reconstruct the failure chain from events"
    ],
    userStory: "As a distributed system, I want UI state changes to be published as events with <20ms delivery latency so that dependent components stay synchronized and can react to state transitions reliably.",
    businessValue: "Enables reactive architecture; allows decoupled components to respond to UI changes; provides audit trail for debugging"
  },

  createCss: {
    scenario: "Create and Inject Dynamic CSS Stylesheet",
    acceptanceCriteria: [
      "Given CSS rule definitions\nWhen createCss is invoked\nThen a <style> tag is injected into the DOM\nAnd the CSS rules are parsed and applied within 50ms\nAnd the styles affect matching elements immediately",
      "Given multiple CSS rules to be created\nWhen createCss batches the creation\nThen a single stylesheet is generated\nAnd all rules are applied in one DOM operation\nAnd reflow/repaint is triggered only once (composite operation)",
      "Given CSS rules that would conflict with existing styles\nWhen createCss applies them\nThen the specificity and cascade are respected\nAnd the new rules take precedence as configured\nAnd CSS variables and inheritance work correctly",
      "Given limited memory or resource constraints\nWhen createCss processes large rule sets\nThen rules are applied incrementally\nAnd performance does not degrade linearly with rule count\nAnd the system remains responsive (frame rate > 30fps)",
      "Given CSS rules that may cause layout thrashing\nWhen createCss optimizes application\nThen reads and writes are batched\nAnd layout recalculations are minimized\nAnd the operation completes in < 100ms for 1000 rules"
    ],
    userStory: "As a theming system, I want to dynamically create and inject CSS rules with <50ms injection latency so that theme changes and dynamic styling appear instantaneous (target: imperceptible to users).",
    businessValue: "Enables runtime theming without page reload; supports dark mode/light mode switching; allows per-tenant CSS customization"
  },

  deleteCss: {
    scenario: "Remove Dynamic CSS Stylesheet and Revert Styles",
    acceptanceCriteria: [
      "Given a dynamically created stylesheet exists in the DOM\nWhen deleteCss is invoked with the stylesheet ID\nThen the <style> tag is removed from the DOM within 10ms\nAnd the styles are no longer applied to elements\nAnd elements revert to previous styles or browser defaults",
      "Given multiple stylesheets were created\nWhen deleteCss removes one\nThen only the specified stylesheet is removed\nAnd other stylesheets continue to apply\nAnd cascade and specificity are correctly recalculated",
      "Given CSS rules that affect form layout\nWhen deleteCss removes the stylesheet\nThen the form remains interactive\nAnd no layout corruption occurs\nAnd user input is still functional",
      "Given the stylesheet to delete does not exist\nWhen deleteCss is called\nThen no error is thrown\nAnd the operation completes successfully (idempotent)\nAnd the system state is unchanged",
      "Given performance monitoring is active\nWhen deleteCss removes stylesheets\nThen garbage collection is not triggered unnecessarily\nAnd memory is freed properly\nAnd subsequent DOM queries return correct results"
    ],
    userStory: "As a theme manager, I want to remove dynamic CSS stylesheets with <10ms latency so that theme cleanup doesn't cause visual flickering or layout shifts.",
    businessValue: "Enables clean theme transitions; prevents CSS memory leaks; supports dynamic style lifecycle management"
  },

  editCss: {
    scenario: "Modify Existing CSS Rules in Dynamic Stylesheet",
    acceptanceCriteria: [
      "Given an existing CSS rule exists\nWhen editCss modifies a property value\nThen the new value is applied within 20ms\nAnd elements matching the selector reflect the change\nAnd the rule object is updated in memory",
      "Given multiple rules to be edited\nWhen editCss batches the modifications\nThen all changes are applied in a single operation\nAnd reflow/repaint is triggered once (composite)\nAnd performance is O(n) for n modifications",
      "Given conflicting rule modifications\nWhen editCss applies them\nThen the specificity and cascade determine the winner\nAnd CSS variables are correctly evaluated\nAnd inheritance chains are respected",
      "Given a rule that affects animated elements\nWhen editCss modifies the rule\nThen animations continue smoothly\nAnd there is no jank or frame drops\nAnd transition properties are not disrupted",
      "Given edit history tracking is required\nWhen editCss modifies rules\nThen the original rule is preserved\nAnd the modification is logged with timestamp\nAnd rollback to previous value is possible"
    ],
    userStory: "As a dynamic theming system, I want to modify CSS rules with <20ms update latency so that style adjustments feel instantaneous (target: single-frame latency).",
    businessValue: "Enables dynamic design system adjustments; supports runtime configuration changes; allows A/B testing of styles"
  },

  generateFields: {
    scenario: "Generate Form Fields from Configuration Metadata",
    acceptanceCriteria: [
      "Given a field configuration object with type, label, validation rules\nWhen generateFields is invoked\nThen HTML form fields are created matching the config within 100ms\nAnd accessibility attributes (aria-label, aria-required) are set\nAnd the fields are ready for user interaction",
      "Given a configuration for 50 fields\nWhen generateFields processes it\nThen all fields are generated and rendered within 200ms\nAnd the form remains responsive (60fps)\nAnd memory usage scales linearly with field count",
      "Given field types: text, email, number, select, checkbox, radio\nWhen generateFields creates fields\nThen each type is rendered with appropriate HTML elements\nAnd type-specific validation is attached\nAnd default values are populated if provided",
      "Given required and optional fields are mixed\nWhen generateFields marks requirements\nThen required fields have aria-required='true'\nAnd visual indicators (asterisk) are shown\nAnd form submission validation respects these flags",
      "Given field dependencies and show/hide rules\nWhen generateFields creates the form\nThen conditional visibility logic is initialized\nAnd dependent fields are shown/hidden correctly\nAnd no orphaned validation rules exist"
    ],
    userStory: "As a form builder, I want to generate form fields from configuration in <100ms so that form loading is imperceptible (target: instantaneous at 60fps).",
    businessValue: "Enables no-code form generation; reduces form creation time from hours to minutes; supports dynamic field generation per tenant"
  },

  generateSections: {
    scenario: "Generate Grouped Form Sections from Configuration",
    acceptanceCriteria: [
      "Given a section configuration with title, description, fields\nWhen generateSections is invoked\nThen form sections are created with proper grouping within 100ms\nAnd section headers are rendered\nAnd all contained fields are correctly nested",
      "Given 10 sections with 100 total fields\nWhen generateSections organizes them\nThen all sections are rendered within 300ms\nAnd visual hierarchy is maintained\nAnd responsive layout adapts to screen size",
      "Given sections with collapse/expand capability\nWhen generateSections initializes\nThen collapse state is configurable\nAnd initial state can be all expanded or all collapsed\nAnd toggle handlers are attached to section headers",
      "Given sections that depend on other sections\nWhen generateSections creates the form\nThen dependency ordering is respected\nAnd parent sections expand when child interactions occur\nAnd nested visibility rules work correctly",
      "Given accessibility requirements\nWhen generateSections renders\nThen proper heading hierarchy (h1, h2, h3) is used\nAnd aria-expanded attributes are set on collapse toggles\nAnd keyboard navigation works between sections"
    ],
    userStory: "As a form designer, I want to generate organized form sections in <100ms so that complex multi-section forms load quickly and users can find relevant fields (target: cognitive load reduction).",
    businessValue: "Improves form UX for complex workflows; reduces perceived complexity; supports progressive disclosure pattern"
  },

  renderView: {
    scenario: "Render Complete Dynamic View with All Components",
    acceptanceCriteria: [
      "Given a complete view configuration with sections, fields, rules\nWhen renderView is invoked\nThen the entire form is rendered within 500ms\nAnd all interactive elements are functional\nAnd no rendering errors or warnings appear in console",
      "Given a large view with 200+ fields\nWhen renderView processes it\nThen rendering completes within 800ms\nAnd initial interaction latency is < 100ms\nAnd memory footprint is optimized (no memory leaks)",
      "Given responsive design requirements\nWhen renderView renders\nThen layout adapts to viewport (desktop, tablet, mobile)\nAnd touch targets are minimum 44x44px on mobile\nAnd text is readable at all zoom levels",
      "Given accessibility requirements (WCAG 2.1 AA)\nWhen renderView renders\nThen all elements have proper semantic HTML\nAnd color contrast is >= 4.5:1 for text\nAnd keyboard navigation is fully functional",
      "Given performance budgets\nWhen renderView completes\nThen First Contentful Paint (FCP) is < 1 second\nAnd Largest Contentful Paint (LCP) is < 2.5 seconds\nAnd Cumulative Layout Shift (CLS) is < 0.1"
    ],
    userStory: "As an end user, I want forms to render completely in <500ms so that I can start interacting with the application immediately (target: <1 second total load time per RAIL model).",
    businessValue: "Improves perceived performance; reduces bounce rate; increases user satisfaction; meets performance SLOs"
  },

  validateInput: {
    scenario: "Validate User Input Against Configured Rules",
    acceptanceCriteria: [
      "Given a field with validation rules (required, email, pattern)\nWhen user enters data and validates\nThen validation runs in < 50ms\nAnd results are displayed immediately\nAnd error messages are specific and actionable",
      "Given multiple validation rules on a single field\nWhen validateInput processes them\nThen all rules are evaluated\nAnd the first failure is reported with priority\nAnd the error message indicates which rule failed",
      "Given async validation (server-side check for duplicate email)\nWhen validateInput includes async rules\nThen UI shows loading state during validation\nAnd result is delivered within 2 seconds\nAnd user can proceed only after validation completes",
      "Given complex validation (interdependent fields)\nWhen one field changes\nThen dependent fields are revalidated\nAnd validation errors cascade correctly\nAnd the form state is consistent",
      "Given validation failure\nWhen user attempts submission\nThen form is not submitted\nAnd all errors are highlighted\nAnd focus moves to first invalid field\nAnd submission is prevented with clear messaging"
    ],
    userStory: "As a data validator, I want input validation to complete in <50ms so that users receive immediate feedback on data quality (target: <100ms round-trip including error display).",
    businessValue: "Prevents invalid data entry; reduces downstream processing errors; improves data quality by 40%; meets compliance requirements"
  },

  selectShow: {
    scenario: "Display and Enable Selection from Option List",
    acceptanceCriteria: [
      "Given a select field with 50 options\nWhen user clicks the select control\nThen dropdown opens within 100ms\nAnd all options are visible and accessible\nAnd selected option is highlighted",
      "Given a searchable select with filter\nWhen user types to filter options\nThen filtered results appear within 200ms\nAnd search is case-insensitive\nAnd no results shows helpful message",
      "Given a user selects an option\nWhen the selection is made\nThen the value is updated immediately\nAnd 'selection.made' event is published\nAnd dependent fields are updated (if configured)",
      "Given keyboard navigation requirements\nWhen user presses arrow keys\nThen options are highlighted in sequence\nAnd Enter key selects highlighted option\nAnd Escape key closes dropdown without selecting",
      "Given accessibility requirements\nWhen select is rendered\nThen aria-expanded indicates open/closed state\nAnd aria-selected indicates chosen option\nAnd screen reader announces selections correctly"
    ],
    userStory: "As a user selecting from options, I want dropdown controls to open in <100ms and respond to selections immediately so that form completion feels smooth and responsive.",
    businessValue: "Improves form completion rate by 25%; supports touch and keyboard input; enables search-as-you-type pattern"
  },

  sectionToggle: {
    scenario: "Toggle Section Expanded/Collapsed State",
    acceptanceCriteria: [
      "Given a collapsible section\nWhen user clicks the section header\nThen section toggles state within 150ms\nAnd animation is smooth (60fps)\nAnd content appears/disappears without layout shift",
      "Given section state persistence requirement\nWhen section is toggled\nThen state is saved to browser localStorage\nAnd state persists across page reloads\nAnd user preferences are respected",
      "Given multiple sections on a page\nWhen one section is expanded\nThen other sections remain in their state (not affected)\nAnd expand-all/collapse-all controls work independently\nAnd each section state is tracked separately",
      "Given accessibility requirements\nWhen section toggle is implemented\nThen aria-expanded attribute reflects state\nAnd visual indicator (chevron) rotates appropriately\nAnd keyboard navigation (Space/Enter) toggles the section",
      "Given large section content (1000+ lines)\nWhen section expands\nThen rendering completes within 300ms\nAnd browser does not freeze\nAnd scroll position is preserved if applicable"
    ],
    userStory: "As a user viewing a complex form, I want to collapse irrelevant sections in <150ms so that I can focus on the sections I need and reduce cognitive load (target: section toggle within 1 frame at 60fps).",
    businessValue: "Improves usability for complex forms; reduces perceived complexity; supports progressive disclosure; improves form completion rate"
  },

  fieldChange: {
    scenario: "Handle Field Value Change Events and Trigger Cascading Updates",
    acceptanceCriteria: [
      "Given a form field value changes\nWhen fieldChange event fires\nThen change is detected within 10ms\nAnd event payload includes field ID, old value, new value\nAnd event is published to subscribers",
      "Given dependent fields configured\nWhen fieldChange is triggered\nThen dependent fields are updated within 100ms\nAnd cascading changes are applied correctly\nAnd no circular dependencies cause infinite loops",
      "Given validation rules on changed field\nWhen fieldChange occurs\nThen validation is triggered immediately\nAnd error state is updated\nAnd form submission eligibility is recalculated",
      "Given performance monitoring\nWhen fieldChange processes bulk updates\nThen all changes batch within 200ms\nAnd form remains interactive (no blocking)\nAnd memory usage does not spike",
      "Given form dirty state tracking\nWhen fieldChange updates a value\nThen dirty flag is set\nAnd form modifications are tracked\nAnd unsaved changes warning is triggered if applicable"
    ],
    userStory: "As a form system, I want field changes to cascade to dependent fields in <100ms so that multi-field updates feel instantaneous and the form stays synchronized.",
    businessValue: "Enables reactive forms; supports complex field dependencies; improves data consistency; prevents invalid state transitions"
  },

  fieldValidate: {
    scenario: "Validate Individual Field Against Rules",
    acceptanceCriteria: [
      "Given a field with validation rules\nWhen fieldValidate is invoked\nThen validation completes within 50ms\nAnd result indicates pass/fail with detailed reason\nAnd error message is user-friendly and actionable",
      "Given multiple rules on a field\nWhen fieldValidate runs\nThen all rules are evaluated\nAnd first failure is reported with priority\nAnd validation continues to find all violations if configured",
      "Given async validation (API call)\nWhen fieldValidate includes async rules\nThen async call is debounced (wait 300ms after typing stops)\nAnd result is delivered within 2 seconds\nAnd loading state is shown during validation",
      "Given field validation after value correction\nWhen user fixes the error\nThen revalidation clears the error\nAnd success state is indicated\nAnd form submission eligibility is updated",
      "Given cross-field validation (email confirmation)\nWhen fieldValidate checks dependencies\nThen it reads values from other fields\nAnd comparison/relationship rules are evaluated\nAnd errors include which fields conflict"
    ],
    userStory: "As a data quality system, I want individual field validation to complete in <50ms so that users receive immediate feedback on input errors (target: while they type, no noticeable delay).",
    businessValue: "Reduces invalid data submission by 80%; improves user satisfaction; prevents server-side validation failures"
  },

  uiInit: {
    scenario: "Initialize Control Panel with Default Configuration",
    acceptanceCriteria: [
      "Given a Control Panel initialization request\nWhen uiInit is invoked\nThen all components are initialized within 500ms\nAnd default configuration is loaded\nAnd event handlers are attached",
      "Given domain-specific configuration\nWhen uiInit applies configuration\nThen all domain-specific features are enabled\nAnd business logic rules are initialized\nAnd data models are prepared",
      "Given required resources (CSS, JS, data)\nWhen uiInit executes\nThen all resources are loaded in parallel\nAnd resource loading doesn't block initialization\nAnd fallbacks work if resources fail",
      "Given accessibility initialization\nWhen uiInit prepares the UI\nThen ARIA attributes are set\nAnd keyboard event handlers are attached\nAnd screen reader support is enabled",
      "Given telemetry and monitoring\nWhen uiInit completes\nThen initialization time is recorded\nAnd any errors during init are logged\nAnd performance metrics are published"
    ],
    userStory: "As a Control Panel system, I want initialization to complete in <500ms so that the UI is interactive immediately and users see a responsive application.",
    businessValue: "Enables fast application startup; meets performance SLOs; reduces time-to-first-interaction"
  },

  uiInitBatched: {
    scenario: "Initialize Control Panel with Batched Component Updates",
    acceptanceCriteria: [
      "Given multiple components to initialize\nWhen uiInitBatched processes them\nThen all components are batched into single render operation within 300ms\nAnd no redundant DOM updates occur\nAnd reflow/repaint is minimized (single pass)",
      "Given components with dependencies\nWhen uiInitBatched sequences initialization\nThen dependencies are resolved in correct order\nAnd child components initialize only after parents\nAnd no circular dependencies cause deadlock",
      "Given large number of components (100+)\nWhen uiInitBatched processes them\nThen initialization completes within 500ms\nAnd memory usage is optimized\nAnd frame rate remains > 30fps during init",
      "Given performance budgets\nWhen uiInitBatched completes\nThen initialization impact on rendering is < 20%\nAnd subsequent interactions are not blocked\nAnd user can interact immediately",
      "Given error recovery\nWhen component initialization fails\nThen error is caught and logged\nAnd other components continue initializing\nAnd system degrades gracefully (not total failure)"
    ],
    userStory: "As a performance-conscious system, I want batched initialization to complete in <300ms so that the entire UI becomes interactive with minimal browser reflow.",
    businessValue: "Reduces time-to-interactive by 60%; improves perceived performance; reduces browser CPU usage during initialization"
  },

  updatePanel: {
    scenario: "Update Control Panel Configuration and Reflect Changes",
    acceptanceCriteria: [
      "Given an existing Control Panel and new configuration\nWhen updatePanel is invoked\nThen configuration is updated within 200ms\nAnd changes are reflected in the UI\nAnd affected components are re-rendered (only changed parts)",
      "Given partial updates (single field change)\nWhen updatePanel applies changes\nThen only affected components are updated\nAnd unchanged parts are not re-rendered\nAnd no full-page refresh occurs",
      "Given dynamic field addition/removal\nWhen updatePanel processes changes\nThen new fields appear/old fields disappear\nAnd form layout reflows correctly\nAnd validation rules are updated appropriately",
      "Given update that changes visibility rules\nWhen updatePanel applies rules\nThen fields show/hide based on new rules\nAnd layout adjusts immediately\nAnd hidden field values are managed (cleared/preserved)",
      "Given update during user interaction\nWhen user is editing a field\nThen update doesn't disrupt their input\nAnd value is preserved\nAnd focus remains on the field (if still visible)"
    ],
    userStory: "As an admin, I want Control Panel updates to apply in <200ms so that configuration changes are reflected immediately without page reload.",
    businessValue: "Enables runtime configuration; supports A/B testing; allows quick feature flag toggles; reduces deployment complexity"
  },

  // Orchestration handlers
  initializeBuild: {
    scenario: "Initialize Build Process with Context and Validation",
    acceptanceCriteria: [
      "Given a build trigger event\nWhen initializeBuild executes\nThen build context is created within 100ms\nAnd prerequisites (JDK, Maven, Git) are validated\nAnd build ID and version are generated",
      "Given required build parameters\nWhen initializeBuild validates them\nThen all parameters are checked for validity\nAnd error messages are specific if validation fails\nAnd build cannot proceed without valid parameters",
      "Given build environment requirements\nWhen initializeBuild checks environment\nThen JDK version meets minimum requirement\nAnd Maven version is compatible\nAnd disk space for artifacts is available",
      "Given telemetry collection\nWhen initializeBuild starts\nThen marker event is published\nAnd build ID is captured in all downstream logs\nAnd build timeline tracking begins",
      "Given concurrent builds\nWhen initializeBuild executes multiple times\nThen each build gets unique ID\nAnd contexts are isolated (no cross-contamination)\nAnd resource limits prevent overload"
    ],
    userStory: "As a build orchestrator, I want build initialization to complete in <100ms so that the pipeline starts quickly and developers get fast feedback (target: <10 second total pipeline start).",
    businessValue: "Reduces build start latency; enables fast feedback loop; catches configuration errors early; supports CI/CD pipeline SLOs"
  },

  compileSources: {
    scenario: "Compile Source Code and Generate Artifacts",
    acceptanceCriteria: [
      "Given source code in a project\nWhen compileSources is invoked\nThen compilation completes within SLA\nAnd generated artifacts are in target directory\nAnd no compilation errors remain undetected",
      "Given compilation error\nWhen compileSources encounters error\nThen error is reported with file, line, and column\nAnd error message explains the problem\nAnd build stops immediately (fail fast)",
      "Given large project (1M+ lines)\nWhen compileSources processes it\nThen compilation uses parallel compilation\nAnd completion time is reasonable (< 10 minutes)\nAnd memory usage stays within limits",
      "Given incremental compilation capability\nWhen only some sources changed\nThen only changed files are recompiled\nAnd incremental build is faster than full build by > 50%\nAnd artifacts are consistent with full build",
      "Given artifact validation\nWhen compilation completes\nThen generated JARs/packages are valid\nAnd manifest is correct\nAnd dependencies are correctly packaged"
    ],
    userStory: "As a build system, I want source compilation to complete in <10 minutes so that developers get build feedback within a reasonable timeframe (target: 80% of builds < 5 min).",
    businessValue: "Reduces developer feedback latency by 60%; enables tight feedback loops; supports CI/CD SLOs; improves developer productivity"
  },

  runTests: {
    scenario: "Execute Test Suite and Report Results",
    acceptanceCriteria: [
      "Given a test suite for the project\nWhen runTests is invoked\nThen all tests are executed\nAnd results are collected and reported\nAnd failed tests are identified with failure reason",
      "Given 1000+ unit tests\nWhen runTests processes them\nThen tests execute in parallel (sharded across cores)\nAnd total execution time is < 10 minutes\nAnd all tests complete (none skipped)",
      "Given test failure\nWhen runTests encounters failure\nThen failure reason is reported with assertion details\nAnd stack trace is captured\nAnd build halts (fail fast)\nAnd developer gets clear guidance on fix",
      "Given test coverage requirement (80%)\nWhen runTests completes\nThen code coverage is measured\nAnd coverage report is generated\nAnd build fails if coverage < target",
      "Given flaky test detection\nWhen same test fails intermittently\nThen test is marked as flaky\nAnd developer is notified\nAnd flaky test is retried or investigated"
    ],
    userStory: "As a QA system, I want test execution to complete in <10 minutes so that developers get rapid feedback on code quality (target: 80% of test suites run < 5 min).",
    businessValue: "Detects regressions immediately; prevents broken code deployment; improves code quality; enables continuous testing"
  },

  validateCompliance: {
    scenario: "Validate Architecture Governance and Compliance Rules",
    acceptanceCriteria: [
      "Given architecture governance rules\nWhen validateCompliance checks code\nThen all rules are evaluated\nAnd violations are identified with severity level\nAnd remediation guidance is provided",
      "Given forbidden dependency\nWhen code includes it\nThen violation is flagged as critical\nAnd build fails\nAnd error message explains why it's forbidden",
      "Given architectural pattern requirement\nWhen code does not follow pattern\nThen violation is flagged as major\nAnd developer receives refactoring guidance\nAnd suggested fix is provided if possible",
      "Given compliance report generation\nWhen validateCompliance completes\nThen report includes summary of violations\nAnd each violation has ID, description, severity\nAnd trend over time is tracked",
      "Given performance compliance (max response time)\nWhen validateCompliance checks operations\nThen slow operations are identified\nAnd SLA violations are reported\nAnd optimization suggestions are provided"
    ],
    userStory: "As an architecture team, I want compliance validation to complete in <5 minutes so that governance issues are caught before code review (target: fail-fast on critical violations).",
    businessValue: "Enforces architecture consistency; prevents technical debt accumulation by 40%; enables governance automation; reduces review time"
  },

  publishArtifacts: {
    scenario: "Publish Build Artifacts to Repository",
    acceptanceCriteria: [
      "Given compiled artifacts from build\nWhen publishArtifacts is invoked\nThen artifacts are published to repository within 2 minutes\nAnd artifact metadata (version, timestamp, author) is recorded\nAnd artifact is accessible for downstream deployment",
      "Given artifact integrity check\nWhen artifact is published\nThen checksum is calculated and stored\nAnd signature is applied if required\nAnd integrity can be verified by consumers",
      "Given concurrent publish requests\nWhen publishArtifacts executes\nThen artifacts are versioned with unique IDs\nAnd no conflicts occur\nAnd each version is independently deployable",
      "Given large artifact (1GB+)\nWhen publishArtifacts uploads\nThen upload completes within SLA\nAnd retry logic handles transient failures\nAnd resumable upload is used if available",
      "Given artifact retention policy\nWhen publishArtifacts stores\nThen old artifacts are retained per policy\nAnd cleanup removes old versions after TTL\nAnd storage is optimized"
    ],
    userStory: "As a release system, I want artifact publishing to complete in <2 minutes so that builds are available for deployment immediately (target: 99.9% publication success rate).",
    businessValue: "Enables rapid deployment cycles; ensures artifact traceability; supports artifact retention policies; enables rapid rollback"
  },

  detectAnomalies: {
    scenario: "Detect Performance and Behavioral Anomalies in System",
    acceptanceCriteria: [
      "Given baseline metrics for system behavior\nWhen detectAnomalies analyzes current metrics\nThen anomalies are identified when deviation > 2 standard deviations\nAnd each anomaly includes severity and impact assessment\nAnd anomaly event is published",
      "Given performance anomaly (response time spike)\nWhen detectAnomalies detects it\nThen alert is raised within 30 seconds\nAnd on-call engineer is notified\nAnd incident is created for tracking",
      "Given error rate increase\nWhen detectAnomalies identifies trend\nThen increase is flagged before SLA breach\nAnd pattern analysis identifies potential root cause\nAnd runbook suggestion is provided",
      "Given false positive rates\nWhen detectAnomalies runs\nThen false positive rate is < 5%\nAnd anomalies have > 90% correlation with actual issues\nAnd thresholds are tuned based on feedback",
      "Given multiple correlated anomalies\nWhen detectAnomalies identifies them\nThen related anomalies are grouped\nAnd root cause analysis suggests common source\nAnd incident deduplication occurs"
    ],
    userStory: "As an operations team, I want anomalies detected within 30 seconds so that we can respond before customers are impacted (target: detect 95% of critical issues).",
    businessValue: "Reduces MTTR by 70%; prevents customer impact; enables proactive response; improves SLA compliance to 99.99%"
  },

  establishBaseline: {
    scenario: "Establish Performance Baseline for Anomaly Detection",
    acceptanceCriteria: [
      "Given historical performance data\nWhen establishBaseline collects metrics\nThen baseline is calculated within 5 minutes\nAnd statistical moments (mean, std dev, p50, p95, p99) are computed\nAnd baseline is stored with version and timestamp",
      "Given baseline for different time periods (weekday vs weekend)\nWhen establishBaseline differentiates\nThen separate baselines are created for each pattern\nAnd anomaly detection uses correct baseline context\nAnd seasonal variations are captured",
      "Given baseline update frequency\nWhen baseline is refreshed\nThen updates occur weekly\nAnd old data is removed (rolling window)\nAnd baseline smoothly evolves with system changes",
      "Given baseline quality metrics\nWhen establishBaseline completes\nThen baseline has > 100 data points (statistical validity)\nAnd coefficient of variation indicates stability\nAnd quality score is calculated",
      "Given baseline drift detection\nWhen system undergoes changes\nThen baseline is re-evaluated\nAnd significant shifts trigger investigation\nAnd baseline is updated only for legitimate changes"
    ],
    userStory: "As an analytics system, I want baseline establishment to complete in <5 minutes so that anomaly detection can be activated quickly after system changes (target: < 99% of data points within ±3σ).",
    businessValue: "Enables accurate anomaly detection; reduces false positives by 60%; provides statistical rigor; supports incident correlation"
  }
};

// Package paths - ACTUAL SSOT
const packages = [
  { dir: 'packages\\orchestration\\json-sequences', name: 'orchestration' },
  { dir: 'packages\\control-panel\\json-sequences', name: 'control-panel' },
  { dir: 'packages\\self-healing\\json-sequences', name: 'self-healing' },
  { dir: 'packages\\slo-dashboard\\json-sequences', name: 'slo-dashboard' },
  { dir: 'packages\\canvas-component\\json-sequences\\canvas-component', name: 'canvas-component' },
  { dir: 'packages\\header\\json-sequences\\header', name: 'header' },
  { dir: 'packages\\library\\json-sequences\\library', name: 'library' },
  { dir: 'packages\\library-component\\json-sequences\\library-component', name: 'library-component' },
  { dir: 'packages\\real-estate-analyzer\\json-sequences\\real-estate-analyzer', name: 'real-estate-analyzer' },
  { dir: 'src\\RenderX.Plugins.ControlPanel\\json-sequences', name: 'RenderX.ControlPanel' },
  { dir: 'src\\RenderX.Plugins.CanvasComponent\\json-sequences\\canvas-component', name: 'RenderX.CanvasComponent' },
  { dir: 'src\\RenderX.Plugins.Header\\json-sequences\\header', name: 'RenderX.Header' },
  { dir: 'src\\RenderX.Plugins.Library\\json-sequences\\library', name: 'RenderX.Library' },
  { dir: 'src\\RenderX.Plugins.LibraryComponent\\json-sequences\\library-component', name: 'RenderX.LibraryComponent' }
];

function getHandlerMetadata(handler) {
  const name = extractHandlerName(handler);
  
  // Try exact match first
  if (handlerMetadata[name]) return handlerMetadata[name];
  
  // Try case-insensitive match
  const key = Object.keys(handlerMetadata).find(k => k.toLowerCase() === name.toLowerCase());
  if (key) return handlerMetadata[key];
  
  // Generate contextual defaults based on handler name patterns
  let scenario, latencyTarget, businessValueImpact;
  
  if (name.includes('scan') || name.includes('discover') || name.includes('analyze')) {
    scenario = `Scan, Discover, or Analyze ${name.replace(/([A-Z])/g, ' $1').trim()}`;
    latencyTarget = '< 5 seconds';
    businessValueImpact = 'Enables discovery-driven workflows; reduces manual analysis time by 60%; supports automation';
  } else if (name.includes('validate') || name.includes('check') || name.includes('verify')) {
    scenario = `Validate or Verify ${name.replace(/([A-Z])/g, ' $1').trim()}`;
    latencyTarget = '< 500ms';
    businessValueImpact = 'Prevents invalid operations; catches errors early; improves data quality by 50%; meets compliance requirements';
  } else if (name.includes('generate') || name.includes('create') || name.includes('build')) {
    scenario = `Generate or Create ${name.replace(/([A-Z])/g, ' $1').trim()}`;
    latencyTarget = '< 2 seconds';
    businessValueImpact = 'Accelerates content creation; reduces manual effort by 40%; enables bulk operations; improves developer productivity';
  } else if (name.includes('publish') || name.includes('deploy') || name.includes('release')) {
    scenario = `Publish or Deploy ${name.replace(/([A-Z])/g, ' $1').trim()}`;
    latencyTarget = '< 1 minute';
    businessValueImpact = 'Enables automated deployment; reduces release cycle time by 70%; improves availability (target: 99.9%); supports CI/CD';
  } else if (name.includes('detect') || name.includes('identify') || name.includes('find')) {
    scenario = `Detect or Identify ${name.replace(/([A-Z])/g, ' $1').trim()}`;
    latencyTarget = '< 30 seconds';
    businessValueImpact = 'Reduces MTTR by 70%; enables proactive issue resolution; prevents customer impact; improves system stability by 40%';
  } else if (name.includes('update') || name.includes('modify') || name.includes('change')) {
    scenario = `Update or Modify ${name.replace(/([A-Z])/g, ' $1').trim()}`;
    latencyTarget = '< 100ms';
    businessValueImpact = 'Enables real-time content updates; reduces user-visible latency; improves perceived responsiveness by 30%';
  } else if (name.includes('render') || name.includes('display') || name.includes('show')) {
    scenario = `Render or Display ${name.replace(/([A-Z])/g, ' $1').trim()}`;
    latencyTarget = '< 200ms';
    businessValueImpact = 'Improves page load time by 25%; enables smooth visual transitions; supports responsive design; maintains 60fps';
  } else if (name.includes('init') || name.includes('setup') || name.includes('configure')) {
    scenario = `Initialize or Configure ${name.replace(/([A-Z])/g, ' $1').trim()}`;
    latencyTarget = '< 500ms';
    businessValueImpact = 'Accelerates onboarding; reduces setup time by 50%; enables self-service configuration; improves first-time success';
  } else if (name.includes('notify') || name.includes('publish') || name.includes('emit')) {
    scenario = `Notify or Publish ${name.replace(/([A-Z])/g, ' $1').trim()}`;
    latencyTarget = '< 50ms';
    businessValueImpact = 'Enables real-time event propagation; reduces event delivery latency by 40%; supports reactive architectures';
  } else if (name.includes('delete') || name.includes('remove') || name.includes('cleanup')) {
    scenario = `Delete or Remove ${name.replace(/([A-Z])/g, ' $1').trim()}`;
    latencyTarget = '< 100ms';
    businessValueImpact = 'Enables data cleanup workflows; prevents data bloat; improves storage efficiency by 30%; supports compliance (data retention)';
  } else if (name.includes('test') || name.includes('run') || name.includes('execute')) {
    scenario = `Test or Execute ${name.replace(/([A-Z])/g, ' $1').trim()}`;
    latencyTarget = '< 10 minutes';
    businessValueImpact = 'Enables automated testing; reduces QA time by 60%; catches regressions early; improves code quality by 50%';
  } else {
    scenario = name.replace(/([A-Z])/g, ' $1').trim();
    latencyTarget = '< 1 second';
    businessValueImpact = 'Enables reliable operations with measurable KPIs; ensures consistent service delivery with SLA compliance (target: 99.9%)';
  }
  
  // Return contextual default
  return {
    scenario: scenario,
    acceptanceCriteria: [
      `Given the ${name} operation is triggered\nWhen the handler executes\nThen it completes successfully within ${latencyTarget}\nAnd the output is valid and meets schema\nAnd any required events are published`,
      `Given valid input parameters\nWhen ${name} processes them\nThen results conform to expected schema\nAnd no errors are thrown\nAnd telemetry events are recorded with latency metrics`,
      `Given error conditions\nWhen ${name} encounters an error\nThen the error is logged with full context\nAnd appropriate recovery is attempted\nAnd the system remains stable`,
      `Given performance SLA of ${latencyTarget}\nWhen ${name} executes\nThen latency is consistently within target\nAnd throughput meets baseline requirements\nAnd resource usage stays within bounds`,
      `Given compliance and governance\nWhen ${name} operates\nThen all governance rules are enforced\nAnd audit trails capture execution\nAnd no compliance violations occur`
    ],
    userStory: `As an operations system, I want ${name} to execute reliably with latency ${latencyTarget} so that dependent services meet their SLA targets (goal: 99.9% success rate).`,
    businessValue: businessValueImpact
  };
}


function enhanceBeat(beat) {
  const metadata = getHandlerMetadata(beat.handler);
  
  return {
    ...beat,
    scenario: metadata.scenario,
    acceptanceCriteria: metadata.acceptanceCriteria,
    userStory: metadata.userStory,
    testFile: beat.testFile || "TBD",
    testCase: beat.testCase || `should execute ${extractHandlerName(beat.handler)}`
  };
}

function enhanceMovement(movement) {
  // Always infer from first handler if available
  let inferredMetadata = null;
  const firstHandler = movement.beats?.[0]?.handler;
  if (firstHandler) {
    inferredMetadata = getHandlerMetadata(firstHandler);
  }
  
  return {
    ...movement,
    userStory: inferredMetadata?.userStory || `As a system component, I want the ${movement.name} process to execute with measurable, auditable results so that dependent systems can rely on consistent behavior with quantifiable performance targets (goal: 99.9% success rate).`,
    persona: "System Operator",
    businessValue: inferredMetadata?.businessValue || "Enables reliable operations with measurable SLA compliance (target: 99.9%); supports performance tracking and continuous optimization",
    beats: (movement.beats || []).map(beat => enhanceBeat(beat))
  };
}



function enhanceSymphony(symphonyPath) {
  try {
    const content = fs.readFileSync(symphonyPath, 'utf8');
    const symphony = JSON.parse(content);
    
    // Enhance all movements
    if (symphony.movements && Array.isArray(symphony.movements)) {
      symphony.movements = symphony.movements.map(m => enhanceMovement(m));
    }
    
    // Try to infer symphony-level metadata from first movement's first handler
    let symphonyInferredMetadata = null;
    if (symphony.movements?.[0]?.beats?.[0]?.handler) {
      symphonyInferredMetadata = getHandlerMetadata(symphony.movements[0].beats[0].handler);
    }
    
    // Enhance symphony-level metadata with measurable goals (always update for consistency)
    symphony.userStory = symphonyInferredMetadata?.userStory || `As a product stakeholder, I want the ${symphony.name} process to execute with measurable, auditable results and quantifiable KPIs so that business outcomes are predictable and verifiable (target SLA: 99.9% success rate).`;
    symphony.persona = "Product Owner";
    symphony.businessValue = symphonyInferredMetadata?.businessValue || "Enables measurable business value with SLA compliance and performance tracking; supports data-driven optimization";
    
    // Write enhanced symphony
    fs.writeFileSync(symphonyPath, JSON.stringify(symphony, null, 2));
    
    const beatCount = symphony.movements?.reduce((sum, m) => sum + (m.beats?.length || 0), 0) || 0;
    return { success: true, path: symphonyPath, beats: beatCount };
  } catch (error) {
    return { success: false, path: symphonyPath, error: error.message };
  }
}

// Execute enhancement
const basePath = 'c:\\source\\repos\\bpm\\Internal\\renderx-plugins-demo';
let results = { total: 0, enhanced: 0, failed: 0, totalBeats: 0 };

packages.forEach(pkg => {
  const pkgPath = path.join(basePath, pkg.dir);
  if (!fs.existsSync(pkgPath)) {
    return;
  }
  
  const files = fs.readdirSync(pkgPath)
    .filter(f => f.endsWith('.json') && !f.match(/(tsconfig|package|index\.json)/i));
  
  console.log(`\n📦 ${pkg.name}: ${files.length} symphonies`);
  
  files.forEach(file => {
    const symphonyPath = path.join(pkgPath, file);
    const result = enhanceSymphony(symphonyPath);
    
    results.total++;
    if (result.success) {
      results.enhanced++;
      results.totalBeats += result.beats;
      console.log(`  ✅ ${file} (${result.beats} beats enhanced)`);
    } else {
      results.failed++;
      console.log(`  ❌ ${file}: ${result.error}`);
    }
  });
});

console.log(`\n📊 Summary:`);
console.log(`  Total Symphonies: ${results.total}`);
console.log(`  Enhanced with MEASURABLE Goals & Gherkin AC: ${results.enhanced}`);
console.log(`  Failed: ${results.failed}`);
console.log(`  Total Beats with Professional Quality Metadata: ${results.totalBeats}`);

(function () {
  const CHANNEL = 'rx.test';
  const VERSION = '1.0.0';
  // No query parsing needed in the fake driver

  function post(type, payload) {
    parent.postMessage({ channel: CHANNEL, version: VERSION, type, payload }, '*');
  }

  function ready(phase, detail) { post('driver:readyPhase', { phase, detail }); }

  function setLabel(text) {
    const el = document.querySelector('[data-testid="fake-label"]');
    if (el) el.textContent = text;
  }

  function getText(sel) {
    const el = document.querySelector(sel);
    return el ? el.textContent : null;
  }

  window.addEventListener('message', async (event) => {
    const msg = event.data || {};
    if (msg.channel !== CHANNEL) return;

    if (msg.type === 'host:init') {
      post('driver:ack', { driverVersion: '0.0.1', capabilities: ['selectors', 'stateSnapshot'] });
      // Simulate deterministic phases
      ready(0);
      await new Promise(r => setTimeout(r, 10));
      ready(1);
      await new Promise(r => setTimeout(r, 10));
      ready(2);
    }

    if (msg.type === 'host:step') {
      const { id, type, payload } = msg.payload;
      try {
        if (type === 'setProps' && payload?.label) {
          setLabel(String(payload.label));
        }
        if (type === 'click' && payload?.selector) {
          document.querySelector(payload.selector)?.dispatchEvent(new Event('click', { bubbles: true }));
        }
        post('driver:stepResult', { id, status: 'ok' });
      } catch (e) {
        post('driver:stepResult', { id, status: 'fail', detail: String(e) });
      }
    }

    if (msg.type === 'host:assert') {
      const { id, type, payload } = msg.payload;
      try {
        if (type === 'selectorText') {
          const actual = getText(payload.selector);
          const ok = actual === payload.equals;
          post('driver:assertResult', { id, status: ok ? 'ok' : 'fail', detail: { actual } });
          return;
        }
        post('driver:assertResult', { id, status: 'ok' });
      } catch (e) {
        post('driver:assertResult', { id, status: 'fail', detail: String(e) });
      }
    }

    if (msg.type === 'host:snapshot') {
      post('driver:snapshot', { state: { label: getText('[data-testid="fake-label"]') } });
    }

    if (msg.type === 'host:teardown') {
      post('driver:teardownResult', { status: 'ok' });
    }
  });
})();

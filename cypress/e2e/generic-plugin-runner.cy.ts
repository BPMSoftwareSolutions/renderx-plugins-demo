/// <reference types="cypress" />

// Minimal Cypress analog of the Playwright generic runner.
// It loads the harness page and drives window.TestHarness for each scenario in /test/manifest.json.

function toHarnessUrl(driverUrl: string, scenarioId: string, phases = '0,1,2', timeout = 6000) {
  return `/src/test-plugin-loading.html?driver=${encodeURIComponent(driverUrl)}&scenario=${encodeURIComponent(scenarioId)}&phases=${phases}&timeout=${timeout}`;
}

describe('Generic Plugin Runner (Cypress)', () => {
  it('runs scenarios from local /test/manifest.json via TestHarness', function () {
    cy.request({ url: '/test/manifest.json', failOnStatusCode: false }).then((res) => {
      const contentType = String(res.headers?.['content-type'] || '');
      const isJson = contentType.includes('application/json');
      if (res.status !== 200 || !isJson) {
        // Skip if manifest is missing or server returned SPA fallback (HTML)
        cy.log('No JSON manifest at /test/manifest.json; skipping spec');
        // mark this test as skipped
        (this as any).skip();
        return;
      }

      let manifest: any = res.body;
      if (typeof manifest === 'string') {
        try { manifest = JSON.parse(manifest); } catch {
          cy.log('Manifest response is not valid JSON; skipping');
          (this as any).skip();
          return;
        }
      }

      expect(manifest).to.have.property('testApiVersion');
      expect(manifest).to.have.property('driverUrl');
      expect(Array.isArray(manifest.scenarios)).to.be.true;

      for (const scenario of manifest.scenarios) {
        const url = toHarnessUrl(manifest.driverUrl, scenario.id, '0,1,2', scenario?.readiness?.timeoutMs ?? 6000);
        cy.visit(url);

        // Steps
        cy.window().then((win) => {
          return (win as any).TestHarness.runSteps(scenario.steps || []);
        }).then((stepResults: any[]) => {
          (stepResults || []).forEach((r) => expect(r.status, `step for ${scenario.id}`).to.eq('ok'));
        });

        // Asserts
        cy.window().then((win) => {
          return (win as any).TestHarness.runAsserts(scenario.asserts || []);
        }).then((assertResults: any[]) => {
          (assertResults || []).forEach((r) => expect(r.status, `assert for ${scenario.id}`).to.eq('ok'));
        });
      }
    });
  });
});

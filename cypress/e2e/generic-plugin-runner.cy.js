// Minimal Cypress analog of the Playwright generic runner.
// Loads the harness page and drives window.TestHarness for each scenario in /test/manifest.json.

function toHarnessUrl(driverUrl, scenarioId, phases = '0,1,2', timeout = 6000) {
  return `/src/test-plugin-loading.html?driver=${encodeURIComponent(driverUrl)}&scenario=${encodeURIComponent(scenarioId)}&phases=${phases}&timeout=${timeout}`;
}

describe('Generic Plugin Runner (Cypress)', () => {
  it('runs scenarios from local /test/manifest.json via TestHarness', () => {
    cy.request({ url: '/test/manifest.json', failOnStatusCode: false }).then((res) => {
      if (res.status !== 200) {
        cy.log('No local /test/manifest.json found; skipping spec');
        return;
      }

      const manifest = res.body;
      expect(manifest).to.have.property('testApiVersion');
      expect(manifest).to.have.property('driverUrl');
      expect(Array.isArray(manifest.scenarios)).to.be.true;

      manifest.scenarios.forEach((scenario) => {
        const url = toHarnessUrl(manifest.driverUrl, scenario.id, '0,1,2', (scenario.readiness && scenario.readiness.timeoutMs) || 6000);
        cy.visit(url);

        cy.window().then((win) => (win).TestHarness.runSteps(scenario.steps || []))
          .then((stepResults) => {
            (stepResults || []).forEach((r) => expect(r.status, `step for ${scenario.id}`).to.eq('ok'));
          });

        cy.window().then((win) => (win).TestHarness.runAsserts(scenario.asserts || []))
          .then((assertResults) => {
            (assertResults || []).forEach((r) => expect(r.status, `assert for ${scenario.id}`).to.eq('ok'));
          });
      });
    });
  });
});

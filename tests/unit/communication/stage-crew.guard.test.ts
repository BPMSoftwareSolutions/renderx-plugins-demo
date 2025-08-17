import { TestEnvironment } from "../../utils/test-helpers";
import { StageDomGuard } from "../../../modules/communication/sequences/stage/StageDomGuard";

describe("StageDomGuard (dev-mode)", () => {
  afterEach(() => {
    try { StageDomGuard.uninstall(); } catch {}
    TestEnvironment.cleanup();
  });

  test("warns on direct DOM writes, but is silenced during StageCrew.apply", async () => {
    document.body.innerHTML = `<div id="a"></div>`;
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    StageDomGuard.install();

    // Direct DOM write triggers warning
    const a = document.querySelector("#a") as HTMLElement;
    a.classList.add("x");
    expect(warnSpy).toHaveBeenCalled();

    warnSpy.mockClear();

    // During StageCrew.apply (silenced)
    const { StageCrew } = await import("../../../modules/communication/sequences/stage/StageCrew");
    const eventBus = TestEnvironment.createEventBus();
    const sc = new (StageCrew as any)(eventBus as any, "p1");
    const txn = sc.beginBeat("corr-guard-1", {});
    txn.update("#a", { classes: { add: ["y"] } });
    txn.commit();

    expect(warnSpy).not.toHaveBeenCalled();

    warnSpy.mockRestore();
  });
});


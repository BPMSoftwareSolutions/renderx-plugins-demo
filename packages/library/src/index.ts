import { handlers } from './symphonies/load.symphony';

export async function register(conductor: any) {
  if (!conductor?.mount) return;

  const libraryLoadSeq = {
    pluginId: "LibraryPlugin",
    id: "library-load-symphony",
    name: "Library Load",
    movements: [
      {
        id: "load",
        name: "Load",
        beats: [
          { beat: 1, event: "library:components:load", title: "Load Components", dynamics: "mf", handler: "loadComponents", timing: "immediate", kind: "pure" },
          { beat: 2, event: "library:components:notify-ui", title: "Notify UI", dynamics: "mf", handler: "notifyUi", timing: "immediate", kind: "pure" }
        ]
      }
    ]
  };

  const mark = (id: string) => {
    const key = "_runtimeMountedSeqIds";
    const set = (conductor as any)[key] || new Set();
    set.add(id);
    (conductor as any)[key] = set;
  };

  await conductor.mount(libraryLoadSeq, handlers, libraryLoadSeq.pluginId);
  mark(libraryLoadSeq.id);
}

export { handlers } from './symphonies/load.symphony';
export { LibraryPanel } from './ui/LibraryPanel';

// RAG and Telemetry Services
export { RAGEnrichmentService } from './services/rag-enrichment.service';
export { RAGEnrichmentTelemetryService } from './services/rag-enrichment-telemetry.service';
export { ComponentBehaviorExtractor } from './telemetry/component-behavior-extractor';

// Types
export type { ComponentJSON } from './services/openai.types';
export type { EnrichmentResult, TelemetryEnrichmentResult } from './services/rag-enrichment-telemetry.service';
export type { ComponentBehaviorPattern, PluginSequenceMapping, LogChunk } from './telemetry/component-behavior-extractor';

/**
 * OgraphX Artifact Indexer
 * Indexes OgraphX self-observation artifacts (IR, sequences, tests, analysis) into the vector store
 */

import * as fs from 'fs';
import * as path from 'path';
import { VectorStore, ComponentMetadata, EmbeddingService } from '../store/store.types';
import {
  OgraphXDocument,
  IRGraph,
  OgraphXSequence,
  TestStructure,
  AnalysisData,
  OgraphXIndexResult,
  OgraphXIndexError,
} from './ographx-artifact.types';

export class OgraphXArtifactIndexer {
  private errors: OgraphXIndexError[] = [];
  private documentsByType: Record<string, number> = {};

  constructor(
    private vectorStore: VectorStore,
    private embeddingService: EmbeddingService
  ) {}

  /**
   * Index IR graph symbols and calls
   */
  async indexIRGraph(irPath: string, codebaseName: string): Promise<OgraphXDocument[]> {
    const documents: OgraphXDocument[] = [];
    try {
      const content = fs.readFileSync(irPath, 'utf-8');
      const irGraph: IRGraph = JSON.parse(content);

      // Index symbols
      for (const symbol of irGraph.symbols) {
        const doc = this.createSymbolDocument(symbol, codebaseName, irPath);
        documents.push(doc);
        this.documentsByType['symbol'] = (this.documentsByType['symbol'] || 0) + 1;
      }

      // Index calls
      for (const call of irGraph.calls) {
        const doc = this.createCallDocument(call, codebaseName, irPath);
        documents.push(doc);
        this.documentsByType['call'] = (this.documentsByType['call'] || 0) + 1;
      }
    } catch (error) {
      this.errors.push({
        artifactId: irPath,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date(),
      });
    }
    return documents;
  }

  /**
   * Index orchestration sequences
   */
  async indexSequences(sequencesPath: string, codebaseName: string): Promise<OgraphXDocument[]> {
    const documents: OgraphXDocument[] = [];
    try {
      const content = fs.readFileSync(sequencesPath, 'utf-8');
      const data = JSON.parse(content);
      const sequences: OgraphXSequence[] = data.sequences || [];

      for (const sequence of sequences) {
        const doc = this.createSequenceDocument(sequence, codebaseName, sequencesPath);
        documents.push(doc);
        this.documentsByType['sequence'] = (this.documentsByType['sequence'] || 0) + 1;

        // Index movements
        for (const movement of sequence.movements) {
          const movDoc = this.createMovementDocument(movement, sequence.id, codebaseName, sequencesPath);
          documents.push(movDoc);
          this.documentsByType['movement'] = (this.documentsByType['movement'] || 0) + 1;

          // Index beats
          for (const beat of movement.beats) {
            const beatDoc = this.createBeatDocument(beat, movement.id, sequence.id, codebaseName, sequencesPath);
            documents.push(beatDoc);
            this.documentsByType['beat'] = (this.documentsByType['beat'] || 0) + 1;
          }
        }
      }
    } catch (error) {
      this.errors.push({
        artifactId: sequencesPath,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date(),
      });
    }
    return documents;
  }

  /**
   * Index test structures
   */
  async indexTestStructure(testStructurePath: string, codebaseName: string): Promise<OgraphXDocument[]> {
    const documents: OgraphXDocument[] = [];
    try {
      const content = fs.readFileSync(testStructurePath, 'utf-8');
      const testStructure: TestStructure = JSON.parse(content);

      for (const [testType, categories] of Object.entries(testStructure)) {
        if (Array.isArray(categories)) {
          for (const category of categories) {
            const doc = this.createTestDocument(category, testType, codebaseName, testStructurePath);
            documents.push(doc);
            this.documentsByType['test'] = (this.documentsByType['test'] || 0) + 1;
          }
        }
      }
    } catch (error) {
      this.errors.push({
        artifactId: testStructurePath,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date(),
      });
    }
    return documents;
  }

  /**
   * Index analysis data
   */
  async indexAnalysis(analysisPath: string, codebaseName: string): Promise<OgraphXDocument[]> {
    const documents: OgraphXDocument[] = [];
    try {
      const content = fs.readFileSync(analysisPath, 'utf-8');
      const analysis: AnalysisData = JSON.parse(content);

      const doc = this.createAnalysisDocument(analysis, codebaseName, analysisPath);
      documents.push(doc);
      this.documentsByType['metric'] = (this.documentsByType['metric'] || 0) + 1;
    } catch (error) {
      this.errors.push({
        artifactId: analysisPath,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date(),
      });
    }
    return documents;
  }

  /**
   * Index all artifacts from a codebase directory
   */
  async indexCodebaseArtifacts(artifactDir: string, codebaseName: string): Promise<OgraphXIndexResult> {
    this.errors = [];
    this.documentsByType = {};
    let totalIndexed = 0;

    const documents: OgraphXDocument[] = [];

    // Index IR graph
    const irPath = path.join(artifactDir, 'ir', 'graph.json');
    if (fs.existsSync(irPath)) {
      const irDocs = await this.indexIRGraph(irPath, codebaseName);
      documents.push(...irDocs);
    }

    // Index sequences
    const sequencesPath = path.join(artifactDir, 'sequences', 'sequences.json');
    if (fs.existsSync(sequencesPath)) {
      const seqDocs = await this.indexSequences(sequencesPath, codebaseName);
      documents.push(...seqDocs);
    }

    // Index test structure
    const testPath = path.join(artifactDir, '..', 'test-graphs', 'test_structure.json');
    if (fs.existsSync(testPath)) {
      const testDocs = await this.indexTestStructure(testPath, codebaseName);
      documents.push(...testDocs);
    }

    // Index analysis
    const analysisPath = path.join(artifactDir, 'analysis', 'analysis.json');
    if (fs.existsSync(analysisPath)) {
      const analysisDocs = await this.indexAnalysis(analysisPath, codebaseName);
      documents.push(...analysisDocs);
    }

    // Add all documents to vector store
    for (const doc of documents) {
      try {
        const embedding = await this.embeddingService.embed(doc.content);
        const metadata = this.documentToMetadata(doc);
        await this.vectorStore.add(doc.id, embedding, metadata);
        totalIndexed++;
      } catch (error) {
        this.errors.push({
          artifactId: doc.id,
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date(),
        });
      }
    }

    return {
      total: documents.length,
      indexed: totalIndexed,
      failed: this.errors.length,
      errors: this.errors,
      documentsByType: this.documentsByType,
    };
  }

  // Helper methods for creating documents
  private createSymbolDocument(symbol: any, codebaseName: string, filePath: string): OgraphXDocument {
    return {
      id: `symbol:${symbol.id}`,
      type: 'symbol',
      title: `${symbol.name} (${symbol.kind})`,
      content: `${symbol.name} ${symbol.kind} in ${symbol.file}. Exported: ${symbol.exported}. Class: ${symbol.class_name || 'N/A'}`,
      metadata: {
        artifactType: 'ir',
        codebaseName,
        filePath,
        lineRange: symbol.range,
        tags: [symbol.kind, symbol.file, symbol.exported ? 'exported' : 'internal'],
        relationships: { calls: [], calledBy: [] },
      },
    };
  }

  private createCallDocument(call: any, codebaseName: string, filePath: string): OgraphXDocument {
    return {
      id: `call:${call.id}`,
      type: 'call',
      title: `Call: ${call.from} → ${call.to}`,
      content: `Function call from ${call.from} to ${call.to}`,
      metadata: {
        artifactType: 'ir',
        codebaseName,
        filePath,
        lineRange: call.range,
        tags: ['call', 'dependency'],
        relationships: { calls: [call.to], calledBy: [call.from] },
      },
    };
  }

  private createSequenceDocument(seq: OgraphXSequence, codebaseName: string, filePath: string): OgraphXDocument {
    return {
      id: `sequence:${seq.id}`,
      type: 'sequence',
      title: seq.name,
      content: `${seq.name} - ${seq.type}. Movements: ${seq.movements.length}`,
      metadata: {
        artifactType: 'sequence',
        codebaseName,
        filePath,
        tags: ['sequence', seq.type],
        relationships: {},
      },
    };
  }

  private createMovementDocument(mov: any, seqId: string, codebaseName: string, filePath: string): OgraphXDocument {
    return {
      id: `movement:${mov.id}`,
      type: 'movement',
      title: mov.name,
      content: `Movement: ${mov.name}. Beats: ${mov.beats.length}`,
      metadata: {
        artifactType: 'sequence',
        codebaseName,
        filePath,
        tags: ['movement'],
        relationships: { inSequence: seqId },
      },
    };
  }

  private createBeatDocument(beat: any, movId: string, seqId: string, codebaseName: string, filePath: string): OgraphXDocument {
    return {
      id: `beat:${beat.id}`,
      type: 'beat',
      title: `Beat: ${beat.event}`,
      content: `Event: ${beat.event}. Timing: ${beat.timing}`,
      metadata: {
        artifactType: 'sequence',
        codebaseName,
        filePath,
        tags: ['beat', beat.timing],
        relationships: { inMovement: movId, inSequence: seqId },
      },
    };
  }

  private createTestDocument(category: any, testType: string, codebaseName: string, filePath: string): OgraphXDocument {
    return {
      id: `test:${testType}:${category.name}`,
      type: 'test',
      title: category.name,
      content: `${category.name} - ${category.description}. Methods: ${category.count}. Type: ${testType}`,
      metadata: {
        artifactType: 'test',
        codebaseName,
        filePath,
        tags: ['test', testType, category.name],
        relationships: {},
      },
    };
  }

  private createAnalysisDocument(analysis: AnalysisData, codebaseName: string, filePath: string): OgraphXDocument {
    return {
      id: `analysis:${codebaseName}`,
      type: 'metric',
      title: `Analysis: ${codebaseName}`,
      content: `Files: ${analysis.statistics.files}, Symbols: ${analysis.statistics.symbols}, Calls: ${analysis.statistics.calls}. Avg calls/symbol: ${analysis.complexity.average_calls_per_symbol}`,
      metadata: {
        artifactType: 'analysis',
        codebaseName,
        filePath,
        tags: ['analysis', 'metrics'],
        relationships: {},
      },
    };
  }

  private documentToMetadata(doc: OgraphXDocument): ComponentMetadata {
    return {
      id: doc.id,
      name: doc.title,
      description: doc.content,
      type: doc.type,
      category: doc.metadata.artifactType,
      tags: doc.metadata.tags,
    };
  }
}


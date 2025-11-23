import { BaselineStoreEvent } from './store.baseline';
import { BaselineEstablishEvent } from './establish.baseline';

export interface BaselineCompletedEvent {
  timestamp: string;
  handler: 'baselineCompleted';
  event: 'baseline.completed';
  context: {
    handlerCount: number;
    lowConfidenceHandlers: string[];
    filePath: string;
    stored: boolean;
  };
}

export function baselineCompleted(storeEvt: BaselineStoreEvent, establishEvt: BaselineEstablishEvent): BaselineCompletedEvent {
  return {
    timestamp: new Date().toISOString(),
    handler: 'baselineCompleted',
    event: 'baseline.completed',
    context: {
      handlerCount: storeEvt.context.handlerCount,
      lowConfidenceHandlers: establishEvt.context.lowConfidenceHandlers,
      filePath: storeEvt.context.filePath,
      stored: storeEvt.context.stored
    }
  };
}

export default baselineCompleted;

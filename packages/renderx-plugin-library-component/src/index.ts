// Temporary in-repo runtime package for Library-Component until externalized
// Registers drag.start, drop (component), and drop (container) sequences using existing handlers.

import { handlers as dragHandlers } from '../../../../plugins/library-component/symphonies/drag.symphony';
import { handlers as dropHandlers } from '../../../../plugins/library-component/symphonies/drop.symphony';
import { handlers as containerDropHandlers } from '../../../../plugins/library-component/symphonies/drop.container.symphony';

export async function register(conductor: any) {
  if (!conductor?.mount) return;

  const dragSeq = {
    pluginId: 'LibraryComponentPlugin',
    id: 'library-component-drag-symphony',
    name: 'Library Component Drag',
    movements: [
      {
        id: 'drag',
        name: 'Drag',
        beats: [
          { beat: 1, event: 'library:component:drag:start', handler: 'onDragStart', kind: 'pure', dynamics: 'mf', timing: 'immediate' },
        ],
      },
    ],
  } as any;

  const dropSeq = {
    pluginId: 'LibraryComponentDropPlugin',
    id: 'library-component-drop-symphony',
    name: 'Library Component Drop',
    movements: [
      {
        id: 'drop',
        name: 'Drop',
        beats: [
          { beat: 1, event: 'library:component:drop', handler: 'publishCreateRequested', kind: 'pure', dynamics: 'mf', timing: 'immediate' },
        ],
      },
    ],
  } as any;

  const containerDropSeq = {
    pluginId: 'LibraryComponentDropPlugin',
    id: 'library-component-container-drop-symphony',
    name: 'Library Component Container Drop',
    movements: [
      {
        id: 'drop',
        name: 'Drop',
        beats: [
          { beat: 1, event: 'library:container:drop', handler: 'publishCreateRequested', kind: 'pure', dynamics: 'mf', timing: 'immediate' },
        ],
      },
    ],
  } as any;

  await conductor.mount(dragSeq, dragHandlers, dragSeq.pluginId);
  await conductor.mount(dropSeq, dropHandlers, dropSeq.pluginId);
  await conductor.mount(containerDropSeq, containerDropHandlers, containerDropSeq.pluginId);
}


import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSelectionSlice } from '../selectionSlice';

const mockSet = vi.fn();

describe('selectionSlice', () => {
  let store: any;
  let slice: any;
  
  // Fake nodes and edges for setSelectedNote Logic clearing selection
  const fakeNodes = [
    { id: 'n1', selected: true },
    { id: 'n2', selected: false }
  ];
  const fakeEdges = [
    { id: 'e1', selected: true }
  ];

  beforeEach(() => {
    store = { 
      selectedNodeId: undefined, 
      selectedEdgeId: undefined, 
      selectedNoteId: undefined,
      nodes: fakeNodes,
      edges: fakeEdges
    };

    mockSet.mockImplementation((callback) => {
      const newState = typeof callback === 'function' ? callback(store) : callback;
      store = { ...store, ...newState };
    });
    slice = createSelectionSlice(mockSet, {} as any, {} as any);
  });

  it('setSelectedNode should set node and clear others', () => {
    store.selectedEdgeId = 'e1';
    store.selectedNoteId = 'note1';
    
    slice.setSelectedNode('n1');

    expect(store.selectedNodeId).toBe('n1');
    expect(store.selectedEdgeId).toBeUndefined();
    expect(store.selectedNoteId).toBeUndefined();
  });

  it('setSelectedEdge should set edge and clear others', () => {
    store.selectedNodeId = 'n1';
    
    slice.setSelectedEdge('e1');

    expect(store.selectedEdgeId).toBe('e1');
    expect(store.selectedNodeId).toBeUndefined();
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createNodesSlice } from '../nodesSlice';
import type { BuilderStore } from '../../types';

// Mock crypto.randomUUID
const mockUUID = '1234-5678-9012-3456';
vi.stubGlobal('crypto', {
  randomUUID: () => mockUUID,
});

const mockSet = vi.fn();
const mockGet = vi.fn();

describe('nodesSlice', () => {
  let store: any;
  let slice: any;

  beforeEach(() => {
    store = { nodes: [], edges: [], selectedNodeId: undefined, dirty: false };
    mockSet.mockImplementation((callback) => {
      const newState = typeof callback === 'function' ? callback(store) : callback;
      store = { ...store, ...newState };
    });
    mockGet.mockReturnValue(store);
    slice = createNodesSlice(mockSet, mockGet, {} as any);
  });

  it('addNode should add a new node', () => {
    slice.addNode('app', { x: 100, y: 100 }, 'Test Node');
    
    expect(mockSet).toHaveBeenCalled();
    expect(store.nodes).toHaveLength(1);
    expect(store.nodes[0]).toEqual(expect.objectContaining({
      id: mockUUID,
      type: 'flowNode',
      position: { x: 100, y: 100 },
      data: expect.objectContaining({
        label: 'Test Node',
        nodeType: 'app',
      }),
    }));
    expect(store.selectedNodeId).toBe(mockUUID);
    expect(store.dirty).toBe(true);
  });

  it('deleteNode should remove node and connected edges', () => {
    // Setup initial state
    const node1 = { id: 'n1', position: { x: 0, y: 0 }, data: {} };
    const node2 = { id: 'n2', position: { x: 100, y: 0 }, data: {} };
    const edge = { id: 'e1', source: 'n1', target: 'n2' };
    
    store.nodes = [node1, node2];
    store.edges = [edge];
    
    slice.deleteNode('n1');

    expect(store.nodes).toHaveLength(1);
    expect(store.nodes[0].id).toBe('n2');
    expect(store.edges).toHaveLength(0); // Edge connected to n1 should be removed
    expect(store.dirty).toBe(true);
  });

  it('updateNodeData should update specific node data', () => {
    const node = { id: 'n1', position: { x: 0, y: 0 }, data: { label: 'Old' } };
    store.nodes = [node];

    slice.updateNodeData('n1', { label: 'New' });

    expect(store.nodes[0].data.label).toBe('New');
    expect(store.dirty).toBe(true);
  });
});

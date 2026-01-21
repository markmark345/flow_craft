import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createEdgesSlice } from '../edgesSlice';

// Mock crypto.randomUUID
const mockUUID = 'edge-uuid';
vi.stubGlobal('crypto', {
  randomUUID: () => mockUUID,
});

const mockSet = vi.fn();
const mockGet = vi.fn();

describe('edgesSlice', () => {
  let store: any;
  let slice: any;

  beforeEach(() => {
    store = { edges: [], dirty: false };
    mockSet.mockImplementation((callback) => {
      const newState = typeof callback === 'function' ? callback(store) : callback;
      store = { ...store, ...newState };
    });
    slice = createEdgesSlice(mockSet, mockGet, {} as any);
  });

  it('onConnect should add a new edge', () => {
    const connection = { source: 'n1', target: 'n2', sourceHandle: 'out', targetHandle: 'in' };
    
    slice.onConnect(connection);

    expect(store.edges).toHaveLength(1);
    expect(store.edges[0]).toEqual({
      id: mockUUID,
      source: 'n1',
      target: 'n2',
      sourceHandle: 'out',
      targetHandle: 'in',
    });
    expect(store.dirty).toBe(true);
  });

  it('setEdges should replace all edges', () => {
    const newEdges = [{ id: 'e1', source: 'a', target: 'b' }];
    slice.setEdges(newEdges);
    
    expect(store.edges).toEqual(newEdges);
    expect(store.dirty).toBe(true);
  });
});

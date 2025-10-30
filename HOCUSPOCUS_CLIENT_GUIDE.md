# Hocuspocus Client-Side Implementation Guide

## Installation

```bash
npm install @hocuspocus/provider yjs
```

## Client-Side Setup (React + ReactFlow)

### Step 1: Create a hook to manage Hocuspocus

```typescript
// hooks/useCollaborativeTrip.ts
import { useEffect, useState, useRef } from 'react'
import { HocuspocusProvider } from '@hocuspocus/provider'
import * as Y from 'yjs'
import { Node, Edge } from 'reactflow'

export function useCollaborativeTrip(tripId: string, apiUrl: string) {
    const [nodes, setNodes] = useState<Node[]>([])
    const [edges, setEdges] = useState<Edge[]>([])
    const [isConnected, setIsConnected] = useState(false)
    
    const ydocRef = useRef<Y.Doc | null>(null)
    const providerRef = useRef<HocuspocusProvider | null>(null)
    const yNodesRef = useRef<Y.Array<any> | null>(null)
    const yEdgesRef = useRef<Y.Array<any> | null>(null)

    useEffect(() => {
        // Create Yjs document
        const ydoc = new Y.Doc()
        ydocRef.current = ydoc

        // Get or create arrays for nodes and edges
        const yNodes = ydoc.getArray('nodes')
        const yEdges = ydoc.getArray('edges')
        yNodesRef.current = yNodes
        yEdgesRef.current = yEdges

        // Create Hocuspocus provider
        const provider = new HocuspocusProvider({
            url: `${apiUrl}/hocuspocus`,
            name: tripId,
            document: ydoc,
            
            onConnect: () => {
                console.log('Connected to Hocuspocus')
                setIsConnected(true)
            },
            
            onDisconnect: () => {
                console.log('Disconnected from Hocuspocus')
                setIsConnected(false)
            },
            
            onSynced: ({ state }) => {
                console.log('Synced:', state)
                // Initial load - set nodes and edges from Yjs
                if (yNodes.length > 0) {
                    setNodes(yNodes.get(0) || [])
                }
                if (yEdges.length > 0) {
                    setEdges(yEdges.get(0) || [])
                }
            },
        })
        
        providerRef.current = provider

        // Observe changes to nodes
        const nodesObserver = () => {
            if (yNodes.length > 0) {
                setNodes([...yNodes.get(0)])
            }
        }
        yNodes.observe(nodesObserver)

        // Observe changes to edges
        const edgesObserver = () => {
            if (yEdges.length > 0) {
                setEdges([...yEdges.get(0)])
            }
        }
        yEdges.observe(edgesObserver)

        // Cleanup
        return () => {
            yNodes.unobserve(nodesObserver)
            yEdges.unobserve(edgesObserver)
            provider.destroy()
        }
    }, [tripId, apiUrl])

    // Function to update nodes (call this from ReactFlow's onNodesChange)
    const updateNodes = (newNodes: Node[]) => {
        if (yNodesRef.current && providerRef.current) {
            // Use Yjs transaction to update
            ydocRef.current?.transact(() => {
                if (yNodesRef.current!.length === 0) {
                    yNodesRef.current!.push([newNodes])
                } else {
                    yNodesRef.current!.delete(0, 1)
                    yNodesRef.current!.push([newNodes])
                }
            })
        }
    }

    // Function to update edges (call this from ReactFlow's onEdgesChange)
    const updateEdges = (newEdges: Edge[]) => {
        if (yEdgesRef.current && providerRef.current) {
            ydocRef.current?.transact(() => {
                if (yEdgesRef.current!.length === 0) {
                    yEdgesRef.current!.push([newEdges])
                } else {
                    yEdgesRef.current!.delete(0, 1)
                    yEdgesRef.current!.push([newEdges])
                }
            })
        }
    }

    return {
        nodes,
        edges,
        updateNodes,
        updateEdges,
        isConnected,
    }
}
```

### Step 2: Use in your ReactFlow component

```typescript
// components/TripFlow.tsx
import React, { useCallback } from 'react'
import ReactFlow, {
    Node,
    Edge,
    NodeChange,
    EdgeChange,
    applyNodeChanges,
    applyEdgeChanges,
    addEdge,
    Connection,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useCollaborativeTrip } from '../hooks/useCollaborativeTrip'

interface TripFlowProps {
    tripId: string
    apiUrl: string
}

export function TripFlow({ tripId, apiUrl }: TripFlowProps) {
    const { nodes, edges, updateNodes, updateEdges, isConnected } = useCollaborativeTrip(tripId, apiUrl)

    const onNodesChange = useCallback(
        (changes: NodeChange[]) => {
            const newNodes = applyNodeChanges(changes, nodes)
            updateNodes(newNodes)
        },
        [nodes, updateNodes]
    )

    const onEdgesChange = useCallback(
        (changes: EdgeChange[]) => {
            const newEdges = applyEdgeChanges(changes, edges)
            updateEdges(newEdges)
        },
        [edges, updateEdges]
    )

    const onConnect = useCallback(
        (connection: Connection) => {
            const newEdges = addEdge(connection, edges)
            updateEdges(newEdges)
        },
        [edges, updateEdges]
    )

    return (
        <div style={{ width: '100vw', height: '100vh' }}>
            <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}>
                Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </div>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
            />
        </div>
    )
}
```

### Step 3: Adding a new expense node

```typescript
// When creating a new expense node
const addExpenseNode = () => {
    const newNode: Node = {
        id: uid(), // or whatever ID generation you use
        type: 'expenseNode',
        position: { x: 100, y: 100 },
        data: {
            // Your ExpenseNode data
            id: uid(),
            tripId: tripId,
            name: 'New Expense',
            amount: 0,
            currency: 'USD',
            paidBy: [],
            splitBetween: [],
            // ... other ExpenseNode fields
        },
    }
    
    updateNodes([...nodes, newNode])
}
```

## Key Points

1. **Don't use Socket.IO anymore** for trip updates - Hocuspocus handles all real-time sync
2. **All changes are automatic** - when one client modifies nodes/edges, all other clients get updated
3. **Persists to database** - the backend `onChange` handler saves to your database
4. **Conflict resolution** - Yjs handles conflicts automatically using CRDTs
5. **Offline support** - changes are queued and synced when connection returns

## Migration Steps

1. ✅ Backend setup (done above)
2. Install client packages
3. Create the hook
4. Replace your current ReactFlow setup to use the hook
5. Remove Socket.IO event listeners for `trip:update` and `trip:node:delete`
6. Test with multiple browser windows open

## Testing

Open your app in multiple browser tabs/windows. Changes in one should appear in all others in real-time!

# Updated Client-Side Implementation

Based on your existing `rebuildTree` and `buildTreeNodes` functions, here's how to adapt them for Hocuspocus:

## Changes to Your Current Code

### 1. Replace your current trip state management with Hocuspocus

```typescript
import { useEffect, useRef, useCallback } from 'react'
import { HocuspocusProvider } from '@hocuspocus/provider'
import * as Y from 'yjs'
import { Node, Edge } from 'reactflow'

// In your component
const ydocRef = useRef<Y.Doc | null>(null)
const providerRef = useRef<HocuspocusProvider | null>(null)

useEffect(() => {
    if (!trip?.id) return

    // Create Yjs document
    const ydoc = new Y.Doc()
    ydocRef.current = ydoc

    // Get arrays for nodes and edges
    const yNodes = ydoc.getArray('nodes')
    const yEdges = ydoc.getArray('edges')

    // Create Hocuspocus provider
    const provider = new HocuspocusProvider({
        url: `${api_url}/hocuspocus`,
        name: trip.id,
        document: ydoc,
        
        onSynced: ({ state }) => {
            if (state) {
                console.log('Initial sync complete')
                // Backend has loaded the trip data, now rebuild with UI elements
                rebuildTreeFromYjs()
            }
        },
    })
    
    providerRef.current = provider

    // Observe changes from other clients
    const observer = () => {
        console.log('Changes detected from other clients')
        rebuildTreeFromYjs()
    }
    
    yNodes.observe(observer)
    yEdges.observe(observer)

    return () => {
        yNodes.unobserve(observer)
        yEdges.unobserve(observer)
        provider.destroy()
    }
}, [trip?.id])
```

### 2. Update your `rebuildTree` function

```typescript
// New function: Rebuild tree from Yjs (adds UI elements to backend data)
const rebuildTreeFromYjs = useCallback(() => {
    if (!ydocRef.current) return

    const yNodes = ydocRef.current.getArray('nodes')
    const yEdges = ydocRef.current.getArray('edges')

    if (yNodes.length === 0 || yEdges.length === 0) {
        setNodes([])
        setEdges([])
        return
    }

    // Get the data nodes from Yjs (these are the ExpenseNode-based nodes)
    const dataNodes = yNodes.get(0) as Node[]
    const dataEdges = yEdges.get(0) as Edge[]

    // Add UI-specific elements (placeholders, etc.)
    const allNodes = [...dataNodes]
    const allEdges = [...dataEdges]

    // Add root placeholder if canEdit
    if (canEdit) {
        allNodes.push({
            id: "placeholder_root",
            type: "placeholder",
            position: { x: 0, y: 0 },
            data: { parentId: null },
        })
    }

    // Add placeholder nodes for each expense node (if canEdit)
    if (canEdit) {
        dataNodes.forEach((node) => {
            if (node.type === "expense") {
                const placeholderId = `placeholder_${node.id}`
                allNodes.push({
                    id: placeholderId,
                    type: "placeholder",
                    position: { x: 0, y: 0 },
                    data: { parentId: node.id },
                })

                allEdges.push({
                    id: `edge_${node.id}-${placeholderId}`,
                    source: node.id,
                    target: placeholderId,
                    type: ConnectionLineType.SmoothStep,
                    animated: true,
                    style: {
                        strokeDasharray: "5,5",
                    },
                })
            }
        })
    }

    // Add UI styling to edges (animations, colors, etc.)
    const styledEdges = allEdges.map((edge) => ({
        ...edge,
        type: edge.type || ConnectionLineType.SmoothStep,
        animated: edge.animated !== undefined ? edge.animated : true,
    }))

    // Apply layout
    const layouted = updateLayout(allNodes, styledEdges)
    const edgesWithColors = updateEdgeColors(layouted.nodes, layouted.edges)
    
    setNodes(layouted.nodes)
    setEdges(edgesWithColors)
}, [canEdit, theme, updateEdgeColors])
```

### 3. When adding a new expense node

```typescript
const handleAddExpense = useCallback((parentId?: string) => {
    if (!ydocRef.current) return

    const yNodes = ydocRef.current.getArray('nodes')
    const yEdges = ydocRef.current.getArray('edges')

    const currentNodes = yNodes.length > 0 ? (yNodes.get(0) as Node[]) : []
    const currentEdges = yEdges.length > 0 ? (yEdges.get(0) as Edge[]) : []

    // Create new expense node
    const newNodeId = uid()
    const newNode: Node = {
        id: newNodeId,
        type: "expense",
        position: { x: 0, y: 0 }, // Will be positioned by layout
        data: {
            id: newNodeId,
            tripId: trip.id,
            name: 'New Expense',
            amount: 0,
            currency: 'USD',
            paidBy: [],
            splitBetween: [],
            date: Date.now(),
            description: '',
            // ... other ExpenseNode fields
        },
    }

    // Add to nodes
    const newNodes = [...currentNodes, newNode]

    // Create edge if there's a parent
    let newEdges = currentEdges
    if (parentId) {
        const newEdge: Edge = {
            id: `edge_${parentId}-${newNodeId}`,
            source: parentId,
            target: newNodeId,
        }
        newEdges = [...currentEdges, newEdge]
    }

    // Update Yjs (this syncs to all clients and backend)
    ydocRef.current.transact(() => {
        yNodes.delete(0, yNodes.length)
        yNodes.push([newNodes])
        
        yEdges.delete(0, yEdges.length)
        yEdges.push([newEdges])
    })

    // UI will update via the observer
}, [trip?.id])
```

### 4. When updating an expense node

```typescript
const handleUpdateExpense = useCallback((nodeId: string, updates: Partial<ExpenseNode>) => {
    if (!ydocRef.current) return

    const yNodes = ydocRef.current.getArray('nodes')
    const currentNodes = yNodes.get(0) as Node[]

    // Update the node
    const newNodes = currentNodes.map((node) => {
        if (node.id === nodeId) {
            return {
                ...node,
                data: {
                    ...node.data,
                    ...updates,
                },
            }
        }
        return node
    })

    // Update Yjs
    ydocRef.current.transact(() => {
        yNodes.delete(0, 1)
        yNodes.push([newNodes])
    })
}, [])
```

### 5. When deleting an expense node

```typescript
const handleDeleteExpense = useCallback((nodeId: string) => {
    if (!ydocRef.current) return

    const yNodes = ydocRef.current.getArray('nodes')
    const yEdges = ydocRef.current.getArray('edges')

    const currentNodes = yNodes.get(0) as Node[]
    const currentEdges = yEdges.get(0) as Edge[]

    // Remove node and all its descendants
    const nodesToRemove = new Set<string>()
    
    const collectDescendants = (id: string) => {
        nodesToRemove.add(id)
        currentEdges.forEach((edge) => {
            if (edge.source === id) {
                collectDescendants(edge.target)
            }
        })
    }
    
    collectDescendants(nodeId)

    // Filter out removed nodes and their edges
    const newNodes = currentNodes.filter((node) => !nodesToRemove.has(node.id))
    const newEdges = currentEdges.filter(
        (edge) => !nodesToRemove.has(edge.source) && !nodesToRemove.has(edge.target)
    )

    // Update Yjs
    ydocRef.current.transact(() => {
        yNodes.delete(0, 1)
        yNodes.push([newNodes])
        
        yEdges.delete(0, 1)
        yEdges.push([newEdges])
    })
}, [])
```

### 6. When moving a node (ReactFlow drag)

```typescript
const onNodesChange = useCallback((changes: NodeChange[]) => {
    if (!ydocRef.current) return

    const yNodes = ydocRef.current.getArray('nodes')
    const currentNodes = yNodes.get(0) as Node[]

    // Apply changes
    const newNodes = applyNodeChanges(changes, currentNodes)

    // Only update if positions changed (not for selections, etc.)
    const positionChanged = changes.some((change) => change.type === 'position')
    
    if (positionChanged) {
        // Update Yjs (syncs to all clients)
        ydocRef.current.transact(() => {
            yNodes.delete(0, 1)
            yNodes.push([newNodes])
        })
    }

    // Update local state for immediate UI feedback
    rebuildTreeFromYjs()
}, [])
```

## Key Points

✅ **Backend stores**: ExpenseNode data as nodes + edges (no UI stuff)
✅ **Frontend adds**: Placeholders, animations, styling, layout
✅ **Position is stored**: In the ExpenseNode so all clients see same layout
✅ **Changes sync automatically**: Via Yjs/Hocuspocus
✅ **Your existing functions stay**: `buildTreeNodes`, `updateLayout`, `updateEdgeColors` all still work!

## Architecture Summary

```
Backend (Hocuspocus):
- Stores: expense nodes + edges (pure data)
- Converts: ExpenseNode hierarchy ↔ flat nodes/edges
- Persists: To database on every change

Frontend (Your code):
- Receives: Base nodes/edges from backend
- Adds: Placeholders, styling, animations
- Applies: Layout (dagre)
- Updates: Back to Yjs on any change
```

This way, your existing `rebuildTree` logic stays mostly the same, but instead of getting `trip.nodes` from props, you get base nodes from Yjs and add UI elements!

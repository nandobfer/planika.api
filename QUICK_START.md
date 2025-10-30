# Quick Start Guide

## Summary

**Your backend is ready!** ✅ 

The backend now:
- Converts ExpenseNode hierarchy ↔ flat nodes/edges automatically
- Syncs changes to all clients in real-time
- Persists to database on every change

## Your Question Answered

> "is this what i was using on my frontend, that we need to make it on backend and just send to clients?"

**NO!** Your frontend code should **mostly stay the same**. Here's what goes where:

### Backend Does (Already Done ✅):
```typescript
// Convert hierarchy to flat structure (for ReactFlow)
ExpenseNode { children: [...] }  →  nodes[] + edges[]

// Store positions
node.position = { x, y }

// Sync to all clients
// Save to database
```

### Frontend Does (Your Existing Code):
```typescript
// Add placeholders (UI only)
{ id: 'placeholder_root', type: 'placeholder' }

// Add styling (UI only)
edge.animated = true
edge.style = { strokeDasharray: "5,5" }

// Apply layout (UI only)
updateLayout(nodes, edges)  // your dagre function

// Edge colors (UI only)
updateEdgeColors(nodes, edges)  // your theme-based colors
```

## Next Step: Update Frontend

Install packages:
```bash
npm install @hocuspocus/provider yjs
```

Then make these 3 simple changes to your current component:

### Change 1: Add Hocuspocus connection
```typescript
import { HocuspocusProvider } from '@hocuspocus/provider'
import * as Y from 'yjs'

const ydocRef = useRef<Y.Doc | null>(null)
const providerRef = useRef<HocuspocusProvider | null>(null)

useEffect(() => {
    if (!trip?.id) return

    const ydoc = new Y.Doc()
    ydocRef.current = ydoc

    const provider = new HocuspocusProvider({
        url: `${api_url}/hocuspocus`,
        name: trip.id,
        document: ydoc,
        onSynced: () => rebuildTreeFromYjs(),
    })
    
    providerRef.current = provider

    const yNodes = ydoc.getArray('nodes')
    const yEdges = ydoc.getArray('edges')
    
    yNodes.observe(() => rebuildTreeFromYjs())
    yEdges.observe(() => rebuildTreeFromYjs())

    return () => {
        yNodes.unobserve()
        yEdges.unobserve()
        provider.destroy()
    }
}, [trip?.id])
```

### Change 2: Modify your rebuildTree function
```typescript
// OLD:
const rebuildTree = useCallback(() => {
    if (!trip) return
    
    const allNodes: Node[] = []
    const allEdges: Edge[] = []
    
    // Add root placeholder
    if (canEdit) {
        allNodes.push({
            id: "placeholder_root",
            type: "placeholder",
            position: { x: 0, y: 0 },
            data: { parentId: null },
        })
    }
    
    // Build tree for each root node
    trip.nodes.forEach((rootNode) => {
        const result = buildTreeNodes(rootNode)
        allNodes.push(...result.nodes)
        allEdges.push(...result.edges)
    })
    
    // ... rest of your code
}, [trip, theme, canEdit])

// NEW:
const rebuildTreeFromYjs = useCallback(() => {
    if (!ydocRef.current) return
    
    const yNodes = ydocRef.current.getArray('nodes')
    const yEdges = ydocRef.current.getArray('edges')
    
    // Get base nodes from Yjs (no placeholders yet)
    const baseNodes = yNodes.length > 0 ? (yNodes.get(0) as Node[]) : []
    const baseEdges = yEdges.length > 0 ? (yEdges.get(0) as Edge[]) : []
    
    const allNodes = [...baseNodes]
    const allEdges = [...baseEdges]
    
    // Add root placeholder (same as before)
    if (canEdit) {
        allNodes.push({
            id: "placeholder_root",
            type: "placeholder",
            position: { x: 0, y: 0 },
            data: { parentId: null },
        })
    }
    
    // Add placeholders for each expense node (same as before)
    if (canEdit) {
        baseNodes.forEach((node) => {
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
                    style: { strokeDasharray: "5,5" },
                })
            }
        })
    }
    
    // Rest is the same
    const layouted = updateLayout(allNodes, allEdges)
    const edgesWithColors = updateEdgeColors(layouted.nodes, layouted.edges)
    setNodes(layouted.nodes)
    setEdges(edgesWithColors)
}, [canEdit, theme, updateEdgeColors])
```

### Change 3: Update node operations
```typescript
// When adding a node:
const handleAddNode = (parentId?: string) => {
    if (!ydocRef.current) return
    
    const yNodes = ydocRef.current.getArray('nodes')
    const yEdges = ydocRef.current.getArray('edges')
    
    const currentNodes = yNodes.get(0) as Node[] || []
    const currentEdges = yEdges.get(0) as Edge[] || []
    
    const newNode = {
        id: uid(),
        type: "expense",
        position: { x: 0, y: 0 },
        data: { /* your ExpenseNode data */ },
    }
    
    const newEdge = parentId ? {
        id: `edge_${parentId}-${newNode.id}`,
        source: parentId,
        target: newNode.id,
    } : null
    
    ydocRef.current.transact(() => {
        yNodes.delete(0, 1)
        yNodes.push([[...currentNodes, newNode]])
        
        if (newEdge) {
            yEdges.delete(0, 1)
            yEdges.push([[...currentEdges, newEdge]])
        }
    })
}
```

## That's It!

Your existing code for:
- ✅ `buildTreeNodes` - can still use it or use the flat structure directly
- ✅ `updateLayout` - keep as-is
- ✅ `updateEdgeColors` - keep as-is
- ✅ Placeholder logic - keep as-is
- ✅ All your UI components - keep as-is

Just swap the data source from `trip.nodes` to Yjs!

## Testing

1. Start your backend
2. Open your app in 2+ browser windows
3. Make changes in one window
4. See them appear in real-time in all other windows! 🎉

## See Also

- `CLIENT_IMPLEMENTATION.md` - Detailed examples
- `ARCHITECTURE_DIAGRAM.md` - Visual explanation
- `HOCUSPOCUS_CLIENT_GUIDE.md` - Original guide

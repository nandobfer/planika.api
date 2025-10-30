# ExpenseNode Position Management

Since your `ExpenseNode` class doesn't have a `position` property (needed for ReactFlow), you have two options:

## Option 1: Add position to ExpenseNode (Recommended)

Add to your ExpenseNode class:

```typescript
// In ExpenseNode.ts
export class ExpenseNode {
    // ... existing properties
    position?: { x: number; y: number }
    
    // In constructor
    constructor(data: WithoutFunctions<ExpenseNode>) {
        // ... existing assignments
        this.position = data.position || { x: 0, y: 0 }
    }
}
```

## Option 2: Store position separately in ReactFlow node

Keep position only in the ReactFlow node, not in ExpenseNode data. Modify the conversion functions:

```typescript
// In hocuspocus.ts - convertExpenseNodesToReactFlow function
function convertExpenseNodesToReactFlow(expenseNodes: any[], positions?: Map<string, {x: number, y: number}>) {
    const nodes: any[] = []
    const edges: any[] = []
    
    // Use a simple layout algorithm if no positions provided
    let xOffset = 0
    let yOffset = 0

    function traverse(node: any, parentId?: string, depth: number = 0) {
        const position = positions?.get(node.id) || {
            x: xOffset,
            y: yOffset + (depth * 150), // Space nodes vertically by depth
        }
        
        xOffset += 250 // Horizontal spacing

        nodes.push({
            id: node.id,
            type: 'expenseNode',
            position,
            data: {
                // All ExpenseNode properties EXCEPT children and position
                id: node.id,
                tripId: node.tripId,
                name: node.name,
                amount: node.amount,
                currency: node.currency,
                paidBy: node.paidBy,
                splitBetween: node.splitBetween,
                date: node.date,
                description: node.description,
                // Add any other ExpenseNode properties here
            },
        })

        if (parentId) {
            edges.push({
                id: `${parentId}-${node.id}`,
                source: parentId,
                target: node.id,
                type: 'smoothstep',
            })
        }

        if (node.children && node.children.length > 0) {
            node.children.forEach((child: any) => traverse(child, node.id, depth + 1))
        }
    }

    expenseNodes.forEach(node => {
        xOffset = 0 // Reset X for each root node
        traverse(node, undefined, 0)
    })

    return { nodes, edges }
}
```

## Client-Side: Working with ExpenseNode data

```typescript
// In your React component
import { ExpenseNode } from '@/types' // Your ExpenseNode type

// When adding a new expense
const addExpenseNode = (parentNodeId?: string) => {
    const newExpenseData = {
        id: uid(),
        tripId: tripId,
        name: 'New Expense',
        amount: 0,
        currency: 'USD',
        paidBy: [],
        splitBetween: [],
        date: Date.now(),
        description: '',
        children: [], // Empty, will be represented by edges
    }
    
    const newReactFlowNode: Node = {
        id: newExpenseData.id,
        type: 'expenseNode',
        position: { x: Math.random() * 500, y: Math.random() * 500 },
        data: newExpenseData,
    }
    
    const newNodes = [...nodes, newReactFlowNode]
    
    // If there's a parent, create an edge
    let newEdges = edges
    if (parentNodeId) {
        const newEdge: Edge = {
            id: `${parentNodeId}-${newExpenseData.id}`,
            source: parentNodeId,
            target: newExpenseData.id,
            type: 'smoothstep',
        }
        newEdges = [...edges, newEdge]
        updateEdges(newEdges)
    }
    
    updateNodes(newNodes)
}

// When updating an expense node's data
const updateExpenseNode = (nodeId: string, updates: Partial<ExpenseNode>) => {
    const newNodes = nodes.map(node => {
        if (node.id === nodeId) {
            return {
                ...node,
                data: {
                    ...node.data,
                    ...updates,
                }
            }
        }
        return node
    })
    
    updateNodes(newNodes)
}

// Example: Update expense amount
const handleAmountChange = (nodeId: string, newAmount: number) => {
    updateExpenseNode(nodeId, { amount: newAmount })
}
```

## Custom Node Component Example

```typescript
// components/ExpenseNodeComponent.tsx
import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'

export const ExpenseNodeComponent = memo(({ data, selected }: NodeProps) => {
    return (
        <div
            style={{
                padding: '10px',
                border: selected ? '2px solid #1a73e8' : '1px solid #ddd',
                borderRadius: '8px',
                background: 'white',
                minWidth: '200px',
            }}
        >
            <Handle type="target" position={Position.Top} />
            
            <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                {data.name || 'Unnamed Expense'}
            </div>
            
            <div style={{ fontSize: '14px', color: '#666' }}>
                {data.currency} {data.amount?.toFixed(2) || '0.00'}
            </div>
            
            {data.description && (
                <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                    {data.description}
                </div>
            )}
            
            <Handle type="source" position={Position.Bottom} />
        </div>
    )
})

// Register the custom node type
const nodeTypes = {
    expenseNode: ExpenseNodeComponent,
}

// Use in ReactFlow
<ReactFlow
    nodes={nodes}
    edges={edges}
    nodeTypes={nodeTypes}
    // ... other props
/>
```

## Important Notes

1. **Position management**: ReactFlow needs positions. You can either:
   - Store them in your ExpenseNode (recommended for persistence)
   - Let ReactFlow manage them (easier, but positions reset on reload)

2. **Children to Edges**: Your ExpenseNode has `children[]`, but ReactFlow uses edges to show relationships. The conversion functions handle this automatically.

3. **Data structure**: Each ReactFlow node's `data` property contains your full ExpenseNode data.

4. **Updates**: Any change to `node.data` will be synced across all clients via Hocuspocus.

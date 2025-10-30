# Architecture Overview: What Goes Where?

## Backend (Hocuspocus) - Data Layer

```
┌─────────────────────────────────────┐
│         BACKEND (Node.js)          │
├─────────────────────────────────────┤
│                                     │
│  Database (Prisma)                 │
│  ┌──────────────────┐              │
│  │ Trip             │              │
│  │  - nodes: [      │              │
│  │      {           │              │
│  │        id,       │              │
│  │        name,     │              │
│  │        amount,   │              │
│  │        children: │              │  
│  │          [...]   │              │  Hierarchy
│  │      }           │              │
│  │    ]             │              │
│  └──────────────────┘              │
│           ↕                         │
│  Hocuspocus converts to:           │
│  ┌──────────────────┐              │
│  │ Yjs Document     │              │
│  │  - nodes: [      │              │
│  │      {           │              │
│  │        id,       │              │
│  │        type: 'expense',        │
│  │        position: {x, y},       │  Flat structure
│  │        data: {...}             │
│  │      }           │              │
│  │    ]             │              │
│  │  - edges: [      │              │
│  │      {source, target}          │
│  │    ]             │              │
│  └──────────────────┘              │
│                                     │
└─────────────────────────────────────┘
           ↕ WebSocket
```

## Frontend (React) - Presentation Layer

```
┌─────────────────────────────────────┐
│      FRONTEND (React/ReactFlow)    │
├─────────────────────────────────────┤
│                                     │
│  Receives from Yjs:                │
│  ┌──────────────────┐              │
│  │ nodes: [         │              │
│  │   {              │              │
│  │     id: '1',     │              │
│  │     type: 'expense',           │
│  │     position: {x, y},          │
│  │     data: ExpenseNode          │
│  │   }              │              │
│  │ ]                │              │
│  │ edges: [         │              │
│  │   {source: '1', target: '2'}  │
│  │ ]                │              │
│  └──────────────────┘              │
│           ↓                         │
│  YOUR CODE ADDS:                   │
│  ┌──────────────────┐              │
│  │ + Placeholders   │              │
│  │ + Edge styles    │              │
│  │ + Animations     │              │
│  │ + dagre layout   │              │
│  │ + Edge colors    │              │
│  └──────────────────┘              │
│           ↓                         │
│  ReactFlow renders:                │
│  ┌──────────────────┐              │
│  │  ┌───┐           │              │
│  │  │ A │──┐        │              │
│  │  └───┘  │        │              │
│  │    ┌────▼──┐     │              │
│  │    │   B   │     │              │
│  │    └───────┘     │              │
│  │    ┌───┐         │              │
│  │    │ + │ ← placeholder         │
│  │    └───┘         │              │
│  └──────────────────┘              │
│                                     │
└─────────────────────────────────────┘
```

## What Each Layer Does

### Backend Responsibilities ✅
- ✅ Load Trip from database
- ✅ Convert hierarchy to flat structure
- ✅ Store nodes with positions
- ✅ Sync changes to all clients
- ✅ Save changes to database
- ✅ NO UI logic (no placeholders, no styling, no layout)

### Frontend Responsibilities ✅
- ✅ Receive base nodes/edges from Yjs
- ✅ Add placeholder nodes (for adding new expenses)
- ✅ Add edge animations and styling
- ✅ Apply dagre layout algorithm
- ✅ Handle edge colors based on theme
- ✅ Render with ReactFlow
- ✅ Handle user interactions
- ✅ Send updates back to Yjs (syncs to all clients)

## Data Flow Example

### User adds a new expense:

```
Frontend (Client A)
  │
  │ 1. User clicks "Add Expense"
  │
  ├──> Create new node:
  │    { id: '3', type: 'expense', data: {...} }
  │
  │ 2. Update Yjs document
  │
  ├──> yNodes.push([...nodes, newNode])
  │
  ↓

Hocuspocus (Backend)
  │
  │ 3. onChange triggered
  │
  ├──> Convert flat → hierarchy
  │
  ├──> Save to database
  │
  │ 4. Sync to all connected clients
  │
  ↓

Frontend (Client B, C, D...)
  │
  │ 5. Yjs observer triggered
  │
  ├──> Receive new nodes/edges
  │
  ├──> rebuildTreeFromYjs()
  │
  ├──> Add placeholders
  │
  ├──> Apply layout
  │
  └──> ReactFlow updates
       (User sees new expense instantly!)
```

## Migration Summary

### ❌ REMOVE from your code:
```typescript
// Don't need these anymore!
socket.emit('trip:update', ...)
socket.on('trip:update', ...)
socket.on('trip:node:delete', ...)
```

### ✅ KEEP in your code:
```typescript
// All these stay the same!
const updateLayout = (nodes, edges) => { /* dagre logic */ }
const updateEdgeColors = (nodes, edges) => { /* color logic */ }
const buildTreeNodes = (expenseNode, parentId) => { /* still useful */ }
```

### 🔄 CHANGE in your code:
```typescript
// Instead of getting trip from props:
// const { trip } = props

// Get nodes/edges from Yjs:
const yNodes = ydoc.getArray('nodes')
const yEdges = ydoc.getArray('edges')
const baseNodes = yNodes.get(0)
const baseEdges = yEdges.get(0)

// Then add your UI elements (placeholders, etc.)
```

## Benefits

✅ **Real-time sync** - All clients see changes instantly
✅ **Conflict resolution** - Yjs handles simultaneous edits
✅ **Offline support** - Changes queued and synced when online
✅ **Persisted** - Backend saves to database automatically
✅ **Separation of concerns** - Backend = data, Frontend = UI
✅ **Scalable** - Hocuspocus can handle many concurrent clients

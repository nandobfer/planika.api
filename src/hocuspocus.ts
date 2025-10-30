import { Hocuspocus } from "@hocuspocus/server"
import { Trip } from "./class/Trip/Trip"
import * as Y from "yjs"
import { Node, Edge } from "@xyflow/react"
import { ExpenseNode } from "./class/Trip/ExpenseNode"

export const hocuspocus = new Hocuspocus({
    /**
     * The name here is the "document name" which corresponds to trip.id in your case
     */
    onConnect: async (data) => {
        console.log(`Client connected to document: ${data.documentName}`)
    },

    onDisconnect: async (data) => {
        console.log(`Client disconnected from document: ${data.documentName}`)
    },

    /**
     * This is called when a document is loaded for the first time
     * You can use this to load the initial state from your database
     */
    onLoadDocument: async (data) => {
        const tripId = data.documentName
        console.log(`Loading document for trip: ${tripId}`)

        // Load the trip from database
        const trip = await Trip.findById(tripId)

        if (trip) {
            // Initialize the Yjs document with trip data
            const yDoc = data.document
            const yNodes = yDoc.getArray("nodes")
            const yEdges = yDoc.getArray("edges")

            // Convert your ExpenseNode hierarchy to flat nodes/edges for ReactFlow
            const { nodes, edges } = convertExpenseNodesToReactFlow(trip.nodes)

            console.log(`Loaded ${nodes.length} nodes and ${edges.length} edges for trip ${tripId}`)
            console.log(`Current yNodes length: ${yNodes.length}, yEdges length: ${yEdges.length}`)

            // IMPORTANT: Always initialize on first load, even if arrays have data from previous session
            // Clear any existing data first
            if (yNodes.length > 0) {
                yNodes.delete(0, yNodes.length)
            }
            if (yEdges.length > 0) {
                yEdges.delete(0, yEdges.length)
            }

            // Push nodes and edges from database
            if (nodes.length > 0) {
                console.log(`Pushing ${nodes.length} nodes to Yjs`)
                nodes.forEach((node) => yNodes.push([node]))
            }
            if (edges.length > 0) {
                console.log(`Pushing ${edges.length} edges to Yjs`)
                edges.forEach((edge) => yEdges.push([edge]))
            }

            console.log(`After load: yNodes length: ${yNodes.length}, yEdges length: ${yEdges.length}`)
        }

        return data.document
    },

    /**
     * This is called whenever the document changes
     * Use this to persist changes back to your database
     */
    onChange: async (data) => {
        const tripId = data.documentName
        const yDoc = data.document

        // Get the current state from Yjs
        const yNodes = yDoc.getArray("nodes")
        const yEdges = yDoc.getArray("edges")

        // Convert to plain arrays
        const nodes = yNodes.toArray() as Node[]
        const edges = yEdges.toArray() as Edge[]

        console.log(`Change detected for trip ${tripId}: ${nodes.length} nodes, ${edges.length} edges`)

        if (nodes.length > 0) {
            const expenseNodes = convertReactFlowToExpenseNodes(nodes, edges)

            // Save to database
            const trip = await Trip.findById(tripId)
            if (trip) {
                trip.nodes = expenseNodes
                await trip.saveNodes()
                console.log(`Saved changes for trip: ${tripId}`)
            }
        }
    },
})

/**
 * Converts your ExpenseNode hierarchy to flat ReactFlow nodes and edges
 * This matches your buildTreeNodes function but WITHOUT UI-specific stuff like:
 * - placeholder nodes
 * - edge animations
 * - edge styling
 */
function convertExpenseNodesToReactFlow(expenseNodes: ExpenseNode[]) {
    const nodes: Node[] = []
    const edges: Edge[] = []

    function traverse(node: ExpenseNode, parentId?: string) {
        // Create a ReactFlow node from ExpenseNode - matching your structure
        nodes.push({
            id: node.id,
            type: "expense", // matches your node type
            position: { x: 0, y: 0 }, // position will be calculated by dagre on frontend
            data: {
                // Store the full ExpenseNode data
                ...node,
                children: [], // Don't include children in data, use edges instead
            },
        })

        // Create edge from parent to this node - matching your edge structure
        if (parentId) {
            edges.push({
                id: `edge_${parentId}-${node.id}`, // matches your edge ID format
                source: parentId,
                target: node.id,
                // DON'T include: type, animated, style - those are UI concerns handled on frontend
            })
        }

        // Traverse children recursively
        if (Array.isArray(node.children) && node.children.length > 0) {
            node.children.forEach((child: ExpenseNode) => traverse(child, node.id))
        }
    }

    expenseNodes.forEach((node) => traverse(node))

    return { nodes, edges }
}

/**
 * Converts flat ReactFlow nodes and edges back to ExpenseNode hierarchy
 * This is the inverse of convertExpenseNodesToReactFlow
 */
function convertReactFlowToExpenseNodes(nodes: Node[], edges: Edge[]): ExpenseNode[] {
    // Filter out placeholder nodes (they're UI-only, not stored in DB)
    const realNodes = nodes.filter((node) => node.type !== "placeholder")
    const realEdges = edges.filter((edge) => !edge.id.includes("placeholder"))

    // Build a map of node id to node
    const nodeMap = new Map<string, ExpenseNode>()
    realNodes.forEach((node) => {
        nodeMap.set(node.id, {
            ...(node.data as ExpenseNode),
            id: node.id,
            children: [],
        })
    })

    // Build parent-child relationships from edges
    realEdges.forEach((edge) => {
        const parent = nodeMap.get(edge.source)
        const child = nodeMap.get(edge.target)
        if (parent && child) {
            parent.children.push(child)
        }
    })

    // Find root nodes (nodes with no incoming edges)
    const targetIds = new Set(realEdges.map((e: Edge) => e.target))
    const rootNodes = Array.from(nodeMap.values()).filter((node) => !targetIds.has(node.id))

    return rootNodes
}

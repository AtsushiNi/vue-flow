import dagre from '@dagrejs/dagre'
import { Position } from '@vue-flow/core'
import type { Node, Edge } from '@vue-flow/core'

/**
 * グラフレイアウトを計算するComposable
 */
export function useLayout() {
  function layout(nodes: Node[], edges: Edge[]) {
    const dagreGraph = new dagre.graphlib.Graph()
    dagreGraph.setDefaultEdgeLabel(() => ({}))
    
    dagreGraph.setGraph({ rankdir: 'TB' })

    nodes.forEach(node => {
      dagreGraph.setNode(node.id, {
        width: 150,
        height: 50
      })
    })

    edges.forEach(edge => {
      dagreGraph.setEdge(edge.source, edge.target)
    })

    dagre.layout(dagreGraph)

    return nodes.map(node => {
      const nodeWithPosition = dagreGraph.node(node.id)
      return {
        ...node,
        targetPosition: Position.Top,
        sourcePosition: Position.Bottom,
        position: { x: nodeWithPosition.x, y: nodeWithPosition.y }
      }
    })
  }

  return { layout }
}

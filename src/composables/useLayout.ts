import dagre from '@dagrejs/dagre'
import { Position } from '@vue-flow/core'
import type { Node, Edge } from '@vue-flow/core'

interface Column {
  name: string
  type: string
  primaryKey?: boolean
}

/**
 * グラフレイアウトを計算するComposable
 */
export function useLayout() {
  function layout(nodes: Node[], edges: Edge[]) {
    const dagreGraph = new dagre.graphlib.Graph()
    dagreGraph.setDefaultEdgeLabel(() => ({}))
    
    dagreGraph.setGraph({ rankdir: 'TB' })

    // nodeの大きさを設定
    nodes.forEach(node => {
      // ノードの内容に基づいて動的にサイズを計算
      const columnCount = node.data?.columns?.length || 0
      const hasNonPkColumns = node.data?.columns?.some((col: Column) => !col.primaryKey)
      
      // 基本サイズ + カラム数に応じた追加高さ
      const baseWidth = 200
      const baseHeight = 60
      const perColumnHeight = 25
      
      // PKカラム + 非PKカラム（表示されている場合）
      const visibleColumns = (node.data?.primaryKeys?.length || 0) + 
        (hasNonPkColumns ? (columnCount - (node.data?.primaryKeys?.length || 0)) : 0)
      
      dagreGraph.setNode(node.id, {
        width: baseWidth,
        height: baseHeight + (visibleColumns * perColumnHeight)
      })
    })

    // edgeを設定
    edges.forEach(edge => {
      dagreGraph.setEdge(edge.source, edge.target)
    })

    // レイアウトを計算
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

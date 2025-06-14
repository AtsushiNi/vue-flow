<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { MiniMap } from '@vue-flow/minimap'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/controls/dist/style.css'
import '@vue-flow/minimap/dist/style.css'

import { useLayout } from './composables/useLayout'
import Sidebar from './components/Sidebar.vue'
import TableNode from './components/TableNode.vue'
import type { Table } from './types/tables'

import tableData from './assets/tables.json'

// 初期データ設定
const tables = tableData.groups.flatMap(g => g.tables)
const { nodes: initialNodes, edges: initialEdges } = generateFlowElements(tables)

const nodes = ref<any[]>(initialNodes)
const edges = ref<any[]>(initialEdges)

console.log('Nodes with primaryKeys:', initialNodes.map(n => ({
  id: n.id,
  primaryKeys: n.data.primaryKeys
})))

// VueFlowの設定
const { 
  fitView,
  nodesConnectable 
} = useVueFlow()
nodesConnectable.value = false
const { layout } = useLayout()
async function layoutGraph() {
  nodes.value = layout(nodes.value, edges.value)

  nextTick(() => {
    fitView()
  })
}

// tablesからVueFlowのnodesとedgesを生成
function generateFlowElements(tables: Table[]) {
  // テーブルノードを生成
  const nodes = tables.map(table => {
    return {
      id: table.name,
      position: { x: 0, y: 0 },
      type: 'table',
      data: { 
        label: table.name,
        primaryKeys: table.columns
          .filter(col => col.primaryKey)
          .map(col => col.name),
        columns: table.columns
      }
    }
  })
  console.log(nodes)

  // edges(テーブル間の関係)を抽出
  const edges: any[] = []
  for (const targetTable of tables) {
    for (const sourceTable of tables) {
      if (targetTable === sourceTable) {
        continue
      }
      // targetTableがsourceTableのPK全てを持つ場合、targetTableはsourceTableの子
      const sourceTablePKs = sourceTable.columns
        .filter(column => column.primaryKey === true)
        .map(column => column.name)
      const oyako = sourceTablePKs.every(pk => 
        targetTable.columns.some(col => col.name === pk)
      )
      if (oyako) {
        edges.push({
          id: `e${sourceTable.name}-${targetTable.name}`,
          source: sourceTable.name,
          target: targetTable.name,
          data: { 
            type: 'reference'
          }
        })
      }
    }
  }

  return { nodes, edges }
}

// サイドバーで表示するテーブルを変更した時のイベントハンドラ
function onNodeSelected(val: string[]): void {
  const selectedTables = tableData.groups.flatMap(g => g.tables).filter(table => val.includes("table-" + table.name))
  const { nodes: selectedNodes, edges: selectedEdges } = generateFlowElements(selectedTables)
  
  nodes.value = selectedNodes
  edges.value = selectedEdges
  
  // 選択ノードに対してレイアウトを適用
  if (selectedNodes.length > 0) {
    layoutGraph()
  }
}
</script>

<template>
  <v-app>
    <Sidebar 
      :table-data="tableData"
      @node-selected="onNodeSelected"
    />

    <v-main>
      <v-container fluid class="fill-height">
        <VueFlow :nodes="nodes" :edges="edges" @nodes-initialized="layoutGraph()" style="width: 100%; height: 100%">
          <Background />
          <MiniMap />
          <template #node-table="nodeProps">
            <TableNode v-bind="nodeProps" />
          </template>
        </VueFlow>
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
</style>

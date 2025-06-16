<script setup lang="ts">
import { ref, nextTick } from "vue";
import { VueFlow, useVueFlow, type Edge, type Node } from "@vue-flow/core";
import { Background } from "@vue-flow/background";
import { MiniMap } from "@vue-flow/minimap";
import "@vue-flow/core/dist/style.css";
import "@vue-flow/core/dist/theme-default.css";
import "@vue-flow/controls/dist/style.css";
import "@vue-flow/minimap/dist/style.css";

import { useLayout } from "./composables/useLayout";
import { calcRelatedTables } from "./composables/useShowRelations";
import Sidebar from "./components/Sidebar.vue";
import TableNode from "./components/TableNode.vue";
import type { Table } from "./types/tables";

import tableData from "./assets/tables.json";

// 初期データ設定
const tables = tableData.groups.flatMap((g) => g.tables);
const { nodes: initialNodes, edges: initialEdges } =
  generateFlowElements(tables);

const nodes = ref<any[]>(initialNodes);
const edges = ref<any[]>(initialEdges);
const { setEdges, setNodes } = useVueFlow();
const highlightedTableName = ref<string>("");

// 表示中のテーブルリスト
const selectedTables = ref<Table[]>(
  tableData.groups.flatMap(g => 
    g.tables
  )
);

// VueFlowの設定
const { fitView, nodesConnectable } = useVueFlow();
nodesConnectable.value = false;
const { layout } = useLayout();
async function layoutGraph() {
  nodes.value = layout(nodes.value, edges.value);

  nextTick(() => {
    fitView();
  });
}

// tablesからVueFlowのnodesとedgesを生成
function generateFlowElements(tables: Table[]) {
  // テーブルノードを生成
  const nodes = tables.map((table) => {
    return {
      id: table.name,
      position: { x: 0, y: 0 },
      type: "table",
      data: {
        label: table.name,
        primaryKeys: table.columns
          .filter((col) => col.primaryKey)
          .map((col) => col.name),
        columns: table.columns,
      },
    };
  });

  // edges(テーブル間の関係)を抽出
  const edges: any[] = [];
  for (const targetTable of tables) {
    for (const sourceTable of tables) {
      if (targetTable === sourceTable) {
        continue;
      }
      // targetTableがsourceTableのPK全てを持つ場合、targetTableはsourceTableの子
      const sourceTablePKs = sourceTable.columns
        .filter((column) => column.primaryKey === true)
        .map((column) => column.name);
      const oyako = sourceTablePKs.every((pk) =>
        targetTable.columns.some((col) => col.name === pk)
      );
      if (oyako) {
        edges.push({
          id: `e${sourceTable.name}-${targetTable.name}`,
          source: sourceTable.name,
          target: targetTable.name,
          data: {
            type: "reference",
          },
        });
      }
    }
  }

  return { nodes, edges };
}

// サイドバーで表示するテーブルを変更した時のイベントハンドラ
function onNodeSelected(val: string[]): void {
  const selectedTableNames = val.filter(id => id.startsWith('table-')).map(id => id.replace('table-', ''));
  // 選択されたテーブル名に一致するテーブルのみを抽出
  const newSelectedTables = tableData.groups
    .flatMap(g => g.tables)
    .filter(table => selectedTableNames.includes(table.name));

  selectedTables.value = newSelectedTables;

  // nodes, edgesを更新
  const { nodes: selectedNodes, edges: selectedEdges } =
    generateFlowElements(newSelectedTables);

  nodes.value = selectedNodes;
  edges.value = selectedEdges;

  // 選択ノードに対してレイアウトを適用
  if (selectedNodes.length > 0) {
    layoutGraph();
  }
}

// 特定のテーブルと紐づく他のテーブルを全て表示する
function showRelations(tableName: string) {
  // 関連テーブルを含むノードを取得
  const addedTables = calcRelatedTables(tableData, tableName);
  
  // 選択状態を更新 (重複を避けるためSetを使用)
  const newSelectedTables = new Set([
    ...selectedTables.value,
    ...addedTables
  ]);
  selectedTables.value = Array.from(newSelectedTables);
  
  // nodesとedgesを更新
  const { nodes: selectedNodes, edges: selectedEdges } =
    generateFlowElements(Array.from(newSelectedTables));

  nodes.value = selectedNodes;
  edges.value = selectedEdges;

  // 選択ノードに対してレイアウトを適用
  if (selectedNodes.length > 0) {
    layoutGraph();
  }
}

// 特定のテーブルとの紐付きを全てハイライトする
function highlightRelations(tableName: string) {
  // 関連するノードのIDを収集
  const relatedNodeIds = new Set<string>();
  edges.value.forEach(edge => {
    if (edge.source === tableName) relatedNodeIds.add(edge.target);
    if (edge.target === tableName) relatedNodeIds.add(edge.source);
  });

  // ノードにスタイルを適用
  const newNodes = nodes.value.map(node => {
    const isRelated = node.id === tableName || relatedNodeIds.has(node.id);
    return {
      ...node,
      style: isRelated ? {
        border: "2px solid rgba(51,153,255,0.7)",
        boxShadow: "0 0 8px rgba(51,153,255,0.5)",
        animation: "pulse 1s infinite"
      } : {}
    };
  });

  // エッジにスタイルを適用
  const newEdges = edges.value.map(edge => {
    const isRelated = edge.source === tableName || edge.target === tableName;
    return {
      ...edge,
      style: isRelated ? {
        stroke: "rgba(51,153,255,0.7)",
        strokeWidth: 3,
        animation: "pulse 1s infinite",
        filter: "drop-shadow(0 0 8px rgba(51,153,255,0.5))"
      } : { stroke: "" }
    };
  });

  setEdges(newEdges);
  setNodes(newNodes);
  highlightedTableName.value = tableName;
}
</script>

<template>
  <v-app>
    <Sidebar 
      :table-data="tableData" 
      :selected-tables="selectedTables"
      @node-selected="onNodeSelected" 
    />

    <v-main>
      <v-container fluid class="fill-height">
          <VueFlow
            :nodes="nodes"
            :edges="edges"
            @nodes-initialized="layoutGraph()"
            style="width: 100%; height: 100%"
          >
          <Background />
          <MiniMap />
          <template #node-table="nodeProps">
            <TableNode
              v-bind="nodeProps"
              @show-relations="showRelations"
              @highlight-relations="highlightRelations"
            />
          </template>
        </VueFlow>
      </v-container>
    </v-main>
  </v-app>
</template>

<style>
@keyframes pulse {
  0% {
    stroke-opacity: 0.7;
    stroke-width: 3;
  }
  50% {
    stroke-opacity: 1;
    stroke-width: 4;
    filter: "drop-shadow(0 0 12px #3399ff)"
  }
  100% {
    stroke-opacity: 0.7;
    stroke-width: 3;
  }
}
</style>

<script setup lang="ts">
import { ref, shallowRef } from 'vue'

import type { Table } from '../types/tables'

interface MenuItem {
  id: string;
  title: string;
  children?: MenuItem[];
  [key: string]: any;
}

const props = defineProps<{
  tableData: {
    groups: {
      name: string;
      tables: Table[];
    }[];
  }
}>();

const emit = defineEmits(['nodeSelected']);

// サイドバーのリスト項目
const menuItems = ref<MenuItem[]>(props.tableData.groups.map((group: { name: string; tables: Table[] }) => ({
  id: `group-${group.name}`,
  title: group.name,
  children: group.tables.map((table: Table) => ({
    id: `table-${table.name}`,
    title: table.name,
  }))
})))

const open = shallowRef([1, 3]);
const selected = shallowRef<string[]>(
  menuItems.value.flatMap(group => [
    group.id,
    ...(group.children?.map(table => table.id) || [])
  ])
);
const search = shallowRef<string | undefined>(undefined);

// サイドバーで表示するテーブルを変更した時のイベントハンドラ
function onNodeSelected(val: unknown): void {
  if (Array.isArray(val) && val.every(id => typeof id === 'string')) {
    emit('nodeSelected', val);
  }
}
</script>

<template>
  <v-navigation-drawer location="right" width="300" permanent>
    <v-sheet class="pa-4" color="surface-variant">
      <v-text-field
        v-model="search"
        clear-icon="mdi-close-circle-outline"
        label="Search Table"
        variant="solo"
        clearable
        flat
        hide-details
      ></v-text-field>
    </v-sheet>

    <v-divider></v-divider>
    <v-treeview
      class="overflow-y-auto"
      select-strategy="classic"
      style="height: calc(100% - 64px)"
      v-model:opened="open"
      v-model:selected="selected"
      :items="menuItems"
      :search="search"
      item-value="id"
      open-on-click
      selectable
      @update:selected="onNodeSelected"
    >
      <template v-slot:prepend="{ item: treeItem }">
        <v-icon
          v-if="(treeItem as MenuItem).children"
          icon="mdi-folder"
        ></v-icon>
        <v-icon
          v-else
          icon="mdi-file"
        ></v-icon>
      </template>
    </v-treeview>
  </v-navigation-drawer>
</template>

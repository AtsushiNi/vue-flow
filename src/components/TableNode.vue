<script setup lang="ts">
import type { NodeProps } from "@vue-flow/core";
import { Handle, Position } from "@vue-flow/core";
import { ref, computed } from "vue";

interface Column {
  name: string;
  type: string;
  primaryKey?: boolean;
}

const props = defineProps<
  NodeProps<{
    label: string;
    primaryKeys?: string[];
    columns?: Column[];
  }>
>();

const showNonPkProperties = ref(false);
const nonPkColumns = computed(() => 
  props.data.columns?.filter(col => !col.primaryKey) || []
);
const pkColumns = computed(() => 
  props.data.columns?.filter(col => col.primaryKey) || []
);
</script>

<template>
  <div
    style="
      padding: 10px;
      background: white;
      border: 1px solid #ddd;
      border-radius: 5px;
      position: relative;
    "
    @click="showNonPkProperties = !showNonPkProperties"
  >
    <Handle type="target" :position="Position.Top" />
    <Handle type="source" :position="Position.Bottom" />

    <div style="font-weight: bold; margin-bottom: 5px">
      {{ props.data.label }}
    </div>
    <v-table density="compact" style="margin-top: 10px; font-size: 12px">
      <tbody>
        <tr
          v-for="col in pkColumns"
          :key="col.name"
          style="color: #1a73e8"
        >
          <td style="text-align: left">{{ col.name }}</td>
          <td style="text-align: left">{{ col.type }}</td>
        </tr>
        <template v-if="showNonPkProperties">
          <tr
            v-for="col in nonPkColumns"
            :key="col.name"
            style="color: #666"
          >
            <td style="text-align: left">{{ col.name }}</td>
            <td style="text-align: left">{{ col.type }}</td>
          </tr>
        </template>
      </tbody>
    </v-table>
  </div>
</template>

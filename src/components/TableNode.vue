<script setup lang="ts">
import type { NodeProps } from "@vue-flow/core";
import { Handle, Position } from "@vue-flow/core";
import { ref, computed } from "vue";


function showRelations() {
  emit('show-relations', props.data.label);
}

interface Column {
  name: string;
  type: string;
  primaryKey?: boolean;
}

interface Relation {
  id: string;
  targetTable: string;
  type: string;
}

const props = defineProps<
  NodeProps<{
    label: string;
    primaryKeys?: string[];
    columns?: Column[];
    relations?: Relation[];
  }>
>();

const emit = defineEmits(['show-relations']);

const showNonPkProperties = ref(false);
const nonPkColumns = computed(() => 
  props.data.columns?.filter(col => !col.primaryKey) || []
);
const pkColumns = computed(() => 
  props.data.columns?.filter(col => col.primaryKey) || []
);

const nodeStyle = computed<Record<string, string>>(() => ({
  padding: '10px',
  background: 'white',
  border: '1px solid #ddd',
  borderRadius: '5px',
  position: 'relative' as const,
  transition: 'all 0.3s ease'
}));
</script>

<template>
  <v-tooltip
    location="top"
    color="#2c3e50"
    text-color="#ecf0f1"
    transition="scale-transition"
    :open-delay="300"
    :close-delay="100"
    :max-width="250"
    :min-width="150"
    :z-index="1000"
    class="custom-tooltip"
    interactive
  >
    <template #activator="{ props: activatorProps }">
      <div
        v-bind="activatorProps"
        :style="nodeStyle"
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
    <div style="padding: 10px; display: flex; flex-direction: column; gap: 10px">
      <div style="font-size: 14px; line-height: 1.4">
        <div style="font-weight: 500; margin-bottom: 5px">テーブル操作</div>
        <div style="font-size: 12px">- クリックでカラム詳細表示</div>
        <div style="font-size: 12px">- 下のボタンでリレーション表示</div>
      </div>
      <v-btn
        size="x-small"
        color="primary"
        variant="tonal"
        @click.stop="showRelations"
        style="margin-top: 5px"
      >
        リレーション表示/非表示
      </v-btn>
    </div>
  </v-tooltip>
</template>

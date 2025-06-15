<script setup lang="ts">
import type { NodeProps } from "@vue-flow/core";
import { Handle, Position } from "@vue-flow/core";
import { ref, computed } from "vue";

function showRelations() {
  emit("show-relations", props.data.label);
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

const emit = defineEmits(["show-relations"]);

const showNonPkProperties = ref(false);
const nonPkColumns = computed(
  () => props.data.columns?.filter((col) => !col.primaryKey) || []
);
const pkColumns = computed(
  () => props.data.columns?.filter((col) => col.primaryKey) || []
);

const nodeStyle = computed<Record<string, string>>(() => ({
  padding: "10px",
  background: "white",
  border: "1px solid #ddd",
  borderRadius: "5px",
  position: "relative" as const,
  transition: "all 0.3s ease",
}));
</script>

<template>
  <v-tooltip
    location="top"
    transition="scale-transition"
    :open-delay="300"
    :close-delay="300"
    :max-width="300"
    :min-width="200"
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
            <tr v-for="col in pkColumns" :key="col.name" style="color: #1a73e8">
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
      <div
        style="
          display: flex;
          flex-direction: column;
          gap: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          background-color: #ffffff;
          border-radius: 8px;
        "
      >
      <v-btn
        size="x-small"
        variant="elevated"
        @click.stop="showRelations"
        style="box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1)"
      >
        リレーション表示
      </v-btn>
    </div>
  </v-tooltip>
</template>

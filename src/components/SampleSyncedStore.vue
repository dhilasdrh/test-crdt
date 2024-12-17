<template>
  <main id="app">
    <div class="h-screen w-screen p-2">
      <div class="space-x-2">
        <button
          class="border-2 bg-gray-100 py-2 px-3 rounded-lg text-sm"
          type="button"
          @click="handleAddNode"
        >
          Add node
        </button>
        <button
          :class="canUndo ? 'opacity-100' : 'opacity-50'"
          class="border bg-gray-100 py-2 px-3 rounded-lg text-sm"
          type="button"
          @click="handleUndo"
        >
          Undo
        </button>
        <button
          :class="canRedo ? 'opacity-100' : 'opacity-50'"
          class="border-2 bg-gray-100 py-2 px-3 rounded-lg text-sm"
          type="button"
          @click="handleRedo"
        >
          Redo
        </button>
      </div>

      <VueFlow
        :pan-on-drag="true"
        :nodes="nodes"
        :edges="edges"
        fit-view-on-init
        :min-zoom="0.2"
        :max-zoom="2"
        :default-viewport="{ zoom: 1 }"
        :connection-radius="30"
        :connection-line-type="ConnectionLineType.SmoothStep"
        :node-extent="{
          range: coordinateExtent,
          padding: 10,
        }"
        :translate-extent="coordinateExtent"
      >
        <Background pattern-color="#aaa" :gap="8" />
        <template #node-custom="props">
          <CustomNode v-bind="props" @updateData="handleUpdateData" />
        </template>
        <template #edge-custom="props">
          <CustomEdge v-bind="props" />
        </template>
      </VueFlow>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, watch, computed, watchEffect, onMounted, onUnmounted } from "vue";
import { connect, disconnect, store, undoManager } from "../store";
import * as Vue from "vue";
import { enableVueBindings } from "@syncedstore/core";
import CustomNode from "./CustomNode.vue";
import CustomEdge from "./CustomEdge.vue";
import {
  ConnectionLineType,
  CoordinateExtent,
  NodeDragEvent,
  useVueFlow,
  VueFlow,
  XYPosition,
} from "@vue-flow/core";
import { Background } from "@vue-flow/background";

enableVueBindings(Vue);

const {
  onNodeDragStop,
  onConnect,
  getSelectedNodes,
  getSelectedEdges,
  setNodes,
  setEdges,
} = useVueFlow();

const coordinateExtent = ref<CoordinateExtent>([
  [-5000, -3000],
  [5000, 3000],
]);

const nodes = computed(() => store.nodes);
const edges = computed(() => store.edges);
const canUndo = ref(false);
const canRedo = ref(false);

const updateUndoRedoState = () => {
  canUndo.value = undoManager.canUndo();
  canRedo.value = undoManager.canRedo();
};

watch(
  nodes,
  (newValue) => {
    setTimeout(() => {
      setNodes(newValue);
    }, 100);
  },
  { deep: true }
);

watch(
  edges,
  (newValue) => {
    setTimeout(() => {
      setEdges(newValue);
    }, 100);
  },
  { deep: true }
);

undoManager.on("stack-item-added", updateUndoRedoState);
undoManager.on("stack-item-popped", updateUndoRedoState);

const handleUndo = () => {
  undoManager.undo();
};

const handleRedo = () => {
  undoManager.redo();
};

const handleAddNode = () => {
  const id = (nodes.value.length + 1).toString();
  const newNode = {
    id,
    position: { x: 0, y: 0 },
    type: "custom",
    data: {
      label: `node ${id}`,
    },
  };
  nodes.value.push(newNode as any);
};

const handleRemoveNode = (nodeId: string) => {
  const nodeIndex = nodes.value.findIndex((node) => node.id === nodeId);
  if (nodeIndex !== -1) {
    nodes.value.splice(nodeIndex, 1);
  }
};

const handleRemoveEdge = (edgeId: string) => {
  const edgeIndex = edges.value.findIndex((edge) => edge.id === edgeId);
  if (edgeIndex !== -1) {
    edges.value.splice(edgeIndex, 1);
  }
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Delete" || event.key === "Backspace") {
    const selectedNodes = getSelectedNodes.value;
    const selectedEdges = getSelectedEdges.value;
    if (selectedNodes.length > 0) {
      handleRemoveNode(selectedNodes[0].id);
    }
    if (selectedEdges.length > 0) {
      handleRemoveEdge(selectedEdges[0].id);
    }
  }
};

onConnect((connection) => {
  const newEdge = {
    id: Date.now().toString(),
    source: connection.source,
    target: connection.target,
    type: "custom",
    sourceHandle: connection.sourceHandle,
    targetHandle: connection.targetHandle,
    style: { stroke: "#123E6B" },
  };
  edges.value.push(newEdge);
});

const handleUpdateData = (nodeId: string, newLabel: string) => {
  const node = nodes.value.find((n) => n.id === nodeId);
  if (node) {
    node.data.label = newLabel;
  }
};

const updateNodePosition = (nodeId: string, position: XYPosition) => {
  const node = nodes.value.find((node) => node.id === nodeId);
  if (node) {
    node.position.x = position.x;
    node.position.y = position.y;
  }
};

onNodeDragStop((event: NodeDragEvent) => {
  updateNodePosition(event.node.id, event.node.position);
});

watchEffect(() => {
  updateUndoRedoState();
});

onMounted(() => {
  connect();
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  disconnect();
});
</script>

<style>
@import "@vue-flow/core/dist/style.css";
@import "@vue-flow/core/dist/theme-default.css";
</style>

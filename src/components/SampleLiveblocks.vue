<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from "vue";
import { LiveList } from "@liveblocks/client";
import { roomId, client } from "../room";
import {
  ConnectionLineType,
  CoordinateExtent,
  GraphEdge,
  NodeDragEvent,
  useVueFlow,
  VueFlow,
} from "@vue-flow/core";
import CustomNode from "./CustomNode.vue";
import CustomEdge from "./CustomEdge.vue";
import { Background } from "@vue-flow/background";

declare global {
  interface Liveblocks {
    Presence: {
      isTyping: boolean;
    };
    Storage: {
      nodes: LiveList<Node>;
      edges: LiveList<Edge>;
    };
  }
}

type Node = {
  id: string;
  type?: string;
  position: {
    x: number;
    y: number;
  };
  width?: number;
  height?: number;
  data: {
    label: string;
  };
};

type Edge = {
  id: string;
  type?: string;
  source?: number | string;
  target?: number | string;
  sourceHandle?: string | undefined | null;
  targetHandle?: string | undefined | null;
  style?: {
    stroke: string;
  };
};

const nodes = ref<Node[]>([]);
const edges = ref<Edge[]>([]);

const coordinateExtent = ref<CoordinateExtent>([
  [-5000, -3000],
  [5000, 3000],
]);

const {
  onNodeDragStop,
  onConnect,
  setNodes,
  getSelectedNodes,
  getSelectedEdges,
} = useVueFlow();

const { room, leave } = client.enterRoom(roomId, {
  initialPresence: { isTyping: false },
  initialStorage: {
    nodes: new LiveList([]),
    edges: new LiveList([]),
  },
});

const { undo, redo, pause, resume } = room.history;

watch(
  nodes,
  (newValue) => {
    setTimeout(() => {
      setNodes(newValue);
    }, 100);
  },
  { deep: true }
);

const getLiveNodes = async () => {
  const { root } = await room.getStorage();
  return root.get("nodes");
};

const getLiveEdges = async () => {
  const { root } = await room.getStorage();
  return root.get("edges");
};

const handleUndo = () => {
  undo();
};

const handleRedo = () => {
  redo();
};

const handleAddNode = () => {
  const id = (nodes.value.length + 1).toString();
  const liveNodes = getLiveNodes();
  liveNodes.then((ln) => {
    ln.push({
      id,
      position: { x: 0, y: 0 },
      type: "custom",
      data: { label: `node ${id}` },
    });
  });
};

onConnect((connection) => {
  const liveEdges = getLiveEdges();
  liveEdges.then((le) => {
    le.push({
      id: Date.now().toString(),
      source: connection.source,
      target: connection.target,
      type: "custom",
      sourceHandle: connection.sourceHandle,
      targetHandle: connection.targetHandle,
      style: { stroke: "#123E6B" },
    });
  });
});

const handleUpdateNode = (id: string, newLabel: string) => {
  const liveNodes = getLiveNodes();
  liveNodes.then((ln) => {
    const node = ln.find((n) => n.id === id);
    if (node) {
      node.data.label = newLabel;
      ln.set(ln.indexOf(node), node);
    }
  });
};

onNodeDragStop((params: NodeDragEvent) => {
  const nodeDragData = params.node;
  const liveNodes = getLiveNodes();
  liveNodes.then((ln) => {
    const node = ln.find((n) => n.id === nodeDragData.id);
    if (node) {
      node.position = {
        x: nodeDragData.position.x,
        y: nodeDragData.position.y,
      };
      ln.set(ln.indexOf(node), node);
    }
  });
});

const handleRemoveNode = (id: string) => {
  const liveNodes = getLiveNodes();
  liveNodes.then((ln) => {
    const nodeIndex = ln.findIndex((n) => n.id === id);
    if (nodeIndex !== -1) {
      ln.delete(nodeIndex);
    }
  });
};

const handleRemoveEdge = (id: string) => {
  const liveEdges = getLiveEdges();
  liveEdges.then((ln) => {
    const nodeIndex = ln.findIndex((n) => n.id === id);
    if (nodeIndex !== -1) {
      ln.delete(nodeIndex);
    }
  });
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

onMounted(async () => {
  const { root } = await room.getStorage();
  const liveNodes = root.get("nodes");
  const liveEdges = root.get("edges");

  nodes.value = [...liveNodes];
  edges.value = [...liveEdges];

  room.subscribe(liveNodes, (node) => {
    nodes.value = [...node];
  });

  room.subscribe(liveEdges, (edge) => {
    edges.value = [...edge];
  });

  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  leave();
});
</script>

<template>
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
        class="border bg-gray-100 py-2 px-3 rounded-lg text-sm"
        type="button"
        @click="handleUndo"
      >
        Undo
      </button>
      <button
        class="border-2 bg-gray-100 py-2 px-3 rounded-lg text-sm"
        type="button"
        @click="handleRedo"
      >
        Redo
      </button>
    </div>
    <Suspense>
      <VueFlow
        :pan-on-drag="true"
        :nodes="nodes"
        :edges="edges as unknown as GraphEdge[]"
        fit-view-on-init
        class="vue-flow-basic-example"
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
          <CustomNode v-bind="props" @updateData="handleUpdateNode" />
        </template>
        <template #edge-custom="props">
          <CustomEdge v-bind="props" />
        </template>
      </VueFlow>
    </Suspense>
  </div>
</template>

<style>
@import "@vue-flow/core/dist/style.css";
@import "@vue-flow/core/dist/theme-default.css";
</style>

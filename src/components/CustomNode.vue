<script lang="ts" setup>
import { ref } from "vue";
import { Handle, NodeProps, Position } from "@vue-flow/core";

const props = defineProps<NodeProps>();
const isEditing = ref(false);
const newData = ref(props.data.label);
const emit = defineEmits(["updateData"]);

const enableEditing = () => {
  isEditing.value = true;
  newData.value = props.data.label;
};

const saveLabel = () => {
  if (newData.value !== props.data.label) {
    emit("updateData", props.id, newData.value);
  }
  isEditing.value = false;
};

const handleBlur = () => {
  saveLabel();
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Enter") {
    saveLabel();
  } else if (event.key === "Escape") {
    isEditing.value = false;
  }
};
</script>

<template>
  <div class="custom-node" @dblclick="enableEditing">
    <div class="text-sm">
      <template v-if="isEditing">
        <input
          type="text"
          v-model="newData"
          @blur="handleBlur"
          @keydown="handleKeydown"
          class="border rounded p-1 text-sm"
        />
      </template>
      <template v-else>
        <div class="p-1 text-xs">{{ props.data.label }}</div>
        <div class="p-1 text-xs">{{ props.position }}</div>
      </template>
    </div>
    <Handle type="source" :position="Position.Top" />
    <Handle type="source" :position="Position.Left" />
    <Handle type="source" :position="Position.Right" />
    <Handle type="source" :position="Position.Bottom" />
  </div>
</template>

<style>
.custom-node {
  min-width: 150px;
  gap: 4px;
  padding: 4px;
  height: fit-content;
  background: white;
  border: 1px solid black;
  border-radius: 4px;
  cursor: pointer;
}
</style>

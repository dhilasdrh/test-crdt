<script setup>
import { ref } from "vue";
import SampleLiveblocks from "./components/SampleLiveblocks.vue";
import SampleSyncedStore from "./components/SampleSyncedStore.vue";

const selectedOption = ref("SyncedStore");
</script>

<template>
  <div class="p-2">
    <select class="border p-2" v-model="selectedOption">
      <option value="SyncedStore">Example SyncedStore</option>
      <option value="Liveblocks">Example Liveblocks</option>
    </select>
  </div>

  <div>
    <SampleSyncedStore v-if="selectedOption === 'SyncedStore'" />
    <SampleLiveblocks v-else />
  </div>
</template>

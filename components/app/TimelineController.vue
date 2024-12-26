<script setup lang="ts">
const { initializedGsap, playGsapTimeline, pauseGsapTimeline, paused } = useGsap();
const { updateMainNodeState } = useKonva();
</script>

<template>
  <div v-if="initializedGsap" class="flex items-center justify-center">
    <UButton
      v-if="paused"
      class="rounded-full"
      icon="i-akar-icons-triangle-right-fill"
      size="sm"
      square
      variant="soft"
      @click="playGsapTimeline"
    />
    <UButton
      v-else
      class="rounded-full"
      icon="i-ic-round-pause"
      size="sm"
      square
      variant="soft"
      @click="pauseGsapTimeline(updateMainNodeState)"
    />
  </div>
</template>

<style scoped></style>

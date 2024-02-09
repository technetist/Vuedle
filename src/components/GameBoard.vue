<script setup lang="ts">
import { VICTORY_MESSAGE } from '@/settings'

defineProps<{
  word: string
}>()
</script>

<template>
  <p>{{ VICTORY_MESSAGE }}</p>
  <input type="text" />
</template>

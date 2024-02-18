<script setup lang="ts">
import { VICTORY_MESSAGE, DEFEAT_MESSAGE } from '@/settings'
import { computed, ref } from 'vue'

const props = defineProps<{
  word: string
}>()

const currentGuess = ref('')

const isWinner = ref(false)

const isGameOver = ref(false)

const endGameMessage = computed(() => {
  return isWinner.value ? VICTORY_MESSAGE : DEFEAT_MESSAGE
})

const handleGuess = () => {
  if (currentGuess.value === '' || currentGuess.value.length < props.word.length) return

  if (isGameOver.value) return

  if (currentGuess.value === props.word) {
    isWinner.value = true
    isGameOver.value = true
  } else {
    isWinner.value = false
    isGameOver.value = true
  }
}
</script>

<template>
  <p v-if="isGameOver" v-text="endGameMessage"></p>
  <input type="text" v-model="currentGuess" @keydown.enter="handleGuess" />
</template>

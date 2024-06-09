<script setup lang="ts">
import { VICTORY_MESSAGE, DEFEAT_MESSAGE } from '@/settings'
import { computed, ref } from 'vue'
import englishWords from '@/word-list.json'

const props = defineProps({
  word: {
    type: String,
    validator: (wordGiven: string) => wordGiven.length === 5 &&
      /^[A-Z]*$/.test(wordGiven) &&
      englishWords.data.findIndex(word => wordGiven.toLowerCase() === word.toLowerCase()) > -1,
    required: true
  }
})

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

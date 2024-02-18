import { mount, VueWrapper } from '@vue/test-utils'
import GameBoard from '../GameBoard.vue'
import { expect } from '@playwright/test'
import { VICTORY_MESSAGE, DEFEAT_MESSAGE } from '@/settings'
import { beforeEach } from 'vitest'

describe('GameBoard', () => {
  let wrapper: ReturnType<typeof mount>

  beforeEach(async () => {
    wrapper = mount(GameBoard, { props: { word: 'TESTS' } })
  })

  const playerSubmitsGuess = async (guess: string) => {
    const guessInput = wrapper.find('input[type=text]')
    await guessInput.setValue(guess)
    await guessInput.trigger('keydown.enter')
  }

  test('a victory message is rendered when the user guesses the word of the day ', async () => {
    await playerSubmitsGuess('TESTS')

    expect(wrapper.text()).toContain(VICTORY_MESSAGE)
  })

  test('a defeat message is rendered when the user fails to guess the word of the day', async () => {
    await playerSubmitsGuess('LOSES')

    expect(wrapper.text()).toContain(DEFEAT_MESSAGE)
  })

  test('no message is rendered when the user has not yet guessed the word of the day', async () => {
    expect(wrapper.text()).not.toContain(VICTORY_MESSAGE)
    expect(wrapper.text()).not.toContain(DEFEAT_MESSAGE)
  })
})

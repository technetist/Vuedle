import { mount } from '@vue/test-utils'
import GameBoard from '../GameBoard.vue'
import { expect } from '@playwright/test'
import { VICTORY_MESSAGE } from '@/settings'

describe('GameBoard', () => {
  test('a victory message is rendered when the user guesses the word of the day ', async () => {
    const wrapper = mount(GameBoard, { props: { word: 'TESTS' } })

    const guessInput = wrapper.find('input[type=text]')
    await guessInput.setValue('TESTS')
    await guessInput.trigger('keydown.enter')

    expect(wrapper.text()).toContain(VICTORY_MESSAGE)
  })
})

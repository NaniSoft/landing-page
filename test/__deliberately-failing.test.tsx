import { describe, expect, it } from 'vitest'
describe('a deliberately failing check', () => {
  it('fails, to prove a red check stops the deploy', () => {
    expect('this deployment').toBe('not shipped')
  })
})

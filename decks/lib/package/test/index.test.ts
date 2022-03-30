import { Option, matchEnum } from '..'

const s = Option.Some(3)
const n = Option.None<number>()

test('unwrap', () => {
  expect(s.unwrap()).toBe(3)
  expect(() => {
    n.unwrap()
  }).toThrow(Error)
})

test('match', () => {
  const result = matchEnum(s)({
    Some: (value) => value * 2,
    _: () => {}
  })
  expect(result).toBe(6)

  const result2 = matchEnum(n)({
    Some: (value) => value * 2,
    None: () => { return 233 }
  })
  expect(result2).toBe(233)
})

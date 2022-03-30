import hello from '..'

test('export default string', () => {
  expect(hello).toBe('hello rollup typescript')
})

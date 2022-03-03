const p1 = Promise.resolve()
const p2 = p1.then(() => {
  console.log(0)
  const p3 = Promise.resolve(4)
  return p3
})
const p4 = p2.then(res => {
  console.log(res)
})

const p5 = Promise.resolve()
const p6 = p5.then(() => {
  console.log(1)
})
const p7 = p6.then(() => {
  console.log(2)
})
const p8 = p7.then(() => {
  console.log(3)
})
const p9 = p8.then(() => {
  console.log(5)
})
const p10 = p9.then(() => {
  console.log(6)
})

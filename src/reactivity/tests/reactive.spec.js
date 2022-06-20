import { reactive } from "../reactive";

describe("reactive",() => {
  it("happy path", () => {
  const jack = { age: 10 }
  const reactiveJack = reactive(jack)
  // jack和reactiveJack不是同一个对象
  expect(reactiveJack).not.toBe(jack)
  // 可以取到对应的值
  expect(reactiveJack.age).toBe(10)
})
})
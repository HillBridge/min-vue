import { isReadonly, shallowReadonly } from "../reactive"

describe("shallowReadonly", () => { 
  it("happy path", () => {
    const obj = shallowReadonly({ foo: {bar: 1}})
    expect(isReadonly(obj)).toBe(true)
    expect(isReadonly(obj.foo)).toBe(false)
  })
  it("when call set", () => {
    const original = {
      age: 10
    }
    console.warn = jest.fn()
    const obj = shallowReadonly(original)
    obj.age = 11
    expect(console.warn).toBeCalled()
  })
})
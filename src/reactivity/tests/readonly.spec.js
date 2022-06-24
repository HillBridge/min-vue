import { readonly, isReadonly } from "../reactive"

describe("readonly", () => {
  it("when call get", () => {
    const original = {
      foo: 1
    }
    const obj = readonly(original)
    expect(obj).not.toBe(original)
    expect(obj.foo).toBe(1)
  })

  it("when call set", () => {
    const original = {
      age: 10
    }
    console.warn = jest.fn()
    const obj = readonly(original)
    obj.age = 11
    expect(console.warn).toBeCalled()
  })

  it("isReadonly", () => {
    const jack = { age: 10 }
    const reactiveJack = readonly(jack)
    expect(isReadonly(reactiveJack)).toBe(true)
    expect(isReadonly(jack)).toBe(false)
  })
})
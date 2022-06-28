import { ref, isRef, unRef } from "../ref";
import { effect } from "../effect";
import { reactive } from "../reactive";

describe("ref", () => {
  it("happy path", () => {
    const a = ref(1)
    expect(a.value).toBe(1)
  })

  it("ref should be reactive", () => {
    const a = ref(1)
    let dump;
    let call = 0;
    effect(() => {
      call++
      dump = a.value
    })
    expect(call).toBe(1)
    expect(dump).toBe(1)
    a.value = 2
    expect(call).toBe(2)
    expect(dump).toBe(2)

    // 重复赋值
    a.value = 2
    expect(call).toBe(2)
    expect(dump).toBe(2)
  })

  it("can be an object", () => {
    const a = ref({
      count: 1
    })
    let dump;
    effect(() => {
      dump = a.value.count
    })
    expect(dump).toBe(1)
    a.value.count++
    expect(dump).toBe(2)
  })

  it("isRef", () => {
    const a = ref(1)
    const foo = reactive({foo:1})
    expect(isRef(a)).toBe(true)
    expect(isRef(1)).toBe(false)
    expect(isRef(foo)).toBe(false)
  })

  it("unRef", () => {
    const a = ref(1)
    expect(unRef(a)).toBe(1)
    expect(unRef(2)).toBe(2)
  })

})
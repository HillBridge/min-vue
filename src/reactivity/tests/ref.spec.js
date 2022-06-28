import { ref } from "../ref";
import { effect } from "../effect";

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

})
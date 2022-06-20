
import { reactive } from "../reactive";
import { effect } from "../effect";

describe("effect", () => {
  it("happy path", () => {
    const user = reactive({
      age: 10
    })

    let nextAge;
    effect(() => {
      nextAge = user.age + 1
    })

    expect(nextAge).toBe(11)

    // update
    user.age++
    expect(nextAge).toBe(12)
  })

  it("should return runner when call effect", () => {
    let foo = 10
    const runner = effect(()=> {
      foo++
      return "foo"
    })

    expect(foo).toBe(11)
    const res = runner()
    expect(foo).toBe(12)
    expect(res).toBe("foo")
  })

  it("scheduler", () => {
    // 1. effect传入第二个参数scheduler
    // 2. 第一次执行的时候还是执行fn
    // 3. 当调用trigger的时候(undate响应式数据的时候)，触发scheduler, 不执行fn
    // 4. 当执行run的时候，执行fn

    let dummy;
    let run;
    const scheduler = jest.fn(() => {
      run = runner;
    })
    const obj = reactive({foo:1})
    const runner = effect(()=>{
      dummy = obj.foo
    },{ scheduler })
    
    expect(scheduler).not.toHaveBeenCalled()
    expect(dummy).toBe(1)
    // should be called on first trigger
    obj.foo++
    expect(scheduler).toHaveBeenCalledTimes(1)
    // should not run yet
    expect(dummy).toBe(1)
    // manually run
    run()
    // should have run
    expect(dummy).toBe(2)
  })
})
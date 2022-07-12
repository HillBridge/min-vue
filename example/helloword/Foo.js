import { h } from "../../lib/guide-min-vue.esm.js"

export const Foo = {
  setup(props, { emit }){
    // 1. 接收props
    console.log("foo-----",props)

    // 3. shadow readonly
    props.count++

    const emitAdd = () => {
      console.log("emit-add")
      emit("add",1,2)
    }
    return {
      emitAdd
    }
  },
  render(){
    // 2. 获取props
    const btn = h("button",{onClick: this.emitAdd },"emitAdd")
    const foo = h("div",{},"foo:"+this.count)
    return h("div",{},[foo,btn])
  }
}
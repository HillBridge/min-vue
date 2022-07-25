import { h, ref } from "../../lib/guide-min-vue.esm.js";

// 视图在显示之前都是虚拟节点，也就是object
// 更新逻辑就是两个虚拟节点的对比
export const App = {
  name: "App",
  setup(){
    const count = ref(0)

    const onClick = () => {
      count.value++
    }

    return {
      count,
      onClick
    }
  },
  render(){
    return h(
      "div",
      {},
      [
        h("div",{}, "count:"+this.count),
        h("button", {
          onClick: this.onClick
        }, "click")
      ]
    )
  }
}
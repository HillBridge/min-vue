import { h, ref, getCurrentInstance, nextTick } from "../../lib/guide-min-vue.esm.js";
export const App = {
  setup(){
    const instance = getCurrentInstance()
    const count = ref(1)

    function onClick() {
      for (let i=0; i< 100; i++) {
        count.value = i
      }

      nextTick(() => {
        console.log("nextTick",instance)
      })
    }
    return {
      count,
      onClick
    }
  },
  render(){
    const button = h("button",{onClick: this.onClick}, "update")
    const p = h("p", {}, "count:"+this.count)
    return h(
      "div",
      {},
      [button, p]
    )
  }
}
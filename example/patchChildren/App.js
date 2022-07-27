import { h, ref } from "../../lib/guide-min-vue.esm.js";
import ArrayToText from "./ArrayToText.js";
import TextToText from "./TextToText.js";
import TextToArray from "./TextToArray.js";

// 视图在显示之前都是虚拟节点，也就是object
// 更新逻辑就是两个虚拟节点的对比
export const App = {
  name: "App",
  setup(){},
  render(){
    return h(
      "div",
      {
        id: "root",
      },
      [
        h("div",{}, "主页"),
        // 老的是array,新的是text
        //h(ArrayToText),
        // 老的是text, 新的也是text
        // h(TextToText)
        // 老的是text, 新的是array
        h(TextToArray)
      ]
    )
  }
}
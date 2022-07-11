import { h } from "../../lib/guide-min-vue.esm.js";
import { Foo } from "./Foo.js";
window.self = null
export const App = {
  render(){
    window.self = this
    // setupState
    // $el
    // $data
    // return h("div", {id:"root", class: ["root"], onClick: () =>{ console.log(("click"))}, onMousedown: ()=> { console.log("mousedown")} }, "hi,"+this.msg)
    // return h("div", {id:"root", class: ["root"]},[
    //   h("p",{class: "red"}, "hi~~~"),
    //   h("p",{class: "blue"}, "min-vue")
    // ])
    return h("div",{}, [
      h("p",{},"hi,"+this.msg),
      h(Foo, {count: 1})
    ])
  },
  setup(){
    return {
      msg: "hello, min-vue"
    }
  }
}
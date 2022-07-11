import { h } from "../../lib/guide-min-vue.esm.js";
window.self = null
export const App = {
  render(){
    window.self = this
    // setupState
    // $el
    // $data
    return h("div", {id:"root", class: ["root"], onClick: () =>{ console.log(("click"))}, onMousedown: ()=> { console.log("mousedown")} }, "hi,"+this.msg)
    // return h("div", {id:"root", class: ["root"]},[
    //   h("p",{class: "red"}, "hi~~~"),
    //   h("p",{class: "blue"}, "min-vue")
    // ])
  },
  setup(){
    return {
      msg: "hello, min-vue"
    }
  }
}
import { h } from "../../lib/guide-min-vue.esm.js";
export const App = {
  render(){
    // setupState
    // $el
    // $data
    return h("div", {id:"root", class: ["root"]}, "hi,"+this.msg)
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
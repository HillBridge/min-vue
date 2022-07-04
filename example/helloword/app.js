import { h } from "../../lib/guide-min-vue.esm.js";
export const App = {
  render(){
    // return h("div", {id:"root", class: ["root"]}, "hi, min-vue")
    return h("div", {id:"root", class: ["root"]},[
      h("p",{class: "red"}, "hi~~~"),
      h("p",{class: "blue"}, "min-vue")
    ])
  },
  setup(){
    return {
      msg: "hello, min-vue"
    }
  }
}
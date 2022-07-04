import { h } from "../../lib/guide-min-vue.esm.js";
export const App = {
  render(){
    return h("div", "hi, min-vue")
  },
  setup(){
    return {
      msg: "hello, min-vue"
    }
  }
}
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
    // return h("div",{}, [
    //   h("p",{},"hi,"+this.msg),
    //   h(Foo, {
    //     count: 1, 
    //     onAdd(a,b){
    //       console.log("App-on-add",a,b)
    //     },
    //     onAddFoo(){
    //       console.log("App-on-add-foo")
    //     }
    //   })
    // ])
    const app = h("div",{}, "App")
    // const foo = h(Foo,{}, [h("p",{},"123"),h("p",{},"456")])
    const foo = h(Foo,{}, h("p",{},"123"))
    return h("div",{}, [app,foo])
  },
  setup(){
    return {
      msg: "hello, min-vue"
    }
  }
}
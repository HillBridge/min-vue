import { h, ref } from "../../lib/guide-min-vue.esm.js";

const nextChildren = [h("div",{},"A"),h("div",{},"B")]
const prevChildren = "oldChildren"

export default {
  name: "ArrayToText",
  setup(){

    const isChange = ref(false)
    window.isChange = isChange

    return {
      isChange
    }
  },
  render(){
    return this.isChange ? 
    h(
      "div",
      {id: "new"},
      nextChildren
    ) :
    h(
      "div",
      {id: "old"},
      prevChildren
    )
  }
}
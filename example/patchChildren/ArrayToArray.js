import { h, ref } from "../../lib/guide-min-vue.esm.js";

const nextChildren = [h("div",{},"CCC"),h("div",{},"DDD")]
const prevChildren = [h("div",{},"A"),h("div",{},"B")]

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
      {},
      nextChildren
    ) :
    h(
      "div",
      {},
      prevChildren
    )
  }
}
import { h, ref } from "../../lib/guide-min-vue.esm.js";

const nextChildren = "newChildren"
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
    return isChange ? 
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
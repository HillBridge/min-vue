import { h, ref } from "../../lib/guide-min-vue.esm.js";

// 左侧对比
// const prevChildren = [
//   h("div",{key: "A"}, "A"),
//   h("div",{key: "B"}, "B"),
//   h("div",{key: "C"}, "C")
// ]

// const nextChildren = [
//   h("div",{key: "A"}, "A"),
//   h("div",{key: "B"}, "B"),
//   h("div",{key: "D"}, "D"),
//   h("div",{key: "E"}, "E")
// ]

// 右侧对比
// const prevChildren = [
//   h("div",{key: "A"}, "A"),
//   h("div",{key: "B"}, "B"),
//   h("div",{key: "C"}, "C")
// ]

// const nextChildren = [
//   h("div",{key: "E"}, "E"),
//   h("div",{key: "D"}, "D"),
//   h("div",{key: "B"}, "B"),
//   h("div",{key: "C"}, "C")
// ]

// 新的比老的多（右侧）
// const prevChildren = [
//   h("div",{key: "A"}, "A"),
//   h("div",{key: "B"}, "B")
// ]

// const nextChildren = [
//   h("div",{key: "A"}, "A"),
//   h("div",{key: "B"}, "B"),
//   h("div",{key: "C"}, "C")
// ]

// 新的比老的多（左侧）
const prevChildren = [
  h("div",{key: "A"}, "A"),
  h("div",{key: "B"}, "B")
]

const nextChildren = [
  h("div",{key: "D"}, "D"),
  h("div",{key: "C"}, "C"),
  h("div",{key: "A"}, "A"),
  h("div",{key: "B"}, "B")
]

// 老的比新的长（左侧）
// const prevChildren = [
//   h("div",{key: "A"}, "A"),
//   h("div",{key: "B"}, "B"),
//   h("div",{key: "C"}, "C")
// ]

// const nextChildren = [
//   h("div",{key: "A"}, "A"),
//   h("div",{key: "B"}, "B")
// ]

// 老的比新的长（右侧）
// const prevChildren = [
//   h("div",{key: "A"}, "A"),
//   h("div",{key: "B"}, "B"),
//   h("div",{key: "C"}, "C")
// ]

// const nextChildren = [
//   h("div",{key: "B"}, "B"),
//   h("div",{key: "C"}, "C")
// ]


export default {
  name: "ArrayToArray",
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
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
// const prevChildren = [
//   h("div",{key: "A"}, "A"),
//   h("div",{key: "B"}, "B")
// ]

// const nextChildren = [
//   h("div",{key: "D"}, "D"),
//   h("div",{key: "C"}, "C"),
//   h("div",{key: "A"}, "A"),
//   h("div",{key: "B"}, "B")
// ]

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

// 比较中间不同部分

// 新老一样多
// const prevChildren = [
//   h("div",{key: "A"}, "A"),
//   h("div",{key: "B"}, "B"),
//   h("div",{key: "C", id: "C-PREV"}, "C"),
//   h("div",{key: "D"}, "D"),
//   h("div",{key: "F"}, "F"),
//   h("div",{key: "G"}, "G")
// ]

// const nextChildren = [
//   h("div",{key: "A"}, "A"),
//   h("div",{key: "B"}, "B"),
//   h("div",{key: "E"}, "E"),
//   h("div",{key: "C", id: "C-NEXT"}, "C"),
//   h("div",{key: "F"}, "F"),
//   h("div",{key: "G"}, "G")
// ]

// 老的比新的多
// const prevChildren = [
//   h("div",{key: "A"}, "A"),
//   h("div",{key: "B"}, "B"),
//   h("div",{key: "C", id: "C-PREV"}, "C"),
//   h("div",{key: "D"}, "D"),
//   h("div",{key: "E"}, "E"),
//   h("div",{key: "F"}, "F"),
//   h("div",{key: "G"}, "G")
// ]

// const nextChildren = [
//   h("div",{key: "A"}, "A"),
//   h("div",{key: "B"}, "B"),
//   h("div",{key: "E"}, "E"),
//   h("div",{key: "C", id: "C-NEXT"}, "C"),
//   h("div",{key: "F"}, "F"),
//   h("div",{key: "G"}, "G")
// ]

// 中间 最长递增子序列
// const prevChildren = [
//   h("div",{key: "A"}, "A"),
//   h("div",{key: "B"}, "B"),
//   h("div",{key: "C", id: "C-PREV"}, "C"),
//   h("div",{key: "D"}, "D"),
//   h("div",{key: "E"}, "E"),
//   h("div",{key: "F"}, "F"),
//   h("div",{key: "G"}, "G")
// ]

// const nextChildren = [
//   h("div",{key: "A"}, "A"),
//   h("div",{key: "B"}, "B"),
//   h("div",{key: "E"}, "E"),
//   h("div",{key: "C", id: "C-NEXT"}, "C"),
//   h("div",{key: "D"}, "D"),
//   h("div",{key: "F"}, "F"),
//   h("div",{key: "G"}, "G")
// ]

// 创建新的节点
// const prevChildren = [
//   h("div",{key: "A"}, "A"),
//   h("div",{key: "B"}, "B"),
//   h("div",{key: "C", id: "C-PREV"}, "C"),
//   h("div",{key: "E"}, "E"),
//   h("div",{key: "F"}, "F"),
//   h("div",{key: "G"}, "G")
// ]

// const nextChildren = [
//   h("div",{key: "A"}, "A"),
//   h("div",{key: "B"}, "B"),
//   h("div",{key: "E"}, "E"),
//   h("div",{key: "C", id: "C-NEXT"}, "C"),
//   h("div",{key: "D"}, "D"),
//   h("div",{key: "F"}, "F"),
//   h("div",{key: "G"}, "G")
// ]

// 综合测试例子（移动，删除，添加）
const prevChildren = [
  h("div",{key: "A"}, "A"),
  h("div",{key: "B"}, "B"),
  h("div",{key: "C", id: "C-PREV"}, "C"),
  h("div",{key: "D"}, "D"),
  h("div",{key: "E"}, "E"),
  h("div",{key: "Z"}, "Z"),
  h("div",{key: "F"}, "F"),
  h("div",{key: "G"}, "G")
]

const nextChildren = [
  h("div",{key: "A"}, "A"),
  h("div",{key: "B"}, "B"),
  h("div",{key: "D"}, "D"),
  h("div",{key: "C", id: "C-NEXT"}, "C"),
  h("div",{key: "Y"}, "Y"),
  h("div",{key: "E"}, "E"),
  h("div",{key: "F"}, "F"),
  h("div",{key: "G"}, "G")
]


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
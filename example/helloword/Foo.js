import { h } from "../../lib/guide-min-vue.esm.js"

export const Foo = {
  setup(props){
    // 1. 接收props
    console.log("foo-----",props)

    // 3. shadow readonly
    props.count++
  },
  render(){
    // 2. 获取props
    return h("div",{},"foo:"+this.count)
  }
}
import { h } from "../../lib/guide-min-vue.esm.js"

export const Foo = {
  setup(props){
    console.log("foo-----",props)

    // shadow readonly
    
  },
  render(){
    return h("div",{},"foo:"+this.count)
  }
}
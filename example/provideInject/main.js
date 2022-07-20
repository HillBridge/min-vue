
import { createApp, h, provide, inject } from "../../lib/guide-min-vue.esm.js";

const Provider = {
  name: "Provider",
  render(){
    return h("div",{}, [h("p",{},"Provider"),h(Consumer)])
  },
  setup(){
    provide("foo","foo")
    provide("bar","bar")
  }
}

const Consumer = {
  name: "Consumer",
  render(){
    return h("div",{}, `Consumer---${this.foo}---${this.bar}`)
  },
  setup(){
    const foo = inject("foo")
    const bar = inject("bar")
    return {
      foo,
      bar
    }
  }
}

const App = {
  name: "App",
  render(){
    return h("div",{}, [h("p",{},`App-provide-inject`),h(Provider)])
  },
  setup(){}
}

const rootContainer = document.querySelector("#app")
createApp(App).mount(rootContainer)
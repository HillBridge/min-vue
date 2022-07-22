
import { createApp, h, provide, inject } from "../../lib/guide-min-vue.esm.js";

const Provider = {
  name: "Provider",
  render(){
    return h("div",{}, [h("p",{},"Provider"),h(ProviderTwo)])
  },
  setup(){
    provide("foo","foo")
    provide("bar","bar")
  }
}

const ProviderTwo = {
  name: "Provider",
  render(){
    return h("div",{}, [h("p",{},"ProviderTwo---"+this.foo),h(Consumer)])
  },
  setup(){
    provide("fooTwo","fooTwo")
    const foo = inject("foo")

    return {
      foo
    }
  }
}

const Consumer = {
  name: "Consumer",
  render(){
    return h("div",{}, `Consumer---${this.fooTwo}---${this.bar}---${this.baz}`)
  },
  setup(){
    const fooTwo = inject("fooTwo")
    const bar = inject("bar")
    const baz = inject("baz", "bazDefault")
    return {
      fooTwo,
      bar,
      baz
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
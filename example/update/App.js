import { h, ref } from "../../lib/guide-min-vue.esm.js";

// 视图在显示之前都是虚拟节点，也就是object
// 更新逻辑就是两个虚拟节点的对比
export const App = {
  name: "App",
  setup(){
    const count = ref(0)

    const onClick = () => {
      count.value++
    }

    const props = ref({
      foo: "foo",
      bar: "bar"
    })

    const onChangePropsDemo1 = () => {
      props.value.foo = "new-foo"
    }

    const onChangePropsDemo2 = () => {
      props.value.foo = undefined
    }

    const onChangePropsDemo3 = () => {
      props.value = {
        foo: "foo"
      }
    }
    const onChangePropsDemo4 = () => {
      props.value = {
        foo: "foo",
        bar: "bar",
        baz: "baz"
      }
    }

    return {
      count,
      onClick,
      props,
      onChangePropsDemo1,
      onChangePropsDemo2,
      onChangePropsDemo3,
      onChangePropsDemo4
    }
  },
  render(){
    return h(
      "div",
      {
        id: "root",
        ...this.props
      },
      [
        h("div",{}, "count:"+this.count),
        h("button", {
          onClick: this.onClick
        }, "click"),
        h("button", {
          onClick: this.onChangePropsDemo1
        }, "prop值改变了---修改"),
        h("button", {
          onClick: this.onChangePropsDemo2
        }, "prop值改为undefined---删除"),
        h("button", {
          onClick: this.onChangePropsDemo3
        }, "prop值少了---删除"),
        h("button", {
          onClick: this.onChangePropsDemo4
        }, "prop值增加了---增加")
      ]
    )
  }
}
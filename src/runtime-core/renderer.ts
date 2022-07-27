import { effect } from '../reactivity/effect';
import { ShapeFlags } from '../shared/ShapeFlags';
import { isObject } from './../shared/index';
import { createComponentInstance, setupComponent } from "./component"
import { createAppApi } from './createApp';
import { Fragment, Text } from './vnode';

export function createRenderer(options) {
  const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert } = options

  function render(n2, container, parentComponent) {
  // patch
    patch(null, n2,container,parentComponent)
  }
  // n1 ==>  老的
  // n2 ==>   新的
  function patch(n1, n2,container,parentComponent) {
    // 根据type处理对应的逻辑， type为组件处理组件，type为element处理element
    // console.log("vnode",vnode.type)
    const { shapeFlag } = n2

    switch (n2.type) {
      case Fragment:
        processFragment(n1, n2.children, container, parentComponent)
        break;

      case Text:
        processText(n1, n2, container)
        break;
    
      default:
        if(shapeFlag & ShapeFlags.ELEMENT){
          processElement(n1, n2, container, parentComponent)
        }else if(shapeFlag & ShapeFlags.SATAEFUL_COMPONENT){
          processComponent(n1, n2,container, parentComponent)
        }
        break;
    }
    
  }

  function processText(n1, n2: any, container: any) {
    // todo
    const { children } = n2
    const textNode = (n2.el = document.createTextNode(children))
    container.append(textNode)
  }

  function processFragment(n1, n2: any, container: any, parentComponent) {
    mountChildren(n1, n2,container, parentComponent)
  }

  function processElement(n1, n2: any, container: any, parentComponent) {
    if(!n1){
      mountElement(null, n2,container, parentComponent)
    }else{
      patchElement(n1, n2, container)
    }
  }

  function patchElement(n1, n2, container) {
    console.log("patchElement")
    console.log("n1", n1)
    console.log("n2", n2)
    const oldProps = n1.props || {}
    const newProps = n2.props || {}
    const el = (n2.el = n1.el)
    // props
    patchProps(el,oldProps,newProps)
    // children
  }

  function patchProps(el,oldProps,newProps) {
    // 遍历新的值，对应的属性修改了就替换
    if(oldProps !== newProps){
      for (const key in newProps) {
        const prevProp = oldProps[key]
        const nextProp = newProps[key]
        if(prevProp !== nextProp){
          hostPatchProp(el, key, prevProp, nextProp)
        }
      }
    } 
    

    // 遍历老的值，对应的key在新的值里没有要删除
    for (const key in oldProps) {
      if(!(key in newProps)){
        hostPatchProp(el, key, oldProps[key], null)
      }
    }
  }


  function mountElement(n1, n2: any, container: any, parentComponent) {
    const { type, props, children, shapeFlag } = n2
    // const el = document.createElement(type)
    const el = (n2.el = hostCreateElement(type))
    
    if(shapeFlag & ShapeFlags.TEXT_CHILDREN){
      el.textContent = children
    }else if(shapeFlag & ShapeFlags.ARRAY_CHILDREN){
      mountChildren(n1, children,el, parentComponent)
    }
    for (const key in props) {
      // console.log("mountElement",key)
      const val = props[key]
      
      hostPatchProp(el, key, null, val)
    }
    // insert
    hostInsert(el, container)
    // container.append(el)
  }

  function mountChildren(n1, n2, container, parentComponent) {
    n2.forEach(ele => {
      // 当children为数组时，需要重新调用patch
      patch(n1, ele, container, parentComponent)
    });
  }

  function processComponent(n1, n2,container, parentComponent) {
    mountComponent(n2,container, parentComponent)
  }

  function mountComponent(initialVNode: any, container: any, parentComponent) {
    const instance = createComponentInstance(initialVNode, parentComponent)
    // 处理component
    setupComponent(instance)

    // 调用render, 处理subtree
    setupRenderEffect(instance, initialVNode, container)
  }
  function setupRenderEffect( instance, initialVNode, container: any) {
    // 在处理完setup之后会调用render, 将render这部分放在effect里进行依赖收集（因为render中有响应式数据），当响应式数据进行更改的时候触发依赖，会重新获取到新的subtree
    effect(() => {
      
      // 调用render 得到subtree, subtree中的可以获取到setup、props、 $el 、 $slots等
      // 通过call 将render的this 指向在setupStatefulComponet(setup)中处理的 proxy
      // 需要区分初始化和更新逻辑
      if(!instance.isMounted){
        // init
        const { proxy } = instance
        const subTree = (instance.subTree = instance.render.call(proxy))

        console.log("init",subTree)

        //得到subtree之后要重新调用patch，重新调用patch
        // 初始化的时候n1老节点是没有值的
        patch(null, subTree, container, instance)
        // 当所有的节点都patch完后
        initialVNode.el = subTree.el

        // 初始化完毕将状态改变
        instance.isMounted = true
      }else{
        // update
        const { proxy } = instance
        const subTree = instance.render.call(proxy)
        const prevSubTree = instance.subTree

        instance.subTree = subTree


        patch(prevSubTree, subTree, container, instance)
      }
    })
  }
  return {
    createApp: createAppApi(render)
  }
}







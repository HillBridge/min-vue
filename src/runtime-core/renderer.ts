import { effect } from '../reactivity/effect';
import { ShapeFlags } from '../shared/ShapeFlags';
import { createComponentInstance, setupComponent } from "./component"
import { createAppApi } from './createApp';
import { Fragment, Text } from './vnode';

export function createRenderer(options) {
  const { 
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText
  } = options

  function render(n2, container, parentComponent) {
  // patch
    patch(null, n2,container,parentComponent, null)
  }
  // n1 ==>  老的5
  // n2 ==>   新的
  function patch(n1, n2,container,parentComponent, anchor) {
    // 根据type处理对应的逻辑， type为组件处理组件，type为element处理element
    // console.log("vnode",vnode.type)
    const { shapeFlag } = n2

    switch (n2.type) {
      case Fragment:
        processFragment(n1, n2.children, container, parentComponent, anchor)
        break;

      case Text:
        processText(n1, n2, container)
        break;
    
      default:
        if(shapeFlag & ShapeFlags.ELEMENT){
          processElement(n1, n2, container, parentComponent, anchor)
        }else if(shapeFlag & ShapeFlags.SATAEFUL_COMPONENT){
          processComponent(n1, n2,container, parentComponent, anchor)
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

  function processFragment(n1, n2: any, container: any, parentComponent, anchor) {
    mountChildren(n1, n2,container, parentComponent, anchor)
  }

  function processElement(n1, n2: any, container: any, parentComponent, anchor) {
    if(!n1){
      mountElement(null, n2,container, parentComponent, anchor)
    }else{
      patchElement(n1, n2, container,parentComponent, anchor)
    }
  }

  function patchElement(n1, n2, container,parentComponent, anchor) {
    console.log("patchElement")
    console.log("n1", n1)
    console.log("n2", n2)
    const oldProps = n1.props || {}
    const newProps = n2.props || {}
    const el = (n2.el = n1.el)
    // props
    patchProps(el,oldProps,newProps)
    // children
    patchChildren(n1,n2,el,parentComponent, anchor)
  }

  function patchChildren(n1,n2,container,parentComponent, anchor) {
    const prevShapFlag = n1.shapeFlag
    const { shapeFlag } = n2
    const c1 = n1.children
    const c2 = n2.children
    // 新值为text
    if(shapeFlag & ShapeFlags.TEXT_CHILDREN){
      if(prevShapFlag & ShapeFlags.ARRAY_CHILDREN){
        // 老值是array, 那么此刻就是  Array => text
        // 先清除老的children
        unmountChildren(c1)

        // 设置新值的text
        hostSetElementText(container, c2)
      }else if(prevShapFlag & ShapeFlags.TEXT_CHILDREN){
        // 老值是text, 那么此刻就是  text => text
        if(c1 !== c2){
          // 两个值不一样的话直接进行替换
          hostSetElementText(container, c2)
        }
      }
    }else if(shapeFlag & ShapeFlags.ARRAY_CHILDREN){
      // 新值为array
      if(prevShapFlag & ShapeFlags.TEXT_CHILDREN){
        // text => array
        // 先清空老值
        hostSetElementText(container, "")
        // 再绑定children
        mountChildren(null, n2.children, container, parentComponent, anchor)
      } else if(prevShapFlag & ShapeFlags.ARRAY_CHILDREN){
        // array => array
        // 不能单纯的直接进行替换，这样性能消耗大，应该找到不同部分进行渲染
        patchKeyedChildren(c1, c2, container, parentComponent, anchor)
      }
    }
  }

  function patchKeyedChildren(c1, c2, container, parentComponent, anchor){
    let i = 0;
    let e1 = c1.length - 1
    let e2 = c2.length - 1

    function isSameVNodeType(n1,n2){
      return n1.type === n2.type && n1.key === n2.key
    }
    // 左侧
    while (i <= e1 && i <= e2) {
      const n1 = c1[i]
      const n2 = c2[i]
      if(isSameVNodeType(n1,n2)){
        patch(n1, n2, container, parentComponent, anchor)
      }else{
        break;
      }
      i++
    }
    // 右侧
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1]
      const n2 = c2[e2]
      if(isSameVNodeType(n1,n2)){
        patch(n1, n2, container, parentComponent, anchor)
      }else{
        break;
      }
      e1--
      e2--
    }
    // 新的比老的多（右侧）
    if(i > e1){
      if(i <= e2){
        const nextPos = e2 + 1
        const anchor = nextPos < c2.length ?  c2[nextPos].el : null
        while(i <= e2){
          patch(null, c2[i], container, parentComponent, anchor)
          i++
        }
      }
    }else if(i > e2){
      while(i <= e1){
        hostRemove(c1[i].el)
        i++
      }
    }else{
      // 中间对比
      const s1 = i 
      const s2 = i
      // 获取新的map映射
      const toBePatched = e2-s2 + 1
      let patched = 0
      const keyToNewIndexMap = new Map()
      for (let i = s2; i <= e2; i++) {
        const nextChild = c2[i]
        keyToNewIndexMap.set(nextChild.key, i)
      }
      // 初始化map，建立映射关系
      const newIndexToOldIndexMap = new Array(toBePatched)
      for (let i = 0; i < toBePatched; i++) newIndexToOldIndexMap[i] = 0
      // 遍历老的
      for (let j = s1; j <= e1; j++) {
        const prevChild = c1[j]
        if(patched >= toBePatched){
          hostRemove(prevChild.el)
          continue
        }
        let newIndex
        if(prevChild.key != null){
          newIndex = keyToNewIndexMap.get(prevChild.key)
        }else{
          for (let k = s2; k <= e2; k++) {
            if(isSameVNodeType(prevChild, c2[k])){
              newIndex = k
              break;
            }
          }
        }
        if(newIndex === undefined){
          hostRemove(prevChild.el)
        }else{
          newIndexToOldIndexMap[newIndex - s2] = j + 1 // 建立映射关系
          patch(prevChild, c2[newIndex], container, parentComponent, null)
          patched++
        }
      }

      const increasingNewIndexSequence = getSequence(newIndexToOldIndexMap)
      let m = increasingNewIndexSequence.length
      for (let i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = i + s2
        const nextChild = c2[nextIndex]
        const anchor = nextIndex+1 < c2.length ? c2[nextIndex+1].el : null
        if(i !== increasingNewIndexSequence[m]){
          // 移动位置
          hostInsert(nextChild.el,container, anchor)
        }else{
          m--
        }
        
      }
    }
  }


  function unmountChildren(children) {
    for(let i=0; i<children.length; i++){
      const el = children[i].el
      hostRemove(el)
    }
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


  function mountElement(n1, n2: any, container: any, parentComponent, anchor) {
    const { type, props, children, shapeFlag } = n2
    // const el = document.createElement(type)
    const el = (n2.el = hostCreateElement(type))
    
    if(shapeFlag & ShapeFlags.TEXT_CHILDREN){
      el.textContent = children
    }else if(shapeFlag & ShapeFlags.ARRAY_CHILDREN){
      mountChildren(n1, children,el, parentComponent, anchor)
    }
    for (const key in props) {
      // console.log("mountElement",key)
      const val = props[key]
      
      hostPatchProp(el, key, null, val)
    }
    // insert
    hostInsert(el, container, anchor)
    // container.append(el)
  }

  function mountChildren(n1, n2, container, parentComponent, anchor) {
    n2.forEach(ele => {
      // 当children为数组时，需要重新调用patch
      patch(n1, ele, container, parentComponent, anchor)
    });
  }

  function processComponent(n1, n2,container, parentComponent, anchor) {
    mountComponent(n2,container, parentComponent, anchor)
  }

  function mountComponent(initialVNode: any, container: any, parentComponent, anchor) {
    const instance = createComponentInstance(initialVNode, parentComponent)
    // 处理component
    setupComponent(instance)

    // 调用render, 处理subtree
    setupRenderEffect(instance, initialVNode, container, anchor)
  }
  function setupRenderEffect( instance, initialVNode, container: any, anchor) {
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
        patch(null, subTree, container, instance, anchor)
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


        patch(prevSubTree, subTree, container, instance, anchor)
      }
    })
  }
  return {
    createApp: createAppApi(render)
  }
}
// 获取最长递增子序列
function getSequence(arr: number[]): number[] {
  const p = arr.slice();
  const result = [0];
  let i, j, u, v, c;
  const len = arr.length;
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p[i] = j;
        result.push(i);
        continue;
      }
      u = 0;
      v = result.length - 1;
      while (u < v) {
        c = (u + v) >> 1;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }
  u = result.length;
  v = result[u - 1];
  while (u-- > 0) {
    result[u] = v;
    v = p[v];
  }
  return result;
}






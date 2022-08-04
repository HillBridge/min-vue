'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const extend = Object.assign;
const isObject = (val) => {
    return val !== null && typeof val === 'object';
};
const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key);
const camelize = (str) => {
    return str.replace(/-(\w)/g, (_, c) => {
        return c ? c.toUpperCase() : "";
    });
};
const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
const toHandlerKey = (str) => {
    return str ? "on" + capitalize(str) : "";
};

let activeEffect;
let shouldTrack;
// 面向对象的思想，抽离
class ReactiveEffect {
    constructor(fn, scheduler) {
        this.deps = [];
        this.active = true;
        this._fn = fn;
        this.scheduler = scheduler;
    }
    run() {
        if (!this.active) {
            // 说明执行了stop，则不进行依赖收集
            return this._fn();
        }
        activeEffect = this;
        shouldTrack = true;
        const result = this._fn();
        // reset
        shouldTrack = false;
        return result;
    }
    stop() {
        if (this.active) {
            cleanupEffect(this);
            if (this.onStop) {
                this.onStop();
            }
            this.active = false;
        }
    }
}
const cleanupEffect = (effect) => {
    effect.deps.forEach((dep) => {
        dep.delete(effect);
    });
    effect.deps.length = 0;
};
function isTracking() {
    return shouldTrack && activeEffect;
}
// 全局变量map维护所有收集的依赖（大盒子），每个key用小盒子装所对应的依赖（fn）
const targetMap = new Map();
function track(target, key) {
    if (!isTracking())
        return;
    // target -> key -> dep
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    let dep = depsMap.get(key);
    if (!dep) {
        dep = new Set();
        depsMap.set(key, dep);
    }
    // 收集依赖
    trackEffects(dep);
}
function trackEffects(dep) {
    dep.add(activeEffect);
    // 反向收集一下
    activeEffect.deps.push(dep);
}
// 依赖收集的主要目的是，当响应式对象的值发生变化时，会出发对应set钩子函数，此时会把最新的值进行赋值，但此时如effect回调中的nextAge并没有更新，所有需要重新执行一下effect, 而我们收集的依赖就是这个effect回调。
function trigger(target, key) {
    const depsMap = targetMap.get(target);
    const dep = depsMap.get(key);
    // 触发依赖
    triggerEffects(dep);
}
function triggerEffects(dep) {
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}
function effect(fn, options = {}) {
    const _effect = new ReactiveEffect(fn, options.scheduler);
    // Object.assign(_effect,options)
    // _effect.onStop = options.onStop
    extend(_effect, options);
    _effect.run();
    const runner = _effect.run.bind(_effect);
    // 将effect实例绑定到runner上
    runner.effect = _effect;
    return runner;
}

const get = createGetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
function createGetter(isReadolny = false, shalow = false) {
    return function get(target, key) {
        if (key === "__V_isreactive" /* reactiveFlags.IS_REACTIVE */) {
            return !isReadolny;
        }
        if (key === "__V_isreadonly" /* reactiveFlags.IS_READONLY */) {
            return isReadolny;
        }
        const res = Reflect.get(target, key);
        if (shalow) {
            return res;
        }
        if (!isReadolny) {
            track(target, key);
        }
        if (isObject(res)) {
            return isReadolny ? readonly(res) : reactive(res);
        }
        return res;
    };
}
function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        // todo 触发依赖
        trigger(target, key);
        return res;
    };
}
const mutableHandlers = {
    get,
    set: createSetter(),
};
const readonlyHandlers = {
    get: readonlyGet,
    set(target, key, value) {
        console.warn(`key:${key} set failed, because target is readonly`, target);
        return true;
    }
};
const shallowReadonlyHanlders = extend({}, readonlyHandlers, {
    get: shallowReadonlyGet
});

function reactive(raw) {
    return createActiveObject(raw, mutableHandlers);
}
function readonly(raw) {
    return createActiveObject(raw, readonlyHandlers);
}
function shallowReadonly(raw) {
    return createActiveObject(raw, shallowReadonlyHanlders);
}
function createActiveObject(raw, baseHandlers) {
    if (!isObject(raw)) {
        console.warn(`target:${raw}必须是一个对象`);
        return raw;
    }
    return new Proxy(raw, baseHandlers);
}

// key => dep 一个key对应一个dep
// 因为过来的是一个值 1 "" true，所以无法用proxy做代理进行拦截，所以可以新建一个对象，通过get set 存取器进行依赖收集. 而ref也可以传递object, 所以我们可以对于为对象的类型进行reactive包裹处理
class refImpl {
    constructor(value) {
        this.__v_isRef = true;
        this._rawValue = value;
        this._value = convert(value);
        this._dep = new Set();
    }
    get value() {
        // 收集依赖
        if (isTracking()) {
            trackEffects(this._dep);
        }
        return this._value;
    }
    set value(newValue) {
        if (Object.is(this._rawValue, newValue))
            return;
        this._rawValue = newValue;
        this._value = convert(newValue);
        // 触发依赖
        triggerEffects(this._dep);
    }
}
function convert(value) {
    return isObject(value) ? reactive(value) : value;
}
function ref(value) {
    return new refImpl(value);
}
function isRef(ref) {
    return !!ref['__v_isRef'];
}
function unRef(ref) {
    return isRef(ref) ? ref.value : ref;
}
function proxyRefs(raw) {
    return new Proxy(raw, {
        get(target, key) {
            // 判断传过来的val是否为一个ref， 如果是ref就返回ref.value, 否则直接返回值
            return unRef(Reflect.get(target, key));
        },
        set(target, key, value) {
            if (isRef(Reflect.get(target, key)) && !isRef(value)) {
                return target[key].value = value;
            }
            return Reflect.set(target, key, value);
        },
    });
}

const Fragment = Symbol("Fragment");
const Text = Symbol("Text");
function createVnode(type, props, children) {
    // vnode 就是描述node节点的js对象
    const vnode = {
        type,
        props,
        children,
        key: props && props.key,
        shapeFlag: getShapeFalg(type),
        el: null
    };
    if (typeof children === "string") {
        vnode.shapeFlag = vnode.shapeFlag | 4 /* ShapeFlags.TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag = vnode.shapeFlag | 8 /* ShapeFlags.ARRAY_CHILDREN */;
    }
    return vnode;
}
function getShapeFalg(type) {
    return typeof type === "string" ? 1 /* ShapeFlags.ELEMENT */ : 2 /* ShapeFlags.SATAEFUL_COMPONENT */;
}
function createTextVnode(text) {
    return createVnode(Text, {}, text);
}

function h(type, props, children) {
    return createVnode(type, props, children);
}

function renderSlots(slots, name) {
    const slot = slots[name];
    if (slot) {
        return createVnode(Fragment, {}, slot);
    }
}

function emit(instance, event, ...args) {
    const { props } = instance;
    console.log("props", props);
    // TPP思想
    // add => Add
    // add-foo => addFoo
    const handlerName = toHandlerKey(camelize(event));
    const handler = props[handlerName];
    handler && handler(...args);
}

function initProps(instance, rawProps) {
    instance.props = rawProps || {};
}

const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots
};
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState, props } = instance;
        // setupState
        // Object.prototype.hasOwnProperty.call(obj,key)
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    },
};

function initSlots(instance, children) {
    // instance.slots = Array.isArray(children) ? children: [children]
    normalizeObjectSlots(instance, children);
}
function normalizeSlotValue(value) {
    return Array.isArray(value) ? value : [value];
}
function normalizeObjectSlots(instance, children) {
    const slots = {};
    for (const key in children) {
        const value = children[key];
        slots[key] = normalizeSlotValue(value);
    }
    instance.slots = slots;
}

function createComponentInstance(vnode, parent) {
    // console.log("createComponentInstance",parent)
    // 创建component实例，方便以后将一些属性放在实例上处理
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        proxy: null,
        props: {},
        slots: {},
        provides: parent ? parent.provides : {},
        parent,
        isMounted: false,
        subTree: {},
        emit: () => { }
    };
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    // TODO
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    // 处理有状态的组件(setup)
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    // 处理setup的时候在实例上添加一个proxy， 这个proxy将来可以在render执行的时候取到setup返回值，props，$el, $slots等， 用proxy做一个拦截获取
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    const Component = instance.type;
    const { setup } = Component;
    if (setup) {
        setCurrentInstance(instance);
        // function object
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit
        });
        setCurrentInstance(null);
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    if (typeof setupResult === "object") {
        instance.setupState = proxyRefs(setupResult);
    }
    // 处理完setup后看看组件实例上是否有render
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    if (Component.render) {
        instance.render = Component.render;
    }
}
let currentInstance = null;
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}

function provide(key, value) {
    // set
    // provide inject是将公共的值存在组件instance上，当前组件注册存值，inject通过原型链向上查找取值
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        let { provides } = currentInstance;
        const parentProvides = currentInstance.parent.provides;
        if (provides === parentProvides) {
            // init
            provides = (currentInstance.provides = Object.create(parentProvides));
        }
        provides[key] = value;
    }
}
function inject(key, defaultVal) {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        // currentInstance.parent 是指获取父级的组件实例
        const parentProvides = currentInstance.parent.provides;
        if (key in parentProvides) {
            return parentProvides[key];
        }
        else if (defaultVal) {
            return defaultVal;
        }
    }
}

function createAppApi(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                // 1. 先把根组件转为 vnode, 后续所有的逻辑都会基于vnode进行处理
                const vnode = createVnode(rootComponent);
                // 2. 将当前的组件挂在到当前根容器上
                render(vnode, rootContainer, undefined);
            }
        };
    };
}

function createRenderer(options) {
    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert, remove: hostRemove, setElementText: hostSetElementText } = options;
    function render(n2, container, parentComponent) {
        // patch
        patch(null, n2, container, parentComponent, null);
    }
    // n1 ==>  老的5
    // n2 ==>   新的
    function patch(n1, n2, container, parentComponent, anchor) {
        // 根据type处理对应的逻辑， type为组件处理组件，type为element处理element
        // console.log("vnode",vnode.type)
        const { shapeFlag } = n2;
        switch (n2.type) {
            case Fragment:
                processFragment(n1, n2.children, container, parentComponent, anchor);
                break;
            case Text:
                processText(n1, n2, container);
                break;
            default:
                if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
                    processElement(n1, n2, container, parentComponent, anchor);
                }
                else if (shapeFlag & 2 /* ShapeFlags.SATAEFUL_COMPONENT */) {
                    processComponent(n1, n2, container, parentComponent, anchor);
                }
                break;
        }
    }
    function processText(n1, n2, container) {
        // todo
        const { children } = n2;
        const textNode = (n2.el = document.createTextNode(children));
        container.append(textNode);
    }
    function processFragment(n1, n2, container, parentComponent, anchor) {
        mountChildren(n1, n2, container, parentComponent, anchor);
    }
    function processElement(n1, n2, container, parentComponent, anchor) {
        if (!n1) {
            mountElement(null, n2, container, parentComponent, anchor);
        }
        else {
            patchElement(n1, n2, container, parentComponent, anchor);
        }
    }
    function patchElement(n1, n2, container, parentComponent, anchor) {
        console.log("patchElement");
        console.log("n1", n1);
        console.log("n2", n2);
        const oldProps = n1.props || {};
        const newProps = n2.props || {};
        const el = (n2.el = n1.el);
        // props
        patchProps(el, oldProps, newProps);
        // children
        patchChildren(n1, n2, el, parentComponent, anchor);
    }
    function patchChildren(n1, n2, container, parentComponent, anchor) {
        const prevShapFlag = n1.shapeFlag;
        const { shapeFlag } = n2;
        const c1 = n1.children;
        const c2 = n2.children;
        // 新值为text
        if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
            if (prevShapFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
                // 老值是array, 那么此刻就是  Array => text
                // 先清除老的children
                unmountChildren(c1);
                // 设置新值的text
                hostSetElementText(container, c2);
            }
            else if (prevShapFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
                // 老值是text, 那么此刻就是  text => text
                if (c1 !== c2) {
                    // 两个值不一样的话直接进行替换
                    hostSetElementText(container, c2);
                }
            }
        }
        else if (shapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
            // 新值为array
            if (prevShapFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
                // text => array
                // 先清空老值
                hostSetElementText(container, "");
                // 再绑定children
                mountChildren(null, n2.children, container, parentComponent, anchor);
            }
            else if (prevShapFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
                // array => array
                // 不能单纯的直接进行替换，这样性能消耗大，应该找到不同部分进行渲染
                patchKeyedChildren(c1, c2, container, parentComponent, anchor);
            }
        }
    }
    function patchKeyedChildren(c1, c2, container, parentComponent, anchor) {
        let i = 0;
        let e1 = c1.length - 1;
        let e2 = c2.length - 1;
        function isSameVNodeType(n1, n2) {
            return n1.type === n2.type && n1.key === n2.key;
        }
        // 左侧
        while (i <= e1 && i <= e2) {
            const n1 = c1[i];
            const n2 = c2[i];
            if (isSameVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, anchor);
            }
            else {
                break;
            }
            i++;
        }
        // 右侧
        while (i <= e1 && i <= e2) {
            const n1 = c1[e1];
            const n2 = c2[e2];
            if (isSameVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, anchor);
            }
            else {
                break;
            }
            e1--;
            e2--;
        }
        // 新的比老的多（右侧）
        if (i > e1) {
            if (i <= e2) {
                const nextPos = e2 + 1;
                const anchor = nextPos < c2.length ? c2[nextPos].el : null;
                while (i <= e2) {
                    patch(null, c2[i], container, parentComponent, anchor);
                    i++;
                }
            }
        }
        else if (i > e2) {
            while (i <= e1) {
                hostRemove(c1[i].el);
                i++;
            }
        }
        else {
            // 中间对比
            const s1 = i;
            const s2 = i;
            // 获取新的map映射
            const keyToNewIndexMap = new Map();
            for (let i = s2; i <= e2; i++) {
                const nextChild = c2[i];
                keyToNewIndexMap.set(nextChild.key, i);
            }
            // 遍历老的
            for (let j = s1; j <= e1; j++) {
                const prevChild = c1[j];
                let newIndex;
                if (prevChild.key != null) {
                    newIndex = keyToNewIndexMap.get(prevChild.key);
                }
                else {
                    for (let k = s2; k <= e2; k++) {
                        if (isSameVNodeType(prevChild, c2[k])) {
                            newIndex = k;
                            break;
                        }
                    }
                }
                if (newIndex === undefined) {
                    hostRemove(prevChild.el);
                }
                else {
                    patch(prevChild, c2[newIndex], container, parentComponent, null);
                }
            }
        }
    }
    function unmountChildren(children) {
        for (let i = 0; i < children.length; i++) {
            const el = children[i].el;
            hostRemove(el);
        }
    }
    function patchProps(el, oldProps, newProps) {
        // 遍历新的值，对应的属性修改了就替换
        if (oldProps !== newProps) {
            for (const key in newProps) {
                const prevProp = oldProps[key];
                const nextProp = newProps[key];
                if (prevProp !== nextProp) {
                    hostPatchProp(el, key, prevProp, nextProp);
                }
            }
        }
        // 遍历老的值，对应的key在新的值里没有要删除
        for (const key in oldProps) {
            if (!(key in newProps)) {
                hostPatchProp(el, key, oldProps[key], null);
            }
        }
    }
    function mountElement(n1, n2, container, parentComponent, anchor) {
        const { type, props, children, shapeFlag } = n2;
        // const el = document.createElement(type)
        const el = (n2.el = hostCreateElement(type));
        if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
            el.textContent = children;
        }
        else if (shapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
            mountChildren(n1, children, el, parentComponent, anchor);
        }
        for (const key in props) {
            // console.log("mountElement",key)
            const val = props[key];
            hostPatchProp(el, key, null, val);
        }
        // insert
        hostInsert(el, container, anchor);
        // container.append(el)
    }
    function mountChildren(n1, n2, container, parentComponent, anchor) {
        n2.forEach(ele => {
            // 当children为数组时，需要重新调用patch
            patch(n1, ele, container, parentComponent, anchor);
        });
    }
    function processComponent(n1, n2, container, parentComponent, anchor) {
        mountComponent(n2, container, parentComponent, anchor);
    }
    function mountComponent(initialVNode, container, parentComponent, anchor) {
        const instance = createComponentInstance(initialVNode, parentComponent);
        // 处理component
        setupComponent(instance);
        // 调用render, 处理subtree
        setupRenderEffect(instance, initialVNode, container, anchor);
    }
    function setupRenderEffect(instance, initialVNode, container, anchor) {
        // 在处理完setup之后会调用render, 将render这部分放在effect里进行依赖收集（因为render中有响应式数据），当响应式数据进行更改的时候触发依赖，会重新获取到新的subtree
        effect(() => {
            // 调用render 得到subtree, subtree中的可以获取到setup、props、 $el 、 $slots等
            // 通过call 将render的this 指向在setupStatefulComponet(setup)中处理的 proxy
            // 需要区分初始化和更新逻辑
            if (!instance.isMounted) {
                // init
                const { proxy } = instance;
                const subTree = (instance.subTree = instance.render.call(proxy));
                console.log("init", subTree);
                //得到subtree之后要重新调用patch，重新调用patch
                // 初始化的时候n1老节点是没有值的
                patch(null, subTree, container, instance, anchor);
                // 当所有的节点都patch完后
                initialVNode.el = subTree.el;
                // 初始化完毕将状态改变
                instance.isMounted = true;
            }
            else {
                // update
                const { proxy } = instance;
                const subTree = instance.render.call(proxy);
                const prevSubTree = instance.subTree;
                instance.subTree = subTree;
                patch(prevSubTree, subTree, container, instance, anchor);
            }
        });
    }
    return {
        createApp: createAppApi(render)
    };
}

function createElement(type) {
    return document.createElement(type);
}
function patchProp(el, key, prevVal, nextVal) {
    // on + 大写
    const isOn = (key) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, nextVal);
    }
    else {
        if (nextVal === undefined || nextVal === null) {
            el.removeAttribute(key);
        }
        else {
            el.setAttribute(key, nextVal);
        }
    }
}
function insert(child, parent, anchor) {
    // parent.append(el)
    parent.insertBefore(child, anchor || null);
}
function remove(child) {
    const parent = child.parentNode;
    if (parent) {
        parent.removeChild(child);
    }
}
function setElementText(el, text) {
    el.textContent = text;
}
const renderer = createRenderer({
    createElement,
    patchProp,
    insert,
    remove,
    setElementText
});
function createApp(...args) {
    return renderer.createApp(...args);
}

exports.createApp = createApp;
exports.createRenderer = createRenderer;
exports.createTextVnode = createTextVnode;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.provide = provide;
exports.proxyRefs = proxyRefs;
exports.ref = ref;
exports.renderSlots = renderSlots;

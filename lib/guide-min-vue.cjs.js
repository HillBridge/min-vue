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

// 全局变量map维护所有收集的依赖（大盒子），每个key用小盒子装所对应的依赖（fn）
const targetMap = new Map();
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
    // 创建component实例，方便以后将一些属性放在实例上处理
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        proxy: null,
        props: {},
        slots: {},
        provides: {},
        parent,
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
        instance.setupState = setupResult;
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

const Fragment = Symbol("Fragment");
const Text = Symbol("Text");
function createVnode(type, props, children) {
    // vnode 就是描述node节点的js对象
    const vnode = {
        type,
        props,
        children,
        el: null
    };
    return vnode;
}
function createTextVnode(text) {
    return createVnode(Text, {}, text);
}

function render(vnode, container, parentComponent) {
    // patch
    patch(vnode, container, parentComponent);
}
function patch(vnode, container, parentComponent) {
    // 根据type处理对应的逻辑， type为组件处理组件，type为element处理element
    // console.log("vnode",vnode.type)
    switch (vnode.type) {
        case Fragment:
            processFragment(vnode.children, container, parentComponent);
            break;
        case Text:
            processText(vnode, container);
            break;
        default:
            if (typeof vnode.type === "string") {
                processElement(vnode, container, parentComponent);
            }
            else if (isObject(vnode.type)) {
                processComponent(vnode, container, parentComponent);
            }
            break;
    }
}
function processText(vnode, container) {
    // todo
    const { children } = vnode;
    const textNode = (vnode.el = document.createTextNode(children));
    container.append(textNode);
}
function processFragment(vnode, container, parentComponent) {
    mountChildren(vnode, container, parentComponent);
}
function processElement(vnode, container, parentComponent) {
    mountElement(vnode, container, parentComponent);
}
function mountElement(vnode, container, parentComponent) {
    const { type, props, children } = vnode;
    // const el = document.createElement(type)
    const el = (vnode.el = document.createElement(type));
    if (typeof children === "string") {
        el.textContent = children;
    }
    else if (isObject(children)) {
        mountChildren(children, el, parentComponent);
    }
    for (const key in props) {
        // console.log("mountElement",key)
        const val = props[key];
        // on + 大写
        const isOn = (key) => /^on[A-Z]/.test(key);
        if (isOn(key)) {
            const event = key.slice(2).toLowerCase();
            el.addEventListener(event, val);
        }
        else {
            el.setAttribute(key, val);
        }
    }
    container.append(el);
}
function mountChildren(vnode, container, parentComponent) {
    vnode.forEach(ele => {
        patch(ele, container, parentComponent);
    });
}
function processComponent(vnode, container, parentComponent) {
    mountComponent(vnode, container, parentComponent);
}
function mountComponent(initialVNode, container, parentComponent) {
    const instance = createComponentInstance(initialVNode, parentComponent);
    // 处理component
    setupComponent(instance);
    // 调用render, 处理subtree
    setupRenderEffect(instance, initialVNode, container);
}
function setupRenderEffect(instance, initialVNode, container) {
    const { proxy } = instance;
    const subTree = instance.render.call(proxy);
    //重新调用patch
    patch(subTree, container, instance);
    // 当所有的节点都patch完后
    initialVNode.el = subTree.el;
    // console.log("subTree",subTree)
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // 1. 先把根组件转为 vnode, 后续所有的逻辑都会基于vnode进行处理
            const vnode = createVnode(rootComponent);
            // 2. 将当前的组件挂在到当前根容器上
            render(vnode, rootContainer);
        }
    };
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

function provide(key, value) {
    // set
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const { provides } = currentInstance;
        provides[key] = value;
    }
}
function inject(key) {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const parentProvides = currentInstance.parent.provides;
        return parentProvides[key];
    }
}

exports.createApp = createApp;
exports.createTextVnode = createTextVnode;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.provide = provide;
exports.renderSlots = renderSlots;

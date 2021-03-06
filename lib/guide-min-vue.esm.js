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

function render(n2, container, parentComponent) {
    // patch
    patch(null, n2, container, parentComponent);
}
// n1 ==>  老的
// n2 ==>   新的
function patch(n1, n2, container, parentComponent) {
    // 根据type处理对应的逻辑， type为组件处理组件，type为element处理element
    // console.log("vnode",vnode.type)
    switch (n2.type) {
        case Fragment:
            processFragment(n1, n2.children, container, parentComponent);
            break;
        case Text:
            processText(n1, n2, container);
            break;
        default:
            if (typeof n2.type === "string") {
                processElement(n1, n2, container, parentComponent);
            }
            else if (isObject(n2.type)) {
                processComponent(n1, n2, container, parentComponent);
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
function processFragment(n1, n2, container, parentComponent) {
    mountChildren(n1, n2, container, parentComponent);
}
function processElement(n1, n2, container, parentComponent) {
    if (!n1) {
        mountElement(null, n2, container, parentComponent);
    }
    else {
        patchElement(n1, n2);
    }
}
function patchElement(n1, n2, container) {
    console.log("patchElement");
    console.log("n1", n1);
    console.log("n2", n2);
    // props
    // children
}
function mountElement(n1, n2, container, parentComponent) {
    const { type, props, children } = n2;
    // const el = document.createElement(type)
    const el = (n2.el = document.createElement(type));
    if (typeof children === "string") {
        el.textContent = children;
    }
    else if (isObject(children)) {
        mountChildren(n1, children, el, parentComponent);
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
function mountChildren(n1, n2, container, parentComponent) {
    n2.forEach(ele => {
        // 当children为数组时，需要重新调用patch
        patch(n1, ele, container, parentComponent);
    });
}
function processComponent(n1, n2, container, parentComponent) {
    mountComponent(n2, container, parentComponent);
}
function mountComponent(initialVNode, container, parentComponent) {
    const instance = createComponentInstance(initialVNode, parentComponent);
    // 处理component
    setupComponent(instance);
    // 调用render, 处理subtree
    setupRenderEffect(instance, initialVNode, container);
}
function setupRenderEffect(instance, initialVNode, container) {
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
            patch(null, subTree, container, instance);
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
            patch(prevSubTree, subTree, container, instance);
        }
    });
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // 1. 先把根组件转为 vnode, 后续所有的逻辑都会基于vnode进行处理
            const vnode = createVnode(rootComponent);
            // 2. 将当前的组件挂在到当前根容器上
            render(vnode, rootContainer, undefined);
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

export { createApp, createTextVnode, getCurrentInstance, h, inject, provide, proxyRefs, ref, renderSlots };

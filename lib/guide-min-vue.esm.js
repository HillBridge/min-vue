const isObject = (val) => {
    return val !== null && typeof val === 'object';
};

function initProps(instance, rawProps) {
    instance.props = rawProps;
}

const publicPropertiesMap = {
    $el: (i) => i.vnode.el
};
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState, props } = instance;
        // setupState
        const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key);
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

function createComponentInstance(vnode) {
    // 创建component实例，方便以后将一些属性放在实例上处理
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        proxy: null,
        props: {}
    };
    return component;
}
function setupComponent(instance) {
    // TODO
    initProps(instance, instance.vnode.props);
    // initSlots
    // 处理有状态的组件(setup)
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    const Component = instance.type;
    const { setup } = Component;
    if (setup) {
        // function object
        const setupResult = setup(instance.props);
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

function render(vnode, container) {
    // patch
    patch(vnode, container);
}
function patch(vnode, container) {
    // 根据type处理对应的逻辑， type为组件处理组件，type为element处理element
    // console.log("vnode",vnode.type)
    if (typeof vnode.type === "string") {
        processElement(vnode, container);
    }
    else if (isObject(vnode.type)) {
        processComponent(vnode, container);
    }
}
function processElement(vnode, container) {
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    const { type, props, children } = vnode;
    // const el = document.createElement(type)
    const el = (vnode.el = document.createElement(type));
    if (typeof children === "string") {
        el.textContent = children;
    }
    else if (isObject(children)) {
        mountChildren(children, el);
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
function mountChildren(vnode, container) {
    vnode.forEach(ele => {
        patch(ele, container);
    });
}
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
function mountComponent(initialVNode, container) {
    const instance = createComponentInstance(initialVNode);
    // 处理component
    setupComponent(instance);
    // 调用render, 处理subtree
    setupRenderEffect(instance, initialVNode, container);
}
function setupRenderEffect(instance, initialVNode, container) {
    const { proxy } = instance;
    const subTree = instance.render.call(proxy);
    //重新调用patch
    patch(subTree, container);
    // 当所有的节点都patch完后
    initialVNode.el = subTree.el;
    // console.log("subTree",subTree)
}

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

export { createApp, h };

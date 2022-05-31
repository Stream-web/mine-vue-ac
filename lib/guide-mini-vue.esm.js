const Fragment = Symbol("Fragment");
const Text = Symbol("Text");
function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        shapeFlag: getShapeFlag(type),
        el: null,
    };
    if (typeof children === "string") {
        vnode.shapeFlag |= 4 /* ShapeFlags.TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= 8 /* ShapeFlags.ARRAY_CHILDREN */;
    }
    // 组件 + children object
    if (vnode.shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
        if (typeof children === "object") {
            // 判断是一个对象 然后
            vnode.shapeFlag |= 16 /* ShapeFlags.SLOT_CHILDREN */;
        }
    }
    return vnode;
}
function createTextVnode(text) {
    return createVNode(Text, {}, text);
}
function getShapeFlag(type) {
    return typeof type === "string"
        ? 1 /* ShapeFlags.ELEMENT */
        : 2 /* ShapeFlags.STATEFUL_COMPONENT */;
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

function renderSlots(slots, name, props) {
    const slot = slots[name];
    if (slot) {
        // return createVNode("div",{},slot)
        if (typeof slot === "function") {
            return createVNode(Fragment, {}, slot(props));
        }
    }
    // 创建节点
}

// 设置所有可以共享的模块
const extend = Object.assign;
const isObject = (val) => {
    return val !== null && typeof val === "object";
};
const hasChanged = (val, newValue) => {
    return !Object.is(val, newValue);
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
const toHandleKey = (str) => {
    return str ? "on" + capitalize(str) : "";
};

let activeEffect;
let shouldTrack;
class ReactiveEffect {
    constructor(fn, scheduler) {
        this.deps = [];
        this.active = true;
        this._fn = fn;
        this.scheduler = scheduler;
    }
    // 调用run的时候说明是一个正在执行的状态
    run() {
        // 1、会收集依赖
        // shouldRrack 来区分
        if (!this.active) {
            return this._fn();
        }
        shouldTrack = true;
        activeEffect = this;
        const result = this._fn();
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
        // this.deps.forEach((dep:any)=>{
        //     dep.delete(this)
        // })
        // cleanupEffect(this);
    }
}
function cleanupEffect(effect) {
    effect.deps.forEach((dep) => {
        dep.delete(effect);
    });
    effect.deps.length = 0;
}
const targetMap = new Map();
function track(target, key) {
    // if (!activeEffect) return;
    // if(!shouldTrack) return;
    if (!isTracking())
        return;
    // set target -> key -> dep
    let depsMap = targetMap.get(target);
    // const dep = depsMap.get(key)
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    let dep = depsMap.get(key);
    if (!dep) {
        dep = new Set();
        // 设置错了
        depsMap.set(key, dep);
    }
    // dep.add(activeEffect)
    // activeEffect.deps.push(dep)
    // 可能是空的
    // 已经在dep中
    trackEffects(dep);
}
function trackEffects(dep) {
    if (dep.has(activeEffect))
        return;
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
}
function isTracking() {
    return shouldTrack && activeEffect !== undefined;
}
function trigger(target, key) {
    let depsMap = targetMap.get(target);
    let dep = depsMap.get(key);
    triggerReffects(dep);
}
function triggerReffects(dep) {
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
        // effect.run()
    }
}
function effect(fn, options = {}) {
    // fn
    const _effect = new ReactiveEffect(fn, options.scheduler);
    // extend(_effect, options);
    // _effect.onStop = options.onStop;
    // 更加优雅
    Object.assign(_effect, options);
    // extend
    extend(_effect, options);
    _effect.run();
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
}

const set = createSetter();
const get = createGetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
// import {}
function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key) {
        if (key === "_v_isReactive" /* ReactiveFlags.IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key === "_v_isReadonly" /* ReactiveFlags.IS_READONLY */) {
            return isReadonly;
        }
        const res = Reflect.get(target, key);
        if (shallow) {
            return res;
        }
        // 看看 res是不是object
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        // 依赖收集
        if (!isReadonly) {
            track(target, key);
        }
        return res;
    };
}
function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        // 触发依赖
        trigger(target, key);
        return res;
    };
}
const mutableHandlers = {
    get,
    set,
};
const readonlyHandlers = {
    get: readonlyGet,
    set(target, key) {
        console.warn(`key :"${String(key)}" set 失败，因为 target 是 readonly 类型`, target);
        return true;
    },
};
const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: shallowReadonlyGet,
});

function reactive(raw) {
    // 通过proxy进行代理操作
    // return new Proxy(raw,mutableHandlers)
    return createActiveObject(raw, mutableHandlers);
}
function readonly(raw) {
    return createActiveObject(raw, readonlyHandlers);
}
function shallowReadonly(raw) {
    return createActiveObject(raw, shallowReadonlyHandlers);
}
function createActiveObject(target, baseHandlers) {
    if (!isObject(target)) {
        console.log(`target ${target} 必须是一个对象`);
        return target;
    }
    return new Proxy(target, baseHandlers);
}

class RefIml {
    constructor(value) {
        this._v_isRef = true;
        this._rawValue = value;
        // this._value = isObject(value) ? reactive(value):value;
        this._value = convert(value);
        // 如果value是对象的话那么就要做一层处理把value->reactive
        // 1、看看value是不是对象
        this.dep = new Set();
    }
    get value() {
        trackRefValue(this);
        // trackEffects(this.dep);
        return this._value;
    }
    set value(newValue) {
        // 一定先去修改了value 的值
        // hasChanged
        // 对比的时候 object
        if (hasChanged(newValue, this._rawValue)) {
            this._rawValue = newValue;
            // this._value =  isObject(newValue) ? reactive(newValue):newValue;
            this._value = convert(newValue);
            triggerReffects(this.dep);
        }
    }
}
function convert(value) {
    return isObject(value) ? reactive(value) : value;
}
function trackRefValue(ref) {
    if (isTracking()) {
        trackEffects(ref.dep);
    }
}
function ref(value) {
    return new RefIml(value);
}
function isRef(ref) {
    return !!ref._v_isRef;
}
function unRef(ref) {
    // 如果是ref对象，那么直接返回出去就行了，如果不是ref
    return isRef(ref) ? ref.value : ref;
}
function proxyRefs(objectRefs) {
    return new Proxy(objectRefs, {
        get(target, key) {
            // get -> age (ref) 那么就能给他返回.value
            return unRef(Reflect.get(target, key));
        },
        set(target, key, value) {
            if (isRef(target[key]) && !isRef(value)) {
                return target[key].value = value;
            }
            else {
                return Reflect.set(target, key, value);
            }
        }
    });
}

function emit(instance, event, ...args) {
    console.log("emit", event);
    const { props } = instance;
    const toHandlerName = toHandleKey(camelize(event));
    const handler = props[toHandlerName];
    // TPP行为
    handler && handler(...args);
}

function initProps(instance, rawProps) {
    // arrts
    instance.props = rawProps || {};
}

const publicPropertiesMap = {
    // if(key === "$el"){
    //     return instance.vnode.el;
    // }
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots,
};
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        // setupstate
        const { setupState, props } = instance;
        if (key in setupState) {
            return setupState[key];
        }
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        // debugger
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    }
};

function initSlots(instance, children) {
    // children object
    // instance.slots = Array.isArray(children) ? children : children;
    const { vnode } = instance;
    if (vnode.shapeFlag & 16 /* ShapeFlags.SLOT_CHILDREN */) {
        normallizeObjectSlots(children, instance.slots);
    }
    normallizeObjectSlots(children, instance.slots);
}
function normallizeObjectSlots(children, slots) {
    // const slots = {};
    for (const key in children) {
        const value = children[key];
        // slot
        slots[key] = (props) => normalizeSlotsValue(value(props));
    }
    // instance.slots = slots
}
function normalizeSlotsValue(value) {
    return Array.isArray(value) ? value : [value];
}

// import { initSlots } from "./componentSlots";
function createComponentInstance(vnode, parent) {
    console.log("createComponentInstance", parent);
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        slots: {},
        provides: parent ? parent.provides : {},
        parent,
        subTree: {},
        isMounted: false,
        emit: () => { }
    };
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    // to-do
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    // 创建有状态的组件
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const Component = instance.type;
    // ctx
    //     {
    //     // {_:instance},
    //     get(target,key){
    //         // setupstate
    //         const { setupState} = instance;
    //         if(key in setupState){
    //             return setupState[key];
    //         }
    //         // debugger
    //         if(key === "$el"){
    //             return instance.vnode.el;
    //         }
    //     }
    // }
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    const { setup } = Component;
    if (setup) {
        // fucntion object
        // currentInstance = instance;
        setCurrentInstance(instance);
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit
        });
        setCurrentInstance(null);
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // Implent
    // TODO
    if (typeof setupResult === "object") {
        instance.setupState = proxyRefs(setupResult);
    }
    // 保证组件有值
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    // if(Component.render){
    instance.render = Component.render;
    // }
}
let currentInstance = null;
function getCurrentInstance() {
    return currentInstance;
}
// 方便维护
function setCurrentInstance(instance) {
    currentInstance = instance;
}

function provide(key, value) {
    // 存
    // key value
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        let { provides } = currentInstance;
        const parentProvides = currentInstance.parent.parentProvides;
        // init
        if (provides === parentProvides) {
            provides = currentInstance.provides = Object.create(parentProvides);
        }
        provides[key] = value;
    }
}
function inject(key, defaultValue) {
    // 取
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        // const { parent } = currentInstance
        const parentProvides = currentInstance.parent.provides;
        if (key in parentProvides) {
            return parentProvides[key];
        }
        else if (defaultValue) {
            if (typeof defaultValue === "function") {
                return defaultValue();
            }
            return defaultValue;
        }
    }
}

// import { render } from "./render";
// render
function createAppAPI(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                // 先转化成vnode
                // 所有的逻辑操作都会基于虚拟节点
                const vnode = createVNode(rootComponent);
                render(vnode, rootContainer);
            }
        };
    };
}

function createRenderer(options) {
    // const {
    //     createElement,
    //     // hostCreateElement,
    //     patchProp,
    //     // :
    //     // hostPatchProp,
    //     insert
    //     // :hostInsert
    // } = options
    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert, } = options;
    function render(vnode, container) {
        // patch
        patch(null, vnode, container, null);
    }
    // n1-> 老的
    // n2 -> 新的
    function patch(n1, n2, container, parentComponent) {
        // 如果是component 那么它的type是一个object类型，如果是element类型，那么它是div
        // console.log('vnode.type',vnode.type);
        const { type, shapeFlag } = n2;
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent);
                break;
            case Text:
                processText(n1, n2, container);
                break;
            default:
                if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
                    processElement(n1, n2, container, parentComponent);
                }
                else if (shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
                    processComponent(n1, n2, container, parentComponent);
                }
                break;
        }
        // 去处理组件
        // 判断是不是element类型
        // todo-如何区分element 和component类型
        // processElement();
        // processComponent(vnode,container)
    }
    function processText(n1, n2, container) {
        // throw new Error('Function not implemented.');
        const { children } = n2;
        // children
        const textNode = (n2.el = document.createTextNode(children));
        container.append(textNode);
    }
    function processFragment(n1, n2, container, parentComponent) {
        mountChildren(n2, container, parentComponent);
    }
    // 元素
    function processElement(n1, n2, container, parentComponent) {
        if (!n1) {
            mountElement(n2, container, parentComponent);
        }
        else {
            patchElement(n1, n2);
        }
    }
    function patchElement(n1, n2, container) {
        console.log("n1", "n1");
        console.log("n2", n2);
    }
    // 组件
    function processComponent(n1, n2, container, parentComponent) {
        mountComponent(n2, container, parentComponent);
    }
    // mount
    function mountElement(vnode, container, parentComponent) {
        // vnode -> element -> div
        // canvans : new element
        // 
        const el = (vnode.el = hostCreateElement(vnode.type));
        // el.text 
        // str{ing 或者array类型
        const { children, shapeFlag } = vnode;
        if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
            el.textContent = children;
        }
        else if (shapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
            // vnode
            mountChildren(vnode, el, parentComponent);
        }
        // el.textContent = children;
        // el.textContent = children;
        // props 
        const { props } = vnode;
        for (const key in props) {
            const val = props[key];
            hostPatchProp(el, key, val);
        }
        // el.setAttribute("id","root");
        // container.append(el);
        // document.body.appendChild(el);
        hostInsert(el, container);
    }
    function mountChildren(vnode, container, parentComponent) {
        vnode.children.forEach((v) => {
            patch(null, v, container, parentComponent);
        });
    }
    //Vnode -> initialVNode，让代码更具有可读性
    function mountComponent(initialVNode, container, parentComponent) {
        const instance = createComponentInstance(initialVNode, parentComponent);
        setupComponent(instance);
        setupRenderEffect(instance, initialVNode, container);
    }
    function setupRenderEffect(instance, initialVNode, container) {
        effect(() => {
            if (!instance.isMounted) {
                console.log('初始化');
                const { proxy } = instance;
                // throw new Error("Function not implemented.");
                const subTree = (instance.subTree = instance.render.call(proxy));
                console.log("subTree", subTree);
                // vnode -> patch
                // vnode -> element -> mountElement
                patch(null, subTree, container, instance);
                // element -> mount
                initialVNode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                console.log('更新');
                const { proxy } = instance;
                // throw new Error("Function not implemented.");
                const subTree = instance.render.call(proxy);
                const prevSubTree = instance.subTree;
                instance.subTree = subTree;
                patch(prevSubTree, subTree, container, instance);
                console.log("prevSubTree", prevSubTree);
                console.log("cur", subTree);
            }
        });
    }
    return {
        createApp: createAppAPI(render)
    };
}

function createElement(type) {
    // console.log("createEkement------------");
    return document.createElement(type);
}
function patchProp(el, key, val) {
    // console.log("patchProp------------");
    // const val = props[key];
    // 具体的click -> 通用
    // on + Evenet name
    // onMousedown 
    const isOn = (key) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, val);
    }
    else {
        el.setAttribute(key, val);
    }
    el.setAttribute(key, val);
}
function insert(el, parent) {
    // console.log("insert------------");
    parent.append(el);
}
const renderer = createRenderer({
    createElement,
    patchProp,
    insert
});
function createApp(...args) {
    return renderer.createApp(...args);
}

export { createApp, createRenderer, createTextVnode, getCurrentInstance, h, inject, provide, proxyRefs, ref, renderSlots };

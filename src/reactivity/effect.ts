class ReactiveEffect {
    private _fn: any;
    constructor(fn) {
        this._fn = fn;
    }
    // 调用run的时候说明是一个正在执行的状态
    run(){
        activeEffect = this;
        return this._fn();
    }
}
const targetMap = new Map()
export function track(target,key) {
    // set target -> key -> dep
    let depsMap = targetMap.get(target);

    // const dep = depsMap.get(key)
    if(!depsMap){
        depsMap = new Map()
        targetMap.set(target,depsMap);
    }
    let dep = depsMap.get(key);
    if(!dep) {
        dep = new Set();
        // 设置错了
        depsMap.set(key,dep)
    }
    dep.add(activeEffect)

}
export function trigger(target,key) {
    let depsMap = targetMap.get(target);
    let dep = depsMap.get(key);

    for(const effect of dep) {
        effect.run()
    }
}
let activeEffect;
export function effect (fn) {
    // fn
    const _effect = new ReactiveEffect(fn);

    _effect.run();
    return _effect.run.bind(_effect);
}
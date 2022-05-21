import { extend } from "../shared/idnex";
let activeEffect;
let shouldTrack;
export class ReactiveEffect {
    private _fn: any;
    deps = [];
    active = true;
    onStop?:()=>void;
    public scheduler:Function | undefined;
    constructor(fn, scheduler?: Function) {
        this._fn = fn;
        this.scheduler = scheduler
    }
    // 调用run的时候说明是一个正在执行的状态
    run(){
        
        // 1、会收集依赖
        // shouldRrack 来区分
        if(!this.active){
            return this._fn();
        }
        shouldTrack = true;
        activeEffect = this;
        const result = this._fn()
        shouldTrack = false;
        return result;
    }
    stop() {
        if(this.active){
            cleanupEffect(this);
            if(this.onStop){
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
function cleanupEffect(effect){
    effect.deps.forEach((dep: any) => {
        dep.delete(effect);
    });
    effect.deps.length = 0;
}
const targetMap = new Map()
export function track(target,key) {
    // if (!activeEffect) return;
    // if(!shouldTrack) return;
    if(!isTracking()) return;
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
    // dep.add(activeEffect)
    // activeEffect.deps.push(dep)
    // 可能是空的
// 已经在dep中
    trackEffects(dep);
}

export function trackEffects(dep){
    if(dep.has(activeEffect)) return;
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
}
export function isTracking(){
    return shouldTrack && activeEffect !== undefined;
}
export function trigger(target,key) {
    let depsMap = targetMap.get(target);
    let dep = depsMap.get(key);

    triggerReffects(dep);
}
export function triggerReffects(dep){
    for(const effect of dep) {
        if(effect.scheduler){
            effect.scheduler()
        } else {
            effect.run();
        }
        // effect.run()
    } 
}
export function effect(fn, options: any = {}) {
    // fn
    const _effect = new ReactiveEffect(fn, options.scheduler);
    // extend(_effect, options);
    // _effect.onStop = options.onStop;
    // 更加优雅
    Object.assign(_effect,options);

    // extend
    extend(_effect,options);

    _effect.run();
  
    const runner: any = _effect.run.bind(_effect);
    runner.effect = _effect;
  
    return runner;
  }
  
  export function stop(runner) {
    runner.effect.stop();
  }
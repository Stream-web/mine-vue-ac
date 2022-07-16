import { getCurrentInstance } from "./component";

export function provide(key,value){
    // 存
    // key value
    const currentInstance: any = getCurrentInstance()
// 原型链的思想
    if(currentInstance){
        let { provides } = currentInstance;
        
        const parentProvides = currentInstance.parent.parentProvides
        // init
        // 当前值和父级的值相等的时候就会执行初始化的操作
        if(provides === parentProvides){
            provides = currentInstance.provides = Object.create(parentProvides);
        }
        provides[key] = value; 
    }

}
export function inject(key,defaultValue){
    // 取
    const currentInstance:any = getCurrentInstance();

    if(currentInstance){
        // const { parent } = currentInstance

        const parentProvides = currentInstance.parent.provides

        if(key in parentProvides){
            return parentProvides[key]
        } else if(defaultValue){
            // 判断有没有默认值, 有没有函数 如果是函数的话就执行函数
            if(typeof defaultValue === "function"){
                return defaultValue()
            }
            return defaultValue
        }
    }
}
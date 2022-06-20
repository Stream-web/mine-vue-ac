// mini-vue出口
export * from "./runtime-dom"
import { baseCompile } from "./complier-core/src/compile"
import * as runtimeDom from "./runtime-dom"
import { registerRuntimeCompiler } from './runtime-core'
function compileTofunction(template){
    const { code } = baseCompile(template);
    const render = new Function("Vue",code)(runtimeDom)
    return render;
    // function renderFunction(){

    // }
}
registerRuntimeCompiler(compileTofunction);
import { h } from '../../lib/guide-mini-vue.esm.js'

export const App = {
// 假设用户写的时候必须要用render
    // .vue
    // <template></template>
    // render
    render() {
        return h(
        "div",
        {
            id:"root",
            class:["red","hard"],
        },
        [h("p",{class:"red"},"hi"),h("p",{class:"blue"},"mini-vue")]
        );
    },
    setup(){
        // 
        return {
            msg:"mini-vue"
        }
    }
}
import { h } from '../../lib/guide-mini-vue.esm.js'

window.self = null
export const App = {
// 假设用户写的时候必须要用render
    // .vue
    // <template></template>
    // render
    render() {
        window.self = this;
        return h(
        "div",
        {
            id:"root",
            class:["red","hard"],
        },
        // this.$el -> get root element
        // [h("p",{class:"red"},"hi"),h("p",{class:"blue"},"mini-vue")]
        // setupState
        "hi,"+this.msg
        );
    },
    setup(){
        // 
        return {
            msg:"mini-vue-haha"
        }
    }
}
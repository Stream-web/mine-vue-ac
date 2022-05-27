import { h,renderSlots } from "../../lib/guide-mini-vue.esm.js";

// Fragment 以及 Text
export const Foo = {
    setup() {
        return {};
    },
    render() {
        const foo = h("p",{},
        // {
        //     header:h("p",{},"header"),
        //     footer:h("p",{},"footer")
        // }
        "foo"
        );
//      children -> vnode
// 
//      renderSlots
// 1. 获取到要渲染的元素
// 2、获取到渲染的位置
// 具名插槽:渲染到指定的位置
// 作用域插槽
        console.log(this.$slots)

        const age = 18;
        return  h("div", {}, [
            renderSlots(this.$slots, "header", {
              age,
            }),
            foo,
            renderSlots(this.$slots, "footer"),
          ]);
    },
};

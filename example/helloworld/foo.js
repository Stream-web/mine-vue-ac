import { h } from "../../lib/guide-mini-vue.esm.js"

export const Foo = {
    setup(props) {
        // props.count
        console.log(props)
        // shallow readonly
        props.count++
        // 3.
        // props：readonly
    },
    render() {
        return h("div",{},"foo:"+this.count);
    },
}
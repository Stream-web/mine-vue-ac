import { h } from "../../lib/guide-mini-vue.esm.js";
import { Foo } from "./Foo.js";

export const App = {
  name: "App",
  render() {
    // emit
    // return h("div", {}, [
    //   h("div", {}, "App"),
    //   h(Foo, {
    //     onAdd(a, b) {
    //       console.log("onAdd", a, b);
    //     },
    //     onAddFoo() {
    //       console.log("onAddFoo");
    //     },
    //   }),
    // ]);
    return h("div",{},[h("div",{},"App"),
    h(Foo,{
      // on +event
      onAdd(a,b){
        console.log("onAdd",a,b);
      },
      // add-foo -> addFoo
      onAddFoo(){
        console.log("onAddFoo");
      }
    })]);
  },

  setup() {
    return {};
  },
};

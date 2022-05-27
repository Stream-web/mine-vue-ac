import { h } from "../../lib/guide-mini-vue.esm.js";
import { Foo } from "./Foo.js";

// Fragment 以及 Text
export const App = {
  name: "App",
  render() {
      const app = h("div",{},"App");
    //   要支持用户使用数组的形式或者单值
    //   const foo = h(Foo,{},[h("p",{},"123"),h("p",{},"456")]);
    const foo = h(
        Foo,
        {},
        // [h("p",{},"123")]
        {
            header:({ age })=>h("p",{},"header"+age),
            footer:()=>h("p",{},"footer"),
        }
        );
      return h("div",{},[app,foo]);
  },
  setup() {
      return {};
  }
};

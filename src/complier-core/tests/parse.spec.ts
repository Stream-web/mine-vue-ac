import { NodeTypes } from "../src/ast";
import { baseParse } from "../src/parse"
describe('Parse',() =>{
    describe("interpolation", () => {
        test("simple interpolation", () => {
          const ast = baseParse("{{ message }}");
    
          expect(ast.children[0]).toStrictEqual({
            type: NodeTypes.INTERPOLATION,
            content: {
              type: NodeTypes.SIMPLE_EXPRESSION,
              content: "message",
            },
          });
        });
      });
})
describe('element',() =>{
    it("simple element div", () => {
        test("simple interpolation", () => {
          const ast = baseParse("<div></div>");
    
          expect(ast.children[0]).toStrictEqual({
            type: NodeTypes.ELEMENT,
            tag:"div",
          });
        });
      });
})
// describe('text',() =>{
//     it("simple text", () => {
//         // test("simple text", () => {
//           const ast = baseParse("some text");
//     // 当不是插值的时候 也不是element的时候，默认处理的是text
//           expect(ast.children[0]).toStrictEqual({
//             type: NodeTypes.TEXT,
//             tag:"some text",
//           });
//         // });
//       });
// })
describe("text", () => {
    it("simple text", () => {
      const ast = baseParse("some text");

      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.TEXT,
        content: "some text"
      });
    });
});


import { isReadonly, shallowReadonly } from "../reactive";

describe("shallowReadonly", () => {
    // 表层是一个readOnly，内部的话是一个响应式的对象
  test("should not make non-reactive properties reactive", () => {
    const props = shallowReadonly({ n: { foo: 1 } });
    expect(isReadonly(props)).toBe(true);
    expect(isReadonly(props.n)).toBe(false);
  });
  it("should call console.warn when set", () => {
    console.warn = jest.fn();
    const user = shallowReadonly({
      age: 10,
    });

    user.age = 11;
    expect(console.warn).toHaveBeenCalled();
  });
});
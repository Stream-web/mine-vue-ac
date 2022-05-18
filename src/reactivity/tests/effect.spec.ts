import { reactive } from "../reactive";
import { effect } from "../effect";
describe("effect",() =>{
    it("happy path",() =>{
        const user = reactive({
            age:10,
        });
        let nextAge;
        effect(()=>{
            // fn
            nextAge = user.age+1;
        })
        expect(nextAge).toBe(11);
        // update
        user.age++;
        expect(nextAge).toBe(12);
    })
    // runner should return runner when call effect
    it("runner should return runner when call effect",() =>{
        //调用effect -> 会返回runner -> 然后继续执行传入内部的fn，调用fn的时候 返回值 ->return
        let foo =10;
        const runner = effect(()=>{
            foo++;
            return "foo";
        });
        expect(foo).toBe(11);
        const r  = runner();
        expect(foo).toBe(12);
        expect(r).toBe("foo");
    })
    it("scheduler",() =>{
        // 1
        let dummy;
        let run: any;
        const scheduler = jest.fn(() => {
          run = runner;
        });
        const obj = reactive({ foo: 1 });
        const runner = effect(
          () => {
            dummy = obj.foo;
          },
          { scheduler }
        );
        expect(scheduler).not.toHaveBeenCalled();
        expect(dummy).toBe(1);
        // should be called on first trigger
        obj.foo++;
        expect(scheduler).toHaveBeenCalledTimes(1);
        // // should not run yet
        expect(dummy).toBe(1);
        // // manually run
        run();
        // // should have run
        expect(dummy).toBe(2);
    })
})


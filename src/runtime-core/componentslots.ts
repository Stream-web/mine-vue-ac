import { ShapeFlags } from "../shared/ShapeFlags"
export function initSlots(instance,children){
    // children object
    // instance.slots = Array.isArray(children) ? children : children;

    const { vnode } = instance
    if(vnode.shapeFlag & ShapeFlags.SLOT_CHILDREN) {
        normallizeObjectSlots(children,instance.slots);
    }
    // normallizeObjectSlots(children,instance.slots)
}
function normallizeObjectSlots(children:any,slots:any){
    // const slots = {};

    for(const key in children){
        const value = children[key];
        // slot
        slots[key] = (props) => normalizeSlotsValue(value(props))
    }

    // instance.slots = slots
}
function normalizeSlotsValue(value){
    return Array.isArray(value) ? value : [value];
}
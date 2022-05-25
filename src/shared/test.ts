const ShapeFlags = {
    element:0,
    stateful_component:0,
    text_children:0,
    array_children:0,
}
// js编译之后通过位运算的方式计算比通过对象的方式要快得多 但是这样的话可读性就很差
// vnode -> stateful_component ->
// 1.可以设置修改
// ShapeFlags.stateful_component =1;
// ShapeFlags.array_children = 1;
// 2.可以设置查找
// if(shapeflage.element)
// 不够高效-》位运算的方式

// 0000
// 0001 -> element
// 0010 -> stateful
// 0100 -> text_children
// 1000 -> array_children

//  |  
// &
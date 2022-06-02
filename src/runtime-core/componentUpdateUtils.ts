export function shouldUpdateComponent(prevVnode,nextVnode){
    const {props:prevPros} = prevVnode
    const {props:nextProps} = nextVnode

    for(const key in nextProps){
        if(nextProps[key] !== prevPros[key]){
            return true
        }
    }
    return false;
}
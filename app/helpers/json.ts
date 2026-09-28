const checkIsRegExp = (value: any): value is RegExp => {
    if(typeof value !== 'object'){
        return false;
    }
    return 'test' in value && typeof value.test === 'function';
};

export const ROUTE_JSON_REPLACER = (_key: string, value: any) => {
    const isValueRexExp = checkIsRegExp(value);
    if(isValueRexExp){
        return value.source;
    }
    if(typeof value === 'function'){
        return (value as Function).name;
    }
    return value;
};
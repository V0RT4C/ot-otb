import { Item } from "./Item.ts";
import { FLAG_NAME, ITEM_ATTRIBUTE_NAME } from "../const.ts";

export const isNumberCheck = (value : any) : void => {
    if (typeof value !== 'number'){
        throw new Error('Not a number.');
    }
}

export const isIntegerCheck = (value : any) : void => {
    isNumberCheck(value);
    if (!Number.isInteger(value)){
        throw new Error('Not an integer.');
    }
}

export const isUint8Check = (value : any) : void => {
    isNumberCheck(value);
    isIntegerCheck(value);
    if (!(value >= 0 && value <= 255)){
        throw new Error('Not an unsigned byte.');
    }
}

export const isUint16Check = (value : any) : void => {
    isNumberCheck(value);
    isIntegerCheck(value);
    if (!(value >= 0 && value <= 65535)){
        throw new Error('Not an unsigned short.');
    }
}

export const isUint32Check = (value : any) : void => {
    isNumberCheck(value);
    isIntegerCheck(value);
    if (!(value >= 0 && value <= 4294967295)){
        throw new Error('Not an unsigned integer.');
    }
}

export const isStringCheck = (value : any) : void => {
    if (typeof value !== 'string'){
        throw new Error('Not a string.');
    }
}

export const isUint8ArrayCheck = (value : any) : void => {
    if (!(value instanceof Uint8Array)){
        throw new Error('Not an Uint8Array.');
    }
}

export const isItemCheck = (value : any) : void => {
    if (!(value instanceof Item)){
        throw new Error('Not an Item.');
    }
}

export const isValidItemsMajorVersion = (value : number) : void => {
    if (value < 1 || value > 3){
        throw new Error('itemsMajorVersion has to be between 1 and 3');
    }
}

export const isValidItemAttributeNameCheck = (value : string) : void => {
    isStringCheck(value);
    const attributeNames = Object.values(ITEM_ATTRIBUTE_NAME);
    for (const attrName of attributeNames){
        if (attrName === value){
            return;
        }
    }

    throw new Error('Invalid item attribute.');
}

export const isValidFlagNameCheck = (value : string) : void => {
    isStringCheck(value);
    const flagNames = Object.values(FLAG_NAME);
    for (const flagName of flagNames){
        if (flagName === value){
            return;
        }
    }

    throw new Error('Invalid flag.');
}
import { Byt3s } from "./lib/bytes/Bytes.ts";
import { ITEM_GROUP, NODE_SPECIAL_BYTE } from "./const.ts";
import { RootNode } from "./lib/RootNode.ts";
import { Item } from "./lib/Item.ts";

export class OTBReader extends Byt3s {
    private _rootNode! : RootNode;

    private _getNextSpecialBytePosition(){
        let nextSpecialBytePosition! : number;
        let previousPosition = this.position;
        let hasEscaped = false;

        while(this.position < this.byteLength){
            const byte = this.escapeReadByte();

            if ((this.position - previousPosition) > 1){
                hasEscaped = true;
            }else{
                hasEscaped = false;
            }

            previousPosition = this.position;

            if (
                (byte === NODE_SPECIAL_BYTE.START && !hasEscaped) ||
                (byte === NODE_SPECIAL_BYTE.END && !hasEscaped)
            ){
                nextSpecialBytePosition = this.position - 1;
                break;
            }
        }

        return nextSpecialBytePosition;
    }

    private _readRootNode() : { itemsMinorVersion: number, itemsMajorVersion: number, itemsBuildNumber: number } {
        this.position = 0;
        this.position = this._getNextSpecialBytePosition();
        this.readByte(); //0xFE - Node start
        this.position += 5; //Skip 5 bytes
        const attribute = this.readByte();
        const dataLength = this.escapeReadUint16LE();
        const itemsMajorVersion = this.escapeReadUint32LE();
        const itemsMinorVersion = this.escapeReadUint32LE();
        const itemsBuildNumber = this.escapeReadUint32LE();

        if (itemsMajorVersion < 1 || itemsMajorVersion > 3){
            throw new Error('This file is not supported. Only OTB Versions 1, 2 and 3 are supported.');
        }

        return {
            itemsMinorVersion,
            itemsMajorVersion,
            itemsBuildNumber
        }
    }

    public parse(){
        const { itemsMajorVersion, itemsMinorVersion, itemsBuildNumber } = this._readRootNode();
        this._rootNode = new RootNode(itemsMajorVersion, itemsMinorVersion, itemsBuildNumber);

        while(this.position < this.byteLength){
            this._readNextNode();
        }

        return this._rootNode;
    }

    private _readNextNode(){
        const startPosition = this._getNextSpecialBytePosition();
        const endPosition = this._getNextSpecialBytePosition();

        if (this[startPosition] !== NODE_SPECIAL_BYTE.START || this[endPosition] !== NODE_SPECIAL_BYTE.END){
            if (this.position === this.byteLength){
                return;
            }

            throw new Error(`Special byte position parse error. startPosition: ${startPosition}, endPosition: ${endPosition}, currentPosition: ${this.position}, byteLength: ${this.byteLength}`);
        }

        //Skip node start byte
        this.position = startPosition + 1;

        let item : Item = new Item();
        item.group = this.readByte();

        if (item.group === ITEM_GROUP.DEPRECATED){
            this.position = endPosition + 1;
            return;
        }

        if (this._rootNode.itemsMajorVersion === 1){
            item.setItemTypeOTBV1();
        }
        else if (this._rootNode.itemsMajorVersion === 2){
            item.setItemTypeOTBV2();
        }
        else if (this._rootNode.itemsMajorVersion === 3){
            item.setItemTypeOTBV3();
        }else{
            throw new Error(`ItemsMajorVersion: ${this._rootNode.itemsMajorVersion} is not supported`);
        }

        const flags = this.escapeReadUint32LE();
        (item as Item).setFlags(flags);

        item.setAttributesFromBuffer(this, endPosition);

        this.position = endPosition + 1;

        this._rootNode.children.push(item);
    }
}
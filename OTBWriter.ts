import { RootNode } from "./lib/RootNode.ts";
import { Byt3s } from "./lib/bytes/Bytes.ts";
import { Item } from "./lib/Item.ts";
import { ITEM_ATTRIBUTE, ITEM_ATTRIBUTE_NAME, NODE_SPECIAL_BYTE } from "./const.ts";
import {
    isNumberCheck,
    isStringCheck, isUint16Check,
    isUint32Check,
    isUint8ArrayCheck, isUint8Check
} from "./lib/checks.ts";

export class OTBWriter {
    constructor(private _rootNode : RootNode){}

    private _buffer : Byt3s = new Byt3s(5000000);
    //Fixed 5MB for now, slicing will be done to get real size later. But this is much quicker than allocating
    //new memory all the time as the buffer increases

    public writeBuffer(){
        this._buffer.escapeWriteUint32LE(0);
        this._buffer.writeByte(NODE_SPECIAL_BYTE.START);
        this._writeRootNode();

        for (const item of this._rootNode.children){
            this._writeItemNode(item as Item);
        }

        this._buffer.writeByte(NODE_SPECIAL_BYTE.END);
        return this._buffer.slice(0, this._buffer.position);
    }

    private _writeRootNode(){
        this._buffer.writeByte(0);

        this._buffer.escapeWriteUint32LE(0);
        this._buffer.writeByte(1);

        this._buffer.escapeWriteUint16LE(140);

        isUint32Check(this._rootNode.itemsMajorVersion);
        isUint32Check(this._rootNode.itemsMinorVersion);
        isUint32Check(this._rootNode.itemsBuildNumber);

        this._buffer.escapeWriteUint32LE(this._rootNode.itemsMajorVersion);
        this._buffer.escapeWriteUint32LE(this._rootNode.itemsMinorVersion);
        this._buffer.escapeWriteUint32LE(++this._rootNode.itemsBuildNumber);

        let startPos = this._buffer.position;
        for (let i=0; i < startPos + 128; i++){
            this._buffer.writeByte(0);
        }
    }

    private _writeItemNode(item : Item){
        this._buffer.writeByte(NODE_SPECIAL_BYTE.START);

        isUint8Check(item.group);
        this._buffer.writeByte(item.group);

        const flagsInt = item.getFlagsInt();
        isUint32Check(flagsInt);
        this._buffer.escapeWriteUint32LE(flagsInt);

        this._writeAttributes(item);
        this._buffer.writeByte(NODE_SPECIAL_BYTE.END);
    }

    private _writeAttributes(item : Item){

        this._buffer.escapeWriteByte(ITEM_ATTRIBUTE.SERVERID);
        this._buffer.escapeWriteUint16LE(2);

        if (item.serverId){
            isUint16Check(item.serverId);
            this._buffer.escapeWriteUint16LE(item[ITEM_ATTRIBUTE_NAME.SERVERID]);
        }else{
            this._buffer.escapeWriteUint16LE(0);
        }

        this._buffer.escapeWriteByte(ITEM_ATTRIBUTE.CLIENT_ID);
        this._buffer.escapeWriteUint16LE(2);

        if (item.clientId){
            isUint16Check(item.clientId);
            this._buffer.escapeWriteUint16LE(item[ITEM_ATTRIBUTE_NAME.CLIENT_ID]);
        }
        else{
            this._buffer.escapeWriteUint16LE(0);
        }

        let lightAttributesAdded = false;

        for (const attribute in item.attributes){
            switch(attribute){
                case ITEM_ATTRIBUTE_NAME.NAME:
                    isStringCheck(item.attributes[ITEM_ATTRIBUTE_NAME.NAME]);
                    this._buffer.writeByte(ITEM_ATTRIBUTE.NAME);
                    this._buffer.escapeWriteString(item.attributes[ITEM_ATTRIBUTE_NAME.NAME] as string);
                    break;
                case ITEM_ATTRIBUTE_NAME.DESCRIPTION:
                    isStringCheck(item.attributes[ITEM_ATTRIBUTE_NAME.DESCRIPTION]);
                    this._buffer.writeByte(ITEM_ATTRIBUTE.DESCRIPTION);
                    this._buffer.escapeWriteString(item.attributes[ITEM_ATTRIBUTE_NAME.DESCRIPTION] as string);
                    break;
                case ITEM_ATTRIBUTE_NAME.SPRITEHASH:
                    isUint8ArrayCheck(item.attributes[ITEM_ATTRIBUTE_NAME.SPRITEHASH]);
                    this._buffer.writeByte(ITEM_ATTRIBUTE.SPRITEHASH);
                    this._buffer.escapeWriteUint16LE((item.attributes[ITEM_ATTRIBUTE_NAME.SPRITEHASH] as Uint8Array).length);
                    this._buffer.escapeWriteBytes(item.attributes[ITEM_ATTRIBUTE_NAME.SPRITEHASH] as Uint8Array);
                    break;
                case ITEM_ATTRIBUTE_NAME.SPEED:
                    isUint16Check(item.attributes[ITEM_ATTRIBUTE_NAME.SPEED]);
                    this._buffer.writeByte(ITEM_ATTRIBUTE.SPEED);
                    this._buffer.escapeWriteUint16LE(2);
                    this._buffer.escapeWriteUint16LE(item.attributes[ITEM_ATTRIBUTE_NAME.SPEED] as number);
                    break;
                case ITEM_ATTRIBUTE_NAME.LIGHT_LEVEL:
                case ITEM_ATTRIBUTE_NAME.LIGHT_COLOR:{
                    if (item.attributes[ITEM_ATTRIBUTE_NAME.LIGHT_LEVEL] && item.attributes[ITEM_ATTRIBUTE_NAME.LIGHT_COLOR] && !lightAttributesAdded){

                        isUint16Check(item.attributes[ITEM_ATTRIBUTE_NAME.LIGHT_LEVEL]);
                        isUint16Check(item.attributes[ITEM_ATTRIBUTE_NAME.LIGHT_COLOR]);

                        if (this._rootNode.itemsMajorVersion === 2){
                            this._buffer.writeByte(ITEM_ATTRIBUTE.LIGHT2);
                        }else if (this._rootNode.itemsMajorVersion === 3){
                            this._buffer.writeByte(ITEM_ATTRIBUTE.LIGHT3);
                        }else{
                            this._buffer.writeByte(ITEM_ATTRIBUTE.LIGHT);
                        }

                        this._buffer.escapeWriteUint16LE(4);
                        this._buffer.escapeWriteUint16LE(item.attributes[ITEM_ATTRIBUTE_NAME.LIGHT_LEVEL] as number);
                        this._buffer.escapeWriteUint16LE(item.attributes[ITEM_ATTRIBUTE_NAME.LIGHT_COLOR] as number);
                        lightAttributesAdded = true;
                    }
                }
                break;
                case ITEM_ATTRIBUTE_NAME.TOPORDER:
                    isUint8Check(item.attributes[ITEM_ATTRIBUTE_NAME.TOPORDER]);
                    this._buffer.writeByte(ITEM_ATTRIBUTE.TOPORDER);
                    this._buffer.escapeWriteUint16LE(1);
                    this._buffer.writeByte(item.attributes[ITEM_ATTRIBUTE_NAME.TOPORDER] as number);
                    break;
                case ITEM_ATTRIBUTE_NAME.MAXITEMS:
                    isUint16Check(item.attributes[ITEM_ATTRIBUTE_NAME.MAXITEMS]);
                    this._buffer.writeByte(ITEM_ATTRIBUTE.MAXITEMS);
                    this._buffer.escapeWriteUint16LE(2);
                    this._buffer.escapeWriteUint16LE(item.attributes[ITEM_ATTRIBUTE_NAME.MAXITEMS] as number);
                    break;
                case ITEM_ATTRIBUTE_NAME.WEIGHT:
                    isNumberCheck(item.attributes[ITEM_ATTRIBUTE_NAME.WEIGHT]);
                    this._buffer.writeByte(ITEM_ATTRIBUTE.WEIGHT);
                    this._buffer.escapeWriteUint16LE(8);
                    this._buffer.escapeWriteUint64LE(item.attributes[ITEM_ATTRIBUTE_NAME.WEIGHT] as number);
                    break;
                case ITEM_ATTRIBUTE_NAME.MINIMAPCOLOR:
                    isUint16Check(item.attributes[ITEM_ATTRIBUTE_NAME.MINIMAPCOLOR]);
                    this._buffer.writeByte(ITEM_ATTRIBUTE.MINIMAPCOLOR);
                    this._buffer.escapeWriteUint16LE(2);
                    this._buffer.escapeWriteUint16LE(item.attributes[ITEM_ATTRIBUTE_NAME.MINIMAPCOLOR] as number);
                    break;
                case ITEM_ATTRIBUTE_NAME.ROTATETO:
                    isUint16Check(item.attributes[ITEM_ATTRIBUTE_NAME.ROTATETO]);
                    this._buffer.writeByte(ITEM_ATTRIBUTE.ROTATETO);
                    this._buffer.escapeWriteUint16LE(2);
                    this._buffer.escapeWriteUint16LE(item.attributes[ITEM_ATTRIBUTE_NAME.ROTATETO] as number);
                    break;
                case ITEM_ATTRIBUTE_NAME.MAX_WRITE_LENGTH:
                    isUint16Check(item.attributes[ITEM_ATTRIBUTE_NAME.MAX_WRITE_LENGTH]);
                    this._buffer.writeByte(ITEM_ATTRIBUTE.MAX_WRITE_LENGTH);
                    this._buffer.escapeWriteUint16LE(2);
                    this._buffer.escapeWriteUint16LE(item.attributes[ITEM_ATTRIBUTE_NAME.MAX_WRITE_LENGTH] as number);
                    break;
                case ITEM_ATTRIBUTE_NAME.MAX_READ_LENGTH:
                    isUint16Check(item.attributes[ITEM_ATTRIBUTE_NAME.MAX_READ_LENGTH]);
                    this._buffer.writeByte(ITEM_ATTRIBUTE.MAX_READ_LENGTH);
                    this._buffer.escapeWriteUint16LE(2)
                    this._buffer.escapeWriteUint16LE(item.attributes[ITEM_ATTRIBUTE_NAME.MAX_READ_LENGTH] as number);
                    break;
            }
        }
    }
}
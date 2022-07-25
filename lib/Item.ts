import { FLAG, FLAG_NAME, ITEM_ATTRIBUTE, ITEM_ATTRIBUTE_NAME, ITEM_GROUP, ITEM_TYPE } from "../const.ts";
import { OTBReader } from "../OTBReader.ts";
import { isValidFlagNameCheck, isValidItemAttributeNameCheck } from "./checks.ts";

export class Item {

    protected _serverId! : number;
    protected _clientId! : number;

    protected _attributes : { [key in ITEM_ATTRIBUTE_NAME | string]? : string | number | Uint8Array } = {} as { [key in ITEM_ATTRIBUTE_NAME]? : string | number | Uint8Array };
    protected _flags : { [key in FLAG_NAME | string] : boolean } = {} as { [key in FLAG_NAME] : boolean };

    protected _type : ITEM_TYPE = ITEM_TYPE.NONE;
    protected _group! : ITEM_GROUP;

    public get serverId(){ return this._serverId; };
    public get clientId(){ return this._clientId; };
    public get type(){ return this._type };
    public get group(){ return this._group };
    public get flags(){ return this._flags };
    public get attributes(){ return this._attributes };

    public set serverId(value : number){
        this._serverId = value;
    }

    public set clientId(value : number){
        this._clientId = value;
    }

    public set type(value : ITEM_TYPE | number){
        if (value in ITEM_TYPE){
            this._type = value;
        }else{
            throw new Error('Invalid item type.');
        }
    }

    public set group(value : ITEM_GROUP | number){
        if (value in ITEM_GROUP){
            this._group = value;
        }else{
            throw new Error('Invalid item group.');
        }
    }

    public setItemTypeOTBV1(){
        if (this.group === undefined){
            throw new Error(`Item group is undefined.`);
        }

        switch(this.group){
            case ITEM_GROUP.NONE:
            case ITEM_GROUP.GROUND:
            case ITEM_GROUP.SPLASH:
            case ITEM_GROUP.FLUID:
            case ITEM_GROUP.WEAPON:
            case ITEM_GROUP.AMMUNITION:
            case ITEM_GROUP.ARMOR:
            case ITEM_GROUP.WRITABLE:
            case ITEM_GROUP.KEY:
                break;
            case ITEM_GROUP.DOOR:
                this.type = ITEM_TYPE.DOOR;
                break;
            case ITEM_GROUP.CONTAINER:
                this.type = ITEM_TYPE.CONTAINER;
                break;
            case ITEM_GROUP.RUNE:
                this.setFlag(FLAG_NAME.CLIENTCHARGES, true);
                break;
            case ITEM_GROUP.TELEPORT:
                this.type = ITEM_TYPE.TELEPORT;
                break;
            case ITEM_GROUP.MAGICFIELD:
                this.type = ITEM_TYPE.MAGICFIELD;
                break;
            default: {
                console.warn(`Unknown item group declaration, group: ${this.group}`);
            }
        }
    }

    public setItemTypeOTBV2(){
        if (this.group === undefined){
            throw new Error(`Item group is undefined.`);
        }

        switch(this.group){
            case ITEM_GROUP.NONE:
            case ITEM_GROUP.GROUND:
            case ITEM_GROUP.SPLASH:
            case ITEM_GROUP.FLUID:
                break;
            case ITEM_GROUP.DOOR:
                this._type = ITEM_TYPE.DOOR;
                break;
            case ITEM_GROUP.CONTAINER:
                this.type = ITEM_TYPE.CONTAINER;
                break;
            case ITEM_GROUP.RUNE:
                this.setFlag(FLAG_NAME.CLIENTCHARGES, true);
                break;
            case ITEM_GROUP.TELEPORT:
                this.type = ITEM_TYPE.TELEPORT;
                break;
            case ITEM_GROUP.MAGICFIELD:
                this.type = ITEM_TYPE.MAGICFIELD;
                break;
            default: {
                console.warn(`Unknown item group declaration, group: ${this.group}`);
            }
        }
    }

    public setItemTypeOTBV3(){
        if (this.group === undefined){
            throw new Error(`Item group is undefined.`);
        }

        switch(this.group){
            case ITEM_GROUP.NONE:
            case ITEM_GROUP.GROUND:
            case ITEM_GROUP.SPLASH:
            case ITEM_GROUP.FLUID:
                break;
            case ITEM_GROUP.CONTAINER:
                this.type = ITEM_TYPE.CONTAINER;
                break;
            default: {
                console.warn(`Unknown item group declaration, group: ${this.group}`);
            }
        }
    }

    public setAttributesFromBuffer(buffer : OTBReader, endPosition : number) : void {
        while(buffer.position < endPosition){
            const attribute = buffer.readByte();
            const dataLength = buffer.escapeReadUint16LE();

            switch(attribute){
                case ITEM_ATTRIBUTE.SERVERID:
                    this._serverId = buffer.escapeReadUint16LE();
                    break;
                case ITEM_ATTRIBUTE.CLIENT_ID:
                    this._clientId = buffer.escapeReadUint16LE();
                    break;
                case ITEM_ATTRIBUTE.NAME:
                    this._attributes[ITEM_ATTRIBUTE_NAME.NAME] = String.fromCharCode(...buffer.escapeReadBytes(dataLength));
                    break;
                case ITEM_ATTRIBUTE.DESCRIPTION:
                    this._attributes[ITEM_ATTRIBUTE_NAME.DESCRIPTION] = String.fromCharCode(...buffer.escapeReadBytes(dataLength));
                    break;
                case ITEM_ATTRIBUTE.SPRITEHASH:
                    this._attributes[ITEM_ATTRIBUTE_NAME.SPRITEHASH] = buffer.readBytes(dataLength);
                    break;
                case ITEM_ATTRIBUTE.SPEED:
                    this._attributes[ITEM_ATTRIBUTE_NAME.SPEED] = buffer.escapeReadUint16LE();
                    break;
                case ITEM_ATTRIBUTE.LIGHT2:
                    this._attributes[ITEM_ATTRIBUTE_NAME.LIGHT_LEVEL] = buffer.escapeReadUint16LE();
                    this._attributes[ITEM_ATTRIBUTE_NAME.LIGHT_COLOR] = buffer.escapeReadUint16LE();
                    break;
                case ITEM_ATTRIBUTE.TOPORDER:
                    this._attributes[ITEM_ATTRIBUTE_NAME.TOPORDER] = buffer.readByte();
                    break;
                case ITEM_ATTRIBUTE.MAXITEMS:
                    this._attributes[ITEM_ATTRIBUTE_NAME.MAXITEMS] = buffer.escapeReadUint16LE();
                    break;
                case ITEM_ATTRIBUTE.WEIGHT:
                    this._attributes[ITEM_ATTRIBUTE_NAME.WEIGHT] = buffer.escapeReadUint64LE();
                    break;
                case ITEM_ATTRIBUTE.MINIMAPCOLOR:
                    this._attributes[ITEM_ATTRIBUTE_NAME.MINIMAPCOLOR] = buffer.escapeReadUint16LE();
                    break;
                case ITEM_ATTRIBUTE.ROTATETO:
                    this._attributes[ITEM_ATTRIBUTE_NAME.ROTATETO] = buffer.escapeReadUint16LE();
                    break;
                case ITEM_ATTRIBUTE.MAX_WRITE_LENGTH:
                    this._attributes[ITEM_ATTRIBUTE_NAME.MAX_WRITE_LENGTH] = buffer.escapeReadUint16LE();
                    break;
                case ITEM_ATTRIBUTE.MAX_READ_LENGTH:
                    this._attributes[ITEM_ATTRIBUTE_NAME.MAX_READ_LENGTH] = buffer.escapeReadUint16LE();
                    break;
                case ITEM_ATTRIBUTE.LIGHT3:
                    this._attributes[ITEM_ATTRIBUTE_NAME.LIGHT_LEVEL] = buffer.escapeReadUint16LE();
                    this._attributes[ITEM_ATTRIBUTE_NAME.LIGHT_COLOR] = buffer.escapeReadUint16LE();
                    break;
                    //Unused
                case ITEM_ATTRIBUTE.MAGICLEVEL:
                case ITEM_ATTRIBUTE.SLOT:
                case ITEM_ATTRIBUTE.WRITEABLE2:
                case ITEM_ATTRIBUTE.WEAPON2:
                case ITEM_ATTRIBUTE.ARMOR2:
                case ITEM_ATTRIBUTE.AMMUNITION2:
                    buffer.position+=dataLength;
                    break;
                default:
                    //Skip unknown attribute
                    //console.warn(`Skipping unknown attribute: ${attribute}`);
                    buffer.position+=dataLength;
                    continue;
            }
        }
    }

    public setAttribute(attribute : ITEM_ATTRIBUTE_NAME | string, value : string | number | Uint8Array) : void {
        isValidItemAttributeNameCheck(attribute);
        this._attributes[attribute] = value;
    }


    public setFlags(flags : number) : void {
        this._flags[FLAG_NAME.UNPASSABLE] = ((flags & FLAG.UNPASSABLE) == FLAG.UNPASSABLE);
        this._flags[FLAG_NAME.BLOCK_MISSILES] = ((flags & FLAG.BLOCK_MISSILES) == FLAG.BLOCK_MISSILES);
        this._flags[FLAG_NAME.BLOCK_PATHFINDER] = ((flags & FLAG.BLOCK_PATHFINDER) == FLAG.BLOCK_PATHFINDER);
        this._flags[FLAG_NAME.HAS_ELEVATION] = ((flags & FLAG.HAS_ELEVATION) == FLAG.HAS_ELEVATION);
        this._flags[FLAG_NAME.USEABLE] = ((flags & FLAG.USEABLE) == FLAG.USEABLE);
        this._flags[FLAG_NAME.PICKUPABLE] = ((flags & FLAG.PICKUPABLE) == FLAG.PICKUPABLE);
        this._flags[FLAG_NAME.MOVEABLE] = ((flags & FLAG.MOVEABLE) == FLAG.MOVEABLE);
        this._flags[FLAG_NAME.STACKABLE] = ((flags & FLAG.STACKABLE) == FLAG.STACKABLE);
        this._flags[FLAG_NAME.FLOORCHANGEDOWN] = ((flags & FLAG.FLOORCHANGEDOWN) == FLAG.FLOORCHANGEDOWN);
        this._flags[FLAG_NAME.FLOORCHANGENORTH] = ((flags & FLAG.FLOORCHANGENORTH) == FLAG.FLOORCHANGENORTH);
        this._flags[FLAG_NAME.FLOORCHANGEEAST] = ((flags & FLAG.FLOORCHANGEEAST) == FLAG.FLOORCHANGEEAST);
        this._flags[FLAG_NAME.FLOORCHANGESOUTH] = ((flags & FLAG.FLOORCHANGESOUTH) == FLAG.FLOORCHANGESOUTH);
        this._flags[FLAG_NAME.FLOORCHANGEWEST] = ((flags & FLAG.FLOORCHANGEWEST) == FLAG.FLOORCHANGEWEST);
        this._flags[FLAG_NAME.ALWAYSONTOP] = ((flags & FLAG.ALWAYSONTOP) == FLAG.ALWAYSONTOP);
        this._flags[FLAG_NAME.HANGABLE] = ((flags & FLAG.HANGABLE) == FLAG.HANGABLE);
        this._flags[FLAG_NAME.HOOK_EAST] = ((flags & FLAG.HOOK_EAST) == FLAG.HOOK_EAST);
        this._flags[FLAG_NAME.HOOK_SOUTH] = ((flags & FLAG.HOOK_SOUTH) == FLAG.HOOK_SOUTH);
        this._flags[FLAG_NAME.ALLOWDISTREAD] = ((flags & FLAG.ALLOWDISTREAD) == FLAG.ALLOWDISTREAD);
        this._flags[FLAG_NAME.ROTABLE] = ((flags & FLAG.ROTABLE) == FLAG.ROTABLE);
        this._flags[FLAG_NAME.READABLE] = ((flags & FLAG.READABLE) == FLAG.READABLE);
        this._flags[FLAG_NAME.CLIENTCHARGES] = ((flags & FLAG.CLIENTCHARGES) == FLAG.CLIENTCHARGES);
        this._flags[FLAG_NAME.IGNORE_LOOK] = ((flags & FLAG.IGNORE_LOOK) == FLAG.IGNORE_LOOK);
        this._flags[FLAG_NAME.IS_ANIMATION] = ((flags & FLAG.IS_ANIMATION) == FLAG.IS_ANIMATION);
        this._flags[FLAG_NAME.FULL_GROUND] = ((flags & FLAG.FULL_GROUND) == FLAG.FULL_GROUND);
        this._flags[FLAG_NAME.FORCE_USE] = ((flags & FLAG.FORCE_USE) == FLAG.FORCE_USE);
    }

    public setFlag(flag : FLAG_NAME | string, value : boolean) : void {
        isValidFlagNameCheck(flag);
        this._flags[flag] = value;
    }

    public getFlagsInt() : number {
        let flagsInt = 0;

        const flags = this.flags;

        if (flags[FLAG_NAME.UNPASSABLE]){
            flagsInt |= FLAG.UNPASSABLE;
        }

        if (flags[FLAG_NAME.BLOCK_MISSILES]){
            flagsInt |= FLAG.BLOCK_MISSILES;
        }

        if (flags[FLAG_NAME.BLOCK_PATHFINDER]){
            flagsInt |= FLAG.BLOCK_PATHFINDER;
        }

        if (flags[FLAG_NAME.HAS_ELEVATION]){
            flagsInt |= FLAG.HAS_ELEVATION;
        }

        if (flags[FLAG_NAME.USEABLE]){
            flagsInt |= FLAG.USEABLE;
        }

        if (flags[FLAG_NAME.PICKUPABLE]){
            flagsInt |= FLAG.PICKUPABLE;
        }

        if (flags[FLAG_NAME.MOVEABLE]){
            flagsInt |= FLAG.MOVEABLE;
        }

        if (flags[FLAG_NAME.STACKABLE]){
            flagsInt |= FLAG.STACKABLE;
        }

        if (flags[FLAG_NAME.FLOORCHANGEDOWN]){
            flagsInt |= FLAG.FLOORCHANGEDOWN;
        }

        if (flags[FLAG_NAME.FLOORCHANGENORTH]){
            flagsInt |= FLAG.FLOORCHANGENORTH;
        }

        if (flags[FLAG_NAME.FLOORCHANGEEAST]){
            flagsInt |= FLAG.FLOORCHANGEEAST;
        }

        if (flags[FLAG_NAME.FLOORCHANGESOUTH]){
            flagsInt |= FLAG.FLOORCHANGESOUTH;
        }

        if (flags[FLAG_NAME.FLOORCHANGEWEST]){
            flagsInt |= FLAG.FLOORCHANGEWEST;
        }

        if (flags[FLAG_NAME.ALWAYSONTOP]){
            flagsInt |= FLAG.ALWAYSONTOP;
        }

        if (flags[FLAG_NAME.HANGABLE]){
            flagsInt |= FLAG.HANGABLE;
        }

        if (flags[FLAG_NAME.HOOK_EAST]){
            flagsInt |= FLAG.HOOK_EAST;
        }

        if (flags[FLAG_NAME.HOOK_SOUTH]){
            flagsInt |= FLAG.HOOK_SOUTH;
        }

        if (flags[FLAG_NAME.ALLOWDISTREAD]){
            flagsInt |= FLAG.ALLOWDISTREAD;
        }

        if (flags[FLAG_NAME.ROTABLE]){
            flagsInt |= FLAG.ROTABLE;
        }

        if (flags[FLAG_NAME.READABLE]){
            flagsInt |= FLAG.READABLE;
        }

        if (flags[FLAG_NAME.CLIENTCHARGES]){
            flagsInt |= FLAG.CLIENTCHARGES;
        }

        if (flags[FLAG_NAME.IGNORE_LOOK]){
            flagsInt |= FLAG.IGNORE_LOOK;
        }

        if (flags[FLAG_NAME.IS_ANIMATION]){
            flagsInt |= FLAG.IS_ANIMATION;
        }

        if (flags[FLAG_NAME.FULL_GROUND]){
            flagsInt |= FLAG.FULL_GROUND;
        }

        if (flags[FLAG_NAME.FORCE_USE]){
            flagsInt |= FLAG.FORCE_USE;
        }

        return flagsInt;
    }
}
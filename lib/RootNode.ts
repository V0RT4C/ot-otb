import { Item } from "./Item.ts";
import { isItemCheck, isValidItemsMajorVersion } from "./checks.ts";

export class RootNode {
    constructor(
        private _itemsMajorVersion : number,
        private _itemsMinorVersion : number,
        private _itemsBuildNumber : number
    ){}

    private _children : Item[] = [];

    public get itemsMajorVersion() : number { return this._itemsMajorVersion; };
    public get itemsMinorVersion() : number { return this._itemsMinorVersion; };
    public get itemsBuildNumber() : number { return this._itemsBuildNumber; };
    public get children(){ return this._children };

    public set itemsMajorVersion(value : number){
        isValidItemsMajorVersion(value);
        this._itemsMajorVersion = value;
    }

    public set itemsMinorVersion(value : number){ this._itemsMinorVersion = value; };
    public set itemsBuildNumber(value : number){ this._itemsBuildNumber = value; };

    public addItem(item : Item) : void {
        isItemCheck(item);
        this._children.push(item);
    }

    public getItemByServerId(serverId : number) : Item | null {
        const idx : number = this.getItemIndexByServerId(serverId);
        return (idx !== -1) ? this._children[idx] : null;
    }

    public getItemByClientId(clientId : number) : Item | null {
        const idx : number = this.getItemIndexByClientId(clientId);
        return (idx !== -1) ? this._children[idx] : null;
    }

    public removeItemByServerId(serverId : number) : Item | null {
        let idx = this.getItemIndexByServerId(serverId);

        if (idx !== -1){
            const removedItem = this._children.splice(idx, 1);
            return removedItem[0] !== undefined ? removedItem[0] : null;
        }else{
            return null;
        }
    }

    public removeItemByClientId(clientId : number) : Item | null {
        let idx = this.getItemIndexByClientId(clientId);

        if (idx !== -1){
            const removedItem = this._children.splice(idx, 1);
            return removedItem[0] !== undefined ? removedItem[0] : null;
        }else{
            return null;
        }
    }

    public getItemIndexByServerId(serverId : number) : number {
        let idx = -1;

        for (let i=0; i < this._children.length; i++){
            if (this._children[i].serverId === serverId){
                idx = i;
                break;
            }
        }

        return idx;
    }

    public getItemIndexByClientId(clientId : number) : number {
        let idx = -1;

        for (let i=0; i < this._children.length; i++){
            if (this._children[i].clientId === clientId){
                idx = i;
                break;
            }
        }

        return idx;
    }

    public popItem() : Item | null {
        const poppedItem = this._children.pop();
        return poppedItem ? poppedItem : null;
    }

    public shiftItem() : Item | null {
        const shiftedItem = this._children.shift();
        return shiftedItem ? shiftedItem : null;
    }
}
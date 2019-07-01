export class FormField {
    private dname: string;
    private internalName: string;
    private ftype: string;

    get displayName() {
        return this.dname;
    }

    get name() {
        return this.internalName;
    }

    get type() {
        return this.ftype;
    }

    constructor(name: string, displayName: string, type: string) {
        this.dname = displayName;
        this.internalName = name;
        this.ftype = type;
    }
    public getValueAsString(): string {
        return '';
    }
}

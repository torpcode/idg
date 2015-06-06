/**
 * An object that simplifies saving and loading game data.
 */
class StorageDevice {
    private storageKey: string;
    private loadedData: any;
    private bindings: {key: string, getSaveData: ()=>any}[] = [];

    constructor(storageKey: string) {
        this.storageKey = storageKey;

        // Immediately load data from previous session (if such data exists)
        this.tryLoadSession();
    }

    private tryLoadSession(): void {
        let data: any = localStorage.getItem(this.storageKey);

        if (!data) {
            // Previous save doesn't exist
            return;
        }

        try {
            data = JSON.parse(data);
        } catch (ex) {
            // Data found, but is corrupt?
            return;
        }

        this.loadedData = data;
    }

    public bind(key: string, load: (data: any)=>void, getSaveData: ()=>any): void {
        // Load data immediately, if there is
        // any data matching the key.
        const loadedData = this.loadedData;
        if (loadedData) {
            if (loadedData.hasOwnProperty(key)) {
                load(loadedData[key]);
            }
        }

        // Ensure that keys are unique, as duplicate keys
        // will result in save data being overwriting.
        const bindings = this.bindings;
        for (let i = 0; i < bindings.length; i++) {
            const b = bindings[i];
            if (b.key === key) {
                // Key collision
                throw new Error("Binding keys for components must be unique.");
            }

        }
        this.bindings.push({key, getSaveData});
    }

    public bindCmp(key: string, cmp: Component): void {
        this.bind(key, x => cmp.val, () => cmp.val);
    }

    public saveCurrentState(): void {
        // Populate an object with the required save data
        const data = {};

        const bindings = this.bindings;
        for (let i = 0; i < bindings.length; i++) {
            const b = bindings[i];
            data[b.key] = b.getSaveData();
        }


        localStorage.setItem(this.storageKey, JSON.stringify(data));
    }
}
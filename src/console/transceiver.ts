type SvrStatus = "connecting" | "offline" | "online";

export class Transceiver {
    status: SvrStatus = "connecting";
    svrId: string;

    constructor(_liEl: HTMLLIElement, _id: string) {
        this.svrId = _id;
    }

    static create(_liEl: HTMLLIElement, _id: string) {
        return new Transceiver(_liEl, _id);
    }

    initiate() {
        // ToDo: start tracking current server
    }
}

import { Realtime, Types } from "ably/promises";
import { getSettings } from "../utilities/settings";

type SvrStatus = "connecting" | "offline" | "online";

export class Transceiver {
    private realtimeChannel?: Types.RealtimeChannelPromise;
    private realtimeAbly: Types.RealtimePromise;
    private webObserverPresent: boolean = false;
    private svrLiEl: HTMLLIElement;
    private onlineCount = 0;

    status: SvrStatus = "connecting";
    svrId: string;

    constructor(_liEl: HTMLLIElement, _id: string) {
        this.svrId = _id;
        this.svrLiEl = _liEl;
        const identifier = `web|${_id}`;
        this.realtimeAbly = new Realtime.Promise({ key: getSettings().apiKey, clientId: identifier });

        this.realtimeAbly.connection.once("connected").then(() => {
            this.realtimeChannel = this.realtimeAbly.channels.get(_id);
            this.realtimeChannel.presence.enter("web");
            this.setupListeners(_id);

        })
    }

    private setupListeners(id: string) {
        this.realtimeChannel?.subscribe(this.handleMessages);
        this.realtimeChannel?.presence.subscribe((pm) => {

            if (pm.clientId.startsWith("package|") && pm.clientId.split("|")[1] === id) {
                const serverOnline = pm.action === "enter" || pm.action === "present" || pm.action === "update";
                this.onlineCount += serverOnline ? 1 : -1;
                this.svrLiEl.setAttribute("data-state",
                    (this.onlineCount === 1) ? "online" : "offline");
            }
        });
    }

    private handleMessages(msg: Types.Message) {
        // 
    }

    static create(_liEl: HTMLLIElement, _id: string) {
        return new Transceiver(_liEl, _id);
    }

    initiate() {
        // ToDo: start tracking current server
    }
}

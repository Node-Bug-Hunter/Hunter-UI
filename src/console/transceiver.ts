import { getSettings } from "../utilities/settings";
import { decompress } from "../utilities/packer";
import { Realtime, Types } from "ably/promises";
import { LogObject } from "../utilities/types";
import { FutureCB } from "../utilities/const";
import { oneEl } from "../utilities/query";
import { buildLogDOM } from "./logwatch";
import { EventEmitter } from "events";
import { pushToast } from "../toast";

const logsBuffer: { [key: string]: [number, string] } = {};

type SvrStatus = "connecting" | "offline" | "online";
type MSGEvent = "logs" | "feedback";

export class Transceiver extends EventEmitter {
    private realtimeChannel?: Types.RealtimeChannelPromise;
    private realtimeAbly: Types.RealtimePromise;
    private svrLiEl: HTMLLIElement;
    private onlineCounter = 0;

    static active: Transceiver;
    static online = 0;

    status: SvrStatus = "connecting";
    serverName: string = "";
    svrId: string;

    constructor(_liEl: HTMLLIElement, _id: string, _name: string) {
        super();
        this.svrId = _id;
        this.svrLiEl = _liEl;
        this.serverName = _name;
        const identifier = `web|${_id}`;
        this.realtimeAbly = new Realtime.Promise({ key: getSettings().apiKey, clientId: identifier });

        setTimeout(() => {
            if (this.status === "online") return;
            _liEl.setAttribute("data-state", "offline");
            this.emit("status-change", false);
        }, 20_000);

        this.realtimeAbly.connection.once("connected").then(() => {
            this.realtimeChannel = this.realtimeAbly.channels.get(_id);
            this.realtimeChannel.presence.enter("web");
            this.setupListeners(_id);
        });
    }

    private setupListeners(id: string) {
        this.realtimeChannel?.subscribe(this.handleMessages);
        this.realtimeChannel?.presence.subscribe((pm) => {
            if (!pm.clientId.startsWith("package|")
                || pm.clientId.split("|")[1] !== id) return;
            
            const serverOnline = pm.action === "enter" || pm.action
                === "present" || pm.action === "update";
            this.onlineCounter += serverOnline ? 1 : -1;
            const isOnline = this.onlineCounter === 1;
            this.emit("status-change", isOnline);
            Transceiver.online += isOnline ? 1 : -1;
            this.status = isOnline ? "online" : "offline";
            this.svrLiEl.setAttribute("data-state", this.status);

            let text = "none of your servers are online";
            const gp = Transceiver.online === 1 ? " is" : "s are";
            if (Transceiver.online > 0) text = `${Transceiver.online} server${gp} online`;
            oneEl(`#console .section[data-section="home"] .server-list > u`).innerText = text;
        });
    }

    private handleMessages(msg: Types.Message) {
        const { data, name } = msg;

        try {
            switch (name as MSGEvent) {
                case "logs": {
                    let compressedLog = data;

                    if (typeof data === "object") {
                        const { chunkId, part, final, chunk } = data;
                        if (!logsBuffer[chunkId]) logsBuffer[chunkId] = [0, ""];
                        if ((logsBuffer[chunkId][0] + 1) !== part) return;
                        logsBuffer[chunkId][1] += chunk;
                        logsBuffer[chunkId][0] = part;
                        if (!final) return;

                        compressedLog = logsBuffer[chunkId][1];
                        delete logsBuffer[chunkId];
                    }

                    const rawLog = decompress(compressedLog);
                    if (!rawLog) return pushToast("Unable to decompress message", "err");
                    const logObject: LogObject = JSON_Parse(rawLog);
                    buildLogDOM(logObject);
                    break;
                }

                case "feedback": {
                    if (typeof data !== "string") return;
                    const func = FutureCB.get(data);

                    if (typeof func === "function") {
                        FutureCB.delete(data);
                        func();
                    }
                    break;
                }
            }
        } catch (e) {
            if (!(e instanceof Error)) return;
            console.error("Error encountered while handling a remote-message\n", e.message, e.stack);
        }
    }

    async pub(name: string, data?: any) {
        if (!this.realtimeChannel || this.realtimeAbly.connection.state !== "connected") return;
        if (typeof data !== "object" && typeof data !== "string") data = data.toString();

        try {
            await this.realtimeChannel.publish(name, data);
        } catch (e) {
            if (!(e instanceof Error)) return;
            pushToast("Unable to send commands to your cluster", "warn");
        }
    }

    static create(_liEl: HTMLLIElement, _id: string, _name: string) {
        return new Transceiver(_liEl, _id, _name);
    }
}

export function JSON_Parse(s: string) {
    return (JSON.parse(s, (_, v) => {
        if (typeof v === "string") {
            const bigIntMatch = v.match(/BigInt\((\d+)n\)/);
            if (bigIntMatch && bigIntMatch[1])
                return BigInt(bigIntMatch[1]);

            const symbolMatch = v.match(/Symbol\(([^)]+)\)/);
            if (symbolMatch && symbolMatch[1])
                return Symbol(symbolMatch[1]);
        }

        return v;
    }));
}

export function JSON_Stringify(o: any) {
    return (JSON.stringify(o, (_, v) => {
        if (typeof v === "bigint")
            return `BigInt(${v}n)`;
        if (typeof v === "symbol")
            return v.toString();
        return v;
    }));
}

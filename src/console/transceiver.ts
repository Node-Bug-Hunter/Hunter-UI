import { ErrorInfo, Realtime, Types } from "ably/promises";
import { getSettings } from "../utilities/settings";
import { decompress } from "../utilities/packer";
import { LogObject } from "../utilities/types";
import { oneEl } from "../utilities/query";
import { buildLogDOM } from "./logwatch";
import { pushToast } from "../toast";

const logsBuffer: { [key: string]: [number, string] } = {};

type SvrStatus = "connecting" | "offline" | "online";
type MSGEvent = "logs";

export class Transceiver {
    private realtimeChannel?: Types.RealtimeChannelPromise;
    private realtimeAbly: Types.RealtimePromise;
    private svrLiEl: HTMLLIElement;
    private onlineCounter = 0;

    static online = 0;

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
                    console.log(logObject);
                    buildLogDOM(logObject);
                }
            }
        } catch (e) {
            if (e instanceof Error) {
                console.error("Error encountered while handling log-message", e.message, e.stack);
            }
        }
    }

    private async pub(name: string, data?: any) {
        if (!this.realtimeChannel || this.realtimeAbly.connection.state !== "connected") return;
        
        try {
            await this.realtimeChannel.publish(name, data);
        } catch (e) {
            if (!(e instanceof ErrorInfo)) return;
            pushToast("Unable to send commands to your cluster", "warn");
        }
    }

    static create(_liEl: HTMLLIElement, _id: string) {
        return new Transceiver(_liEl, _id);
    }

    async initiate() {
        await this.pub("monitor-start");
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

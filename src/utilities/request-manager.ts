import { Payload, ServerResponse } from "./types";
import { DEV_URL, PROD_URL } from "./const";
import { pushToast } from "../toast";
let isInProgress = false;

export class RequestManager {
    static async one(payload: Payload, showToast = true): Promise<ServerResponse | null> {
        try {
            if (isInProgress) return { rejected: true };
            isInProgress = true;

            const sess = localStorage.getItem("AUTH_SESSION");
            const em = localStorage.getItem("AUTH_EMAIL");

            if (sess) {
                if (!em) {
                    localStorage.removeItem("AUTH_SESSION");
                    location.reload();
                    return null;
                }

                payload.session = sess;
                payload.email = em;
            }
            
            const fetchResponse = await fetch(PROD_URL, {
                headers: { "content-type": "application/json" },
                body: JSON.stringify(payload),
                method: "POST"
            });

            const response: ServerResponse = await fetchResponse.json();
            
            if (showToast && !response.rejected) {
                const type = (response.code < 300 ? "ok" : (response.code < 500 ? "warn" : "err"));
                pushToast(response.msg, type);
            }

            return response;
        }
        catch (er) {
            if (er instanceof Error) {
                pushToast(`API Request Failure: [POST] 'Check your network connection'`, "err");
            }
            
            return null;
        }
        finally {
            isInProgress = false;
        }
    }
}

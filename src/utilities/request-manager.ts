import { Payload, ServerResponse } from "./types";
import { DEV_URL, PROD_URL } from "./const";
let isInProgress = false;

export class RequestManager {
    static async one(payload: Payload): Promise<ServerResponse | null> {
        try {
            if (isInProgress) return { rejected: true };
            isInProgress = true;

            const sess = localStorage.getItem("AUTH_SESSION");
            if (sess) payload.session = sess;

            const fetchResponse = await fetch(PROD_URL, {
                headers: { "content-type": "application/json" },
                body: JSON.stringify(payload),
                method: "POST"
            });

            const response: ServerResponse =
                await fetchResponse.json();
            return response;
        }
        catch {
            return null;
        }
        finally {
            isInProgress = false;
        }
    }
}

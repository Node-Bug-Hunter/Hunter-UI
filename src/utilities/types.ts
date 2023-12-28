type AuthCheckPayload = {
	type: "authcheck"
}

export type AuthPayload = {
	type: "authenticate"
}

export type OTPPayload = {
	type: "verify"
	name?: string
	code: string
}

type RotateKeyPayload = { type: "rotate" };
type RevokeKeyPayload = { type: "revoke" };
type ReviveKeyPayload = { type: "revive" };

export type Payload = {
    auth?: string
    email?: string
} & (
	RotateKeyPayload |
	RevokeKeyPayload |
	ReviveKeyPayload |
	AuthCheckPayload |
	AuthPayload |
	OTPPayload
);

export type ServerResponse = {
    rejected?: false
    code: number
    ok: boolean
    data?: any
    msg: any
} | { rejected: true }

export type Server = {
	remoteActive: boolean
    lastIP: string
	name: string
}

export type Settings = {
	stats: {
		lastIP: string
		lastTime: string
		totalEmails: number
	}

	cluster: { [id: string]: Server }
	preferTheme: string
    session: string
    apiKey: string
    name: string
}

type Log = {
    logValue: any;
    type: string;
}

export type LogObject = {
    logLevel: "LOG" | "INFO" | "TABLE" | "WARN" | "ERROR";
    timeStamp: number;
    data: Log[];
    at: {
		function: string
		column: number
		file: string
		line: number
	};
};

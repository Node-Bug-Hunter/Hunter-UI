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

export type Payload = {
    auth?: string
    email?: string
} & (AuthCheckPayload | AuthPayload | OTPPayload);

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

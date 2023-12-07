type SessionPayload = {
	type: "session"
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
    session?: string
    email?: string
} & (SessionPayload | AuthPayload | OTPPayload);

export type ServerResponse = {
    rejected?: false
    code: number
    ok: boolean
    data?: any
    msg: any
} | { rejected: true }

export type Settings = {
    session: string
    name: string

    apiKeys: {
        web: string
        package: string
    }
}

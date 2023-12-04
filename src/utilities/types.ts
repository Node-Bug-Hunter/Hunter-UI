type TestPayload = {
	type: "test"
	msg: string
}

export type AuthPayload = {
	type: "authenticate"
}

export type OTPPayload = {
	type: "verify"
	name: string
	code: string
}

export type Payload = {
    session?: string
    email: string
} & (TestPayload | AuthPayload | OTPPayload);

export type ServerResponse = {
    rejected?: false
    code: number
    ok: boolean
    data?: any
    msg: any
} | { rejected: true }

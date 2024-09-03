import { SessionTokens } from "./adapter";


export type TokenManagerParams = { secret: string }
export interface TokenManager {
    issue: (data: any) => Promise<SessionTokens>,
    validate: (accessToken: string) => Promise<any>
}
export interface TokenAdapter<T extends object> {
    generate(payload: T, expiresAt: number): Promise<string>,
    verify(token: string): Promise<T>,
}
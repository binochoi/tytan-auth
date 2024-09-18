import { SessionTokens } from "./adapter";


export type TokenManagerParams = { secret: string }
export interface TokenManager {
    generate(at: any): Promise<Pick<Required<SessionTokens>, 'accessToken' | 'accessTokenExpires'>>,
    generate(at: any, rt: any): Promise<Required<SessionTokens>>,
    /** @param atOrRt access token or refresh token */
    validate: (atOrRt: string) => Promise<any>,
}
export interface TokenAdapter<T extends object> {
    generate(payload: T, expiresAt: number): Promise<string>,
    verify(token: string): Promise<T>,
}
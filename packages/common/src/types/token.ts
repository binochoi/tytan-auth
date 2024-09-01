import { SessionTokens } from "./adapter";


export interface TokenManagerParams {
    secret: string,
    /**
     *  miliseconds
     *  @default 2min
     * */
    accessTokenExpires?: number,
    /** 
     * miliseconds
     * @description
     * it'll be replaced when only oauth session creation.
     * so therefore if longer than oauth refresh token expires,
     * will replaced to that.
     * @default 1month
     * */
    refreshTokenExpires?: number,
}
export interface TokenManager<Info extends object = any> {
    issue: (data: Info) => SessionTokens,
    validate: (token: string) =>  Info
}
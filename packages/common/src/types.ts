import type { UserAdapter, SessionAdapter, SessionTokens } from './types/adapter';
export type TytanAuthConfig<
    TEndpoints extends object = any,
    THelperTypes extends object = any
> = {
    setting?: {},
    token: TokenManager,
    strategies: StrategyCore<TEndpoints, THelperTypes>[],
    adapters: {
        user: UserAdapter,
        session: SessionAdapter,
    },
    plugins: any[],
}
export type TytanSetting = {}
export type Strategy<
    TOption extends object = any,
    TEndpoint extends object = any,
    THelperTypes extends object = any
> = (option: TOption) => StrategyCore<TEndpoint, THelperTypes>;
export type StrategyCore<
    TEndpoints extends object = any,
    THelperTypes extends object = any,
    TName extends string = string,
> = (context: StrategyContext) => {
    name: TName,
    endpoints: TEndpoints,
    types: THelperTypes,
}
export type StrategyContext = {
    token: TokenManager
    adapters: {
        user: UserAdapter,
        session: SessionAdapter,
    }
}

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
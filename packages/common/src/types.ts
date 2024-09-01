import type { UserAdapter, SessionAdapter, SessionTokens } from './types/adapter';
import { TokenManager } from './types/token';
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
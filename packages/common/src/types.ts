import { SetRequired } from 'type-fest';
import type { UserAdapter, SessionAdapter, SessionTokens } from './types/adapter';
import { TokenManager, TokenManagerParams } from './types/token';
export type TytanAuthConfigInput = {
    /** @default false */
    allowDuplicateEmail?: boolean,
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
};
export type TytanAuthConfigOutput = SetRequired<TytanAuthConfigInput,
    'allowDuplicateEmail' | 'accessTokenExpires' | 'refreshTokenExpires'>
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
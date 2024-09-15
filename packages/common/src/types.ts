import { SetRequired } from 'type-fest';
import type { UserAdapter, SessionAdapter, SessionTokens } from './types/adapter';
import { TokenAdapter, TokenManager } from './types/token';
import { DefaultSession, DefaultUser } from './types/schema';
export type TytanAuthParams = {
    config?: TytanAuthConfigInput,
    token: TokenAdapter<any>,
    strategies: StrategyCore[],
    adapters: {
        user: UserAdapter,
        session: SessionAdapter,
    },
    plugins?: any[],
}
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
    TTypes extends object = any
> = (context: StrategyContext<TTypes>) => {
    name: TName,
    endpoints: TEndpoints,
    types: THelperTypes,
}
export type StrategyContext<T> = {
    token: TokenManager
    user: UserAdapter,
    session: SessionAdapter,
    auth: AuthService<any, any>,
    types: T,
}

type StatusOnSign = 'beginner' | 'existing';
export type AuthServiceContext = Omit<StrategyContext<any>, 'auth'>;
type SignResult<TUser extends DefaultUser, TSession extends DefaultSession> = {
    user: TUser,
    session: TSession,
    tokens: SessionTokens,
    status: StatusOnSign,
}
export type AuthService<
    TUser extends DefaultUser,
    TSession extends DefaultSession,
> = {
    signup: (user: TUser) => Promise<SignResult<TUser, TSession>>,
    signin: (user: TUser) => Promise<SignResult<TUser, TSession>>,
    verifyOrRefresh: (accessToken: string, refreshToken: string) => Promise<
        Record<'status', 'healthy'> |
        Record<'status', 'expired'> |
        Record<'status', 'malformed'> |
    {
        status: 'refreshed'
        session: TSession,
        tokens: SessionTokens,
    }>
}
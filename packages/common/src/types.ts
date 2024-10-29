import { SetRequired } from 'type-fest';
import type { UserAdapter, SessionAdapter, SessionTokens } from './types/adapter';
import { TokenAdapter, TokenManager } from './types/token';
import { DefaultSession, DefaultUser } from './types/schema';
export type TytanAuthParams<
    TConfig extends TytanAuthConfigInput,
    TStrategies extends StrategyCore[],
    TAdapters extends {
        user: UserAdapter,
        session: SessionAdapter,
    },
    TTokenAdapter extends TokenAdapter<any>
> = {
    config?: TConfig,
    token: TTokenAdapter,
    strategies: TStrategies,
    adapters: TAdapters,
    plugins?: any[],
}
export type TytanAuthConfigInput = {
    /** @default false */
    // allowDuplicateEmail?: boolean,
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
    /** refresh token이 기간이 어느정도 남았을 때 refresh를 하는지 결정한다 */
    refreshTokenRenewalPeriod?: number,
    sessionIdSize?: number,
    /** 토큰에 넣어놓을 유저 데이터 */
    setUserTokenAttributes?: (user: any) => any,
};
export type TytanAuthConfigOutput = Required<TytanAuthConfigInput>
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
    verifyOrRefresh: (accessToken?: string, refreshToken?: string) => Promise<
        /** at, rt 만료되거나 없음 */
        Record<'status', 'expired'> |
        /** at가 이상하거나 rt가 이상함 */
        Record<'status', 'malformed'> |
        /** at refreshed */
        {
            status: 'refreshed',
            tokens: Pick<SessionTokens, 'accessToken' | 'accessTokenExpires'>,
            user: TUser,
        } |
        {
            status: 'regenerated',
            user: TUser,
            session: TSession,
            tokens: SessionTokens,
        }>
    logout: (refreshToken: string) => Promise<TSession>
}
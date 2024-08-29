import { SessionAdapter, StrategyCore, TokenManager, TokenManagerParams, UserAdapter } from "@tytan-auth/common";
export { default as jwt } from "./jwt";
// type MergeObjects<T extends object[]> = {
//     [K in keyof T[number]]: T[number][K];
// };

class TytanAuth {
    readonly endpoints: object;
    readonly types: object;
    constructor(
        private readonly token: TokenManager,
        private readonly strategies: StrategyCore[],
        public readonly adapters: {
            user: UserAdapter,
            session: SessionAdapter,
        },
    ) {
        const { endpoints, types } = this.strategies.map((strategy) => strategy({ token, adapters }))
        .reduce((prev, current) => ({
            name: '',
            types: {
                ...prev.types,
                ...current.types,
            },
            endpoints: {
                // [prev.name]: prev.endpoints,
                ...prev.endpoints,
                ...current.endpoints,
            }
        }));
        this.endpoints = endpoints;
        this.types = types;
    }
}
const Auth = <
    TEndpoints extends object,
    THelperTypes extends object,
    TUser extends object,
    TSession extends object,
>({ token, strategies, adapters }: TytanAuthConfig<TEndpoints, THelperTypes, TUser, TSession>) => {
    const { adapters: { user, session }, endpoints, types } = new TytanAuth(
        token,
        strategies,
        adapters,
    );
    return {
        endpoints,
        user,
        session,
        types,
    } as {
        endpoints: TEndpoints,
        user: UserAdapter<TUser>,
        session: SessionAdapter<TSession, any>,
        types: THelperTypes
    };
}
export default Auth;
export { default as local } from './strategy/local.strategy'
export { default as oauth } from './strategy/oauth.strategy'


export type TytanAuthConfig<
    TEndpoints extends object,
    THelperTypes extends object,
    TUser extends object,
    TSession extends object,
> = {
    setting?: Pick<TokenManagerParams, 'accessTokenExpires' | 'refreshTokenExpires'>,
    token: TokenManager,
    strategies: StrategyCore<TEndpoints, THelperTypes>[],
    adapters: {
        user: UserAdapter<TUser>,
        session: SessionAdapter<TSession>,
    },
    plugins?: any[],
}
import { SessionAdapter, StrategyCore, TokenManager, TokenManagerParams, UserAdapter } from "@tytan-auth/common";
export { default as jwt } from "./jwt";
// type MergeObjects<T extends object[]> = {
//     [K in keyof T[number]]: T[number][K];
// };

class TytanAuth {
    readonly endpoints: { [K: string]: any };
    readonly types: { [K: string]: any };
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
    TEndpoints extends { [K: string]: any },
    THelperTypes extends object,
    TUser extends object,
    TSession extends object,
    TStrategyName extends string,
>({ token, strategies, adapters }: TytanAuthParams<TEndpoints, THelperTypes, TUser, TSession, TStrategyName>) => {
    const { adapters: { user, session }, endpoints, types } = new TytanAuth(
        token,
        strategies,
        adapters,
    );
    type Strategy = ReturnType<(typeof strategies)[number]>;
    return {
        endpoints,
        user,
        session,
        types,
    } as {
        endpoints: { [K in Strategy['name']]: Strategy['endpoints'] },
        user: UserAdapter<TUser>,
        session: SessionAdapter<TSession>,
        types: THelperTypes
    } & { [K in Strategy['name']]: Strategy['endpoints'] };
}
export default Auth;
// export { default as local } from './strategy/local.strategy'
export { default as oauth } from './strategy/oauth.strategy'


export type TytanAuthParams<
    TEndpoints extends object,
    THelperTypes extends object,
    TUser extends object,
    TSession extends object,
    TStrategyNames extends string,
> = {
    setting?: Pick<TokenManagerParams, 'accessTokenExpires' | 'refreshTokenExpires'>,
    token: TokenManager,
    strategies: StrategyCore<TEndpoints, THelperTypes, TStrategyNames>[],
    adapters: {
        user: UserAdapter<TUser>,
        session: SessionAdapter<TSession>,
    },
    plugins?: any[],
}
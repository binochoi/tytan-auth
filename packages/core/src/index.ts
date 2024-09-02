import { SessionAdapter, StrategyCore, TokenAdapter, TytanAuthConfigInput, TytanAuthConfigOutput, UserAdapter } from "@tytan-auth/common";
import TokenManager from "./services/TokenManager";

class TytanAuth {
    readonly endpoints: { [K: string]: any };
    readonly types: { [K: string]: any };
    constructor(
        private readonly tokenAdapter: TokenAdapter<any>,
        private readonly strategies: StrategyCore[],
        public readonly adapters: {
            user: UserAdapter,
            session: SessionAdapter,
        },
        private readonly _config?: TytanAuthConfigInput
    ) {
        const config: TytanAuthConfigOutput = {
            ...this._config,
            accessTokenExpires: 60 * 2,
            refreshTokenExpires: 60 * 60 * 30,
        }
        const token = new TokenManager(this.tokenAdapter, config);
        const { endpoints, types } = this.strategies.map((strategy) => strategy({ token, adapters }))
        .reduce((prev, current) => ({
            name: '',
            types: {
                ...prev.types,
                ...current.types,
            },
            endpoints: {
                [prev.name]: prev.endpoints,
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
>({ token, strategies, adapters, config }: TytanAuthParams<TEndpoints, THelperTypes, TUser, TSession, TStrategyName>) => {
    const { adapters: { user, session }, endpoints, types } = new TytanAuth(
        token,
        strategies,
        adapters,
        config,
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
    };
}
export default Auth;


export type TytanAuthParams<
    TEndpoints extends object,
    THelperTypes extends object,
    TUser extends object,
    TSession extends object,
    TStrategyNames extends string,
> = {
    config?: TytanAuthConfigInput,
    token: TokenAdapter<any>,
    strategies: StrategyCore<TEndpoints, THelperTypes, TStrategyNames>[],
    adapters: {
        user: UserAdapter<TUser>,
        session: SessionAdapter<TSession>,
    },
    plugins?: any[],
}
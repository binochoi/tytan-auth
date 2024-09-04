import { SessionAdapter, Strategy, StrategyCore, TokenAdapter, TytanAuthConfigInput, TytanAuthConfigOutput, UserAdapter } from "@tytan-auth/common";
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
            allowDuplicateEmail: false,
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
    T extends {
        config?: TytanAuthConfigInput,
        token: TokenAdapter<any>,
        strategies: StrategyCore[],
        adapters: {
            user: UserAdapter,
            session: SessionAdapter,
        },
        plugins?: any[],
    },
>({ token, strategies, adapters, config }: T) => {
    const { adapters: { user, session }, endpoints, types } = new TytanAuth(
        token,
        strategies,
        adapters,
        config,
    );
    type Strategy = ReturnType<T['strategies'][number]>;
    return {
        endpoints,
        user,
        session,
        types,
    } as {
        endpoints: { [K in Strategy['name']]: Strategy['endpoints'] },
        user: T['adapters']['user'],
        session: T['adapters']['session'],
        types: {
            $Strategy: T['strategies']
        }
    };
}
export default Auth;
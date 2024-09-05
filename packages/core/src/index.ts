import { SessionAdapter, StrategyCore, TokenAdapter, TytanAuthConfigInput, TytanAuthConfigOutput, UserAdapter } from "@tytan-auth/common";
import TokenManager from "./services/TokenManager";
import { TytanAuthParams } from "@tytan-auth/common";

class TytanAuth {
    readonly endpoints: { [K: string]: any };
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
        const strategyCores = this.strategies
            .map((createStrategy) => {
                const { name, endpoints } = createStrategy({ token, adapters });
                return [name, endpoints];
            })
        this.endpoints = Object.fromEntries(strategyCores);
    }
}
const Auth = <T extends TytanAuthParams>({ token, strategies, adapters, config }: T) => {
    const { adapters: { user, session }, endpoints } = new TytanAuth(
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
    } as {
        endpoints: { [K in Strategy['name']]: Strategy['endpoints'] },
        user: T['adapters']['user'],
        session: T['adapters']['session'],
        types: Strategy['types'] & T['adapters']['user']['types'] & T['adapters']['session']['types']
    };
}
export default Auth;
import { AuthService, SessionAdapter, StrategyCore, TokenAdapter, TytanAuthConfigInput, TytanAuthConfigOutput, UserAdapter } from "@tytan-auth/common";
import TokenManager from "./services/TokenManager";
import { TytanAuthParams } from "@tytan-auth/common";
import { getAuthService } from "./services/AuthService";

class TytanAuth<T extends TytanAuthParams, TInjectableTypes = {
    user: T['adapters']['user']['types']['$User'],
    session: T['adapters']['session']['types']['$Session'],
}> {
    readonly endpoints: { [K: string]: any };
    readonly authService: AuthService<any, any>;
    constructor(
        readonly tokenManager: TokenAdapter<any>,
        private readonly strategies: StrategyCore[],
        public readonly adapters: {
            user: T['adapters']['user'],
            session: T['adapters']['session'],
        },
        private readonly _config?: TytanAuthConfigInput
    ) {
        const config: TytanAuthConfigOutput = {
            accessTokenExpires: /* @default 2min */ 60 * 2,
            refreshTokenExpires: /* @default 30days */ 60 * 60 * 24 * 30,
            sessionIdSize: 12,
            refreshTokenRenewalPeriod: 0,
            /**
             * 기본적으로 user id와 role을 갖고 있지만,
             * 서비스가 커질수록 attribute를 추가할 여지가 있음
             */
            setUserTokenAttributes: ({ id, role }: any) => ({
                id,
                ...(role ? { role }: {}),
            }),
            ...this._config,
        }
        const token = new TokenManager(this.tokenManager, config);
        const auth = this.authService = getAuthService({ token, config, ...adapters });
        const strategyCores = this.strategies
            .map((createStrategy) => {
                const { name, endpoints } = createStrategy({ token, ...adapters, auth, types: {} as any });
                return [name, endpoints];
            })
        this.endpoints = Object.fromEntries(strategyCores);
    }
}
const Auth = <T extends TytanAuthParams>({ token, strategies, adapters, config }: T) => {
    const { adapters: { user, session }, endpoints, authService, tokenManager } = new TytanAuth<T>(
        token,
        strategies,
        adapters,
        config,
    );
    type Strategy = ReturnType<T['strategies'][number]>;
    return {
        ...endpoints,
        ...authService,
        user,
        session,
        tokenManager,
    } as {
        user: T['adapters']['user'],
        session: T['adapters']['session'],
        tokenManager: TokenAdapter<any>,
        types: Strategy['types'] & T['adapters']['user']['types'] & T['adapters']['session']['types']
    } & {
        [K in Strategy['name']]: Strategy['endpoints']
    } & AuthService<any, any>;
}
export default Auth;
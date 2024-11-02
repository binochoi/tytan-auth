import { AuthService, SessionAdapter, StrategyCore, TokenAdapter, TytanAuthConfigInput, TytanAuthConfigOutput, UserAdapter } from "@tytan-auth/common";
import TokenManager from "./services/TokenManager";
import { TytanAuthParams, TytanAuthResults } from "@tytan-auth/common";
import { getAuthService } from "./services/AuthService";

const Tytan = <
    TConfig extends TytanAuthConfigInput,
    TStrategies extends StrategyCore[],
    TUserAdapter extends UserAdapter,
    TSessionAdapter extends SessionAdapter,
    TTokenAdapter extends TokenAdapter<any>,
    TStrategy extends ReturnType<TStrategies[number]>,
    TEndpoints extends {
        [K in TStrategy['name']]: TStrategy['endpoints']
    }
>({
    token: tokenAdapter,
    strategies,
    adapters,
    config: configInput,
}: TytanAuthParams<TConfig, TStrategies, { user: TUserAdapter, session: TSessionAdapter }, TTokenAdapter>): TytanAuthResults<TEndpoints, typeof types, TUserAdapter, TSessionAdapter> => {
    const { user, session } = adapters;
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
        ...configInput,
    }
    const token = new TokenManager(tokenAdapter, config);
    const authService = getAuthService({ token, config, ...adapters });
    const strategyCores = strategies
        .map((createStrategy) => {
            const { name, endpoints } = createStrategy({ token, ...adapters, auth: authService, types: {} as any });
            return [name, endpoints];
        })
    const types = {} as TStrategy['types'] & TUserAdapter['types'] & TSessionAdapter['types']
    return {
        ...(Object.fromEntries(strategyCores) as TEndpoints),
        ...(authService as AuthService<any, any>),
        user,
        session,
        tokenManager: token,
        types,
    };
}

export default Tytan;
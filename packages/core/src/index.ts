import { AuthService, SessionAdapter, StrategyCore, TokenAdapter, TytanAuthConfigInput, TytanAuthConfigOutput, UserAdapter } from "@tytan-auth/common";
import TokenManager from "./services/TokenManager";
import { TytanAuthParams } from "@tytan-auth/common";
import { getAuthService } from "./services/AuthService";

const Tytan = <
    TConfig extends TytanAuthConfigInput,
    TStrategies extends StrategyCore[],
    TAdapters extends {
        user: UserAdapter,
        session: SessionAdapter,
    },
    TTokenAdapter extends TokenAdapter<any>
>({
    token: tokenManager,
    strategies,
    adapters,
    config: configInput,
}: TytanAuthParams<TConfig, TStrategies, TAdapters, TTokenAdapter>) => {
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
    const token = new TokenManager(tokenManager, config);
    const authService = getAuthService({ token, config, ...adapters });
    const strategyCores = strategies
        .map((createStrategy) => {
            const { name, endpoints } = createStrategy({ token, ...adapters, auth: authService, types: {} as any });
            return [name, endpoints];
        })
    type Strategy = ReturnType<TStrategies[number]>;
    const types = {} as {
        types: Strategy['types'] & TAdapters['user']['types'] & TAdapters['session']['types']
    }
    type Endpoints = {
        [K in Strategy['name']]: Strategy['endpoints']
    }
    return {
        ...(Object.fromEntries(strategyCores) as Endpoints),
        ...(authService as AuthService<any, any>),
        user,
        session,
        tokenManager,
        types,
    }
}

export default Tytan;
import { OauthEndpoints, StrategyCore } from "@tytan-auth/common";
import { type OAuth2Provider, OAuth2ProviderWithPKCE, generateCodeVerifier } from 'arctic';
/**
 * 
 */
type OAuthProvider = OAuth2Provider | OAuth2ProviderWithPKCE;
type OAuthState<TProviderKey extends string = string> = {
    provider: TProviderKey,
    codeVerifier: string,
    user?: {
        name: string,
    }
}
type ProviderInfo = [any, string, string]; // Constructor, clientId, clientSecret
type OAuthStrategyTypes<TProviderKey extends string> = {
    $OAuthProvider: TProviderKey,
}
const strategy = <TProviderKey extends string>({
    providers,
    redirectUrl
}: {
    providers: {
        [K in TProviderKey]: ProviderInfo
    },
    redirectUrl: string,
}): StrategyCore<OauthEndpoints<TProviderKey>, OAuthStrategyTypes<TProviderKey>> => ({
    token: tokenManager,
    adapters: {
        user: userAdapter,
        session: sessionAdapter,
    }
}) => {
    const providerDict = Object
        .entries(providers)
        .map(([providerName, info]) => {
            const [Provider, clientId, clientSecret] = info as ProviderInfo;
            return {
                [providerName]: new Provider(clientId, clientSecret, redirectUrl) as unknown as OAuthProvider
            };
        })
        .reduce((prev, current) => ({
            ...prev,
            ...current,
        }));
        const endpoints: OauthEndpoints<TProviderKey> = {
            createAuthorizationURL: async (providerName, rawState) => {
                const provider = providerDict[providerName];
                const codeVerifier = generateCodeVerifier();
                const statePayload = {
                    ...rawState,
                    provider: providerName,
                    codeVerifier,
                } satisfies OAuthState<TProviderKey>;
                const state = JSON.stringify(statePayload);
                return provider.createAuthorizationURL(state, codeVerifier);
            },
            validateAuthorizationCodeAndGenerateSession: async (code: string, state: string) => {
                const { provider: providerName, codeVerifier, user } = JSON.parse(state) as OAuthState<TProviderKey>;
                await userAdapter.insertOne(user);
                const provider = providerDict[providerName];
                const newTokens = tokenManager.issue(user);
                const {
                    refreshToken,
                    refreshTokenExpiresAt = newTokens.refreshTokenExpiresAt
                } = await provider.validateAuthorizationCode(code, codeVerifier);
                if(!refreshToken) {
                    throw new Error('refresh token is not forwarded');
                }
                const tokens = {
                    ...newTokens,
                    refreshToken,
                    refreshTokenExpiresAt: newTokens.refreshTokenExpiresAt || refreshTokenExpiresAt
                }
                const session = await sessionAdapter.insertOne(tokens);
                return { tokens, session };
            },
            // async refreshTokens(providerName, d) {
            //     const tokens = await providerDict[providerName].refreshAccessToken?.(d.refreshToken);
            //     if(!tokens) {
            //         throw new Error('refreshed oauth tokens are not exist');
            //     }
            //     if(!tokens.refreshToken) {
            //         throw new Error('refreshed oauth refresh token is not exist');
            //     }
            //     const session = await sessionAdapter.validate(tokens.refreshToken, tokens);
            //     const newTokens = tokenManager.issue(session);
            //     return { tokens, session };
            // }
        }
    return {
        name: 'oauth' as const,
        endpoints,
    } as {
        name: 'oauth',
        endpoints: OauthEndpoints<TProviderKey>,
        types: {
            $OAuthProvider: TProviderKey
        }
    }
}
export default strategy;
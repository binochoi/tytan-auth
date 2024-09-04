import { StrategyCore } from "@tytan-auth/common";
import { ProviderWrap } from '@tytan-auth/provider'

export interface Tokens {
    accessToken: string;
    refreshToken?: string | null;
    accessTokenExpiresAt?: Date;
    refreshTokenExpiresAt?: Date | null;
    idToken?: string;
}
export interface OauthEndpoints<TProviderKey extends string, TSession extends object = any> {
    createAuthorizationURL: (
        payload: {
            provider: TProviderKey,
            codeVerifier?: string,
            state?: {
                [K: string]: any,
            } 
        },
    ) => Promise<URL>,
    validateAuthorizationCodeAndGenerateSession: (params: {
        code: string,
        state: string,
        codeVerifier?: string
    }) => Promise<{
        tokens: Tokens,
        session: TSession,
        status: 'beginner' | 'existing'
    }>,
};
type OAuthState<TProviderKey extends string = string> = {
    provider: TProviderKey,
}
type OAuthStrategyTypes<TProviderKey extends string> = {
    $OAuthProvider: TProviderKey,
}
const strategy = <TProviderKey extends string, TSession extends object>({
    providers,
    redirectUri
}: {
    providers: ProviderWrap<TProviderKey>[],
    redirectUri: string,
}): StrategyCore<OauthEndpoints<TProviderKey>, OAuthStrategyTypes<TProviderKey>, 'oauth'> => ({
    token: tokenManager,
    adapters: {
        user: userAdapter,
        session: sessionAdapter,
    }
}) => {
    const providerDict = Object.fromEntries(
        providers.map(generateProvider => {
            const { name, ...params } = generateProvider({ redirectUri });
            return [name, params];
        })
    )
    const endpoints: OauthEndpoints<TProviderKey> = {
        createAuthorizationURL: async ({ provider: providerType, codeVerifier = '', state: rawState = {} }) => {
            const provider = providerDict[providerType];
            const state: OAuthState<TProviderKey> = { ...rawState, provider: providerType };
            return provider.createAuthorizationURL(state, codeVerifier);
        },
        validateAuthorizationCodeAndGenerateSession: async ({ code, state, codeVerifier = '' }) => {
            const { provider: providerType } = JSON.parse(state) as OAuthState<TProviderKey>;
            const provider = providerDict[providerType];
            const {
                accessToken,
                refreshToken,
                refreshTokenExpiresAt
            } = await provider.validateAuthorizationCode(code, codeVerifier);
            const { id: providerId } = await provider.getProfile(accessToken);
            const user = await userAdapter.findOne({ providerId, providerType }, []);
            const newTokens = await tokenManager.issue(user);
            if(!refreshToken) {
                throw new Error('refresh token is not forwarded');
            }
            const tokens = {
                ...newTokens,
                refreshToken,
                refreshTokenExpiresAt: newTokens.refreshTokenExpiresAt || refreshTokenExpiresAt
            }
            await userAdapter.insertOne(user);
            const session = await sessionAdapter.insertOne(tokens);
            return {
                tokens,
                session,
                status: (() => {
                    if(!user) {
                        return 'beginner' as const;
                    }
                    return 'existing' as const;
                })()
            };
        },
        // async refreshTokens(providerType, d) {
        //     const tokens = await providerDict[providerType].refreshAccessToken?.(d.refreshToken);
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
        endpoints: OauthEndpoints<TProviderKey, TSession>,
        types: {
            $OAuthProvider: TProviderKey
        }
    }
}
export default strategy;
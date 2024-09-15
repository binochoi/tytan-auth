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
    validateAndSign: (params: {
        code: string,
        state: string,
        codeVerifier?: string
    }) => Promise<{
        tokens: Tokens,
        user: any,
        profile?: any,
        status: 'beginner' | 'existing'
    }>
};
type OAuthState<TProviderKey extends string = string> = {
    provider: TProviderKey,
}
type OAuthStrategyTypes<TProviderKey extends string> = {
    $OAuthProviderName: TProviderKey,
}
const strategy = <TProviderKey extends string, TSession extends object>({
    providers,
    redirectUri
}: {
    providers: ProviderWrap<TProviderKey>[],
    redirectUri: string,
}): StrategyCore<OauthEndpoints<TProviderKey>, OAuthStrategyTypes<TProviderKey>, 'oauth'> => ({
    token: tokenManager,
    user: userManager,
    session: sessionManager,
    auth: authManager,
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
        validateAndSign: async ({ code, state, codeVerifier = '' }) => {
            const { provider: providerType } = JSON.parse(state) as OAuthState<TProviderKey>;
            const provider = providerDict[providerType];
            const {
                accessToken,
                // refreshToken,
                // refreshTokenExpiresAt,
            } = await provider.validateAuthorizationCode(code, codeVerifier);
            const { id: providerId, ...profile } = await provider.getProfile(accessToken);
            const payload = { providerId, providerType };
            const user = await userManager.findOne(payload, ['oauth']);
            if(!user) {
                const signed = await authManager.signup(payload);
                await userManager.insertOne({ ...payload, ...profile });
                return {
                    ...signed,
                    status: 'beginner',
                }
            }
            return authManager.signin({ id: user.id });
        },
        // async refreshTokens(providerType, d) {
        //     const tokens = await providerDict[providerType].refreshAccessToken?.(d.refreshToken);
        //     if(!tokens) {
        //         throw new Error('refreshed oauth tokens are not exist');
        //     }
        //     if(!tokens.refreshToken) {
        //         throw new Error('refreshed oauth refresh token is not exist');
        //     }
        //     const session = await sessionManager.validate(tokens.refreshToken, tokens);
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
            $OAuthProviderName: TProviderKey
        }
    }
}
export default strategy;
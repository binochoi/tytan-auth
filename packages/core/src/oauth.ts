import { StrategyCore } from "@tytan-auth/common";
import { OauthEndpoints, OAuthParam, OAuthState, OAuthStrategyTypes } from 'src/types/oauth.type';

const strategy = <TProviderKey extends string, TSession extends object>({
    providers,
    redirectUri
}: OAuthParam<TProviderKey>): StrategyCore<OauthEndpoints<TProviderKey>, OAuthStrategyTypes<TProviderKey>, 'oauth'> => ({
    user: userManager,
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
            } = await provider.validateAuthorizationCode(code, codeVerifier);
            const { id: providerId, ...profile } = await provider.getProfile(accessToken);
            const payload = { providerId, providerType };
            const user = await userManager.findOne(payload, ['oauth']);
            if(!user) {
                const signed = await authManager.signup(payload);
                return {
                    ...signed,
                    profile,
                }
            }
            const signed = await authManager.signin({ id: user.id });
            return {
                ...signed,
                profile,
            }
        },
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
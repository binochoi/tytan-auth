import { OAuth2Provider, OAuth2ProviderWithPKCE } from "arctic";
import { ProviderGenerator } from "src/types";

/**
 * @example
 * ```ts
 *  adapter(Kakao, { clientId, clientSecret, scopes })
 * ```
*/
const arcticAdapter: ProviderGenerator = (
    name,
    Provider,
    { clientId, clientSecret, scopes },
    { profileFetchUri, extractRawProfile },
) => ({ redirectUri }) => {
    const provider = new Provider(clientId, clientSecret, redirectUri) as unknown as OAuth2Provider | OAuth2ProviderWithPKCE;
    const createAuthorizationURL = async <T extends object = any>(state: T, codeVerifier = '') => {
        const isPKCE = provider.createAuthorizationURL.length === 3;
        const options = { scopes };
        const params = isPKCE ? [codeVerifier, options] : [options];
        const stateStr = JSON.stringify(state);
        const url: URL = await (provider.createAuthorizationURL as any)(stateStr, ...params);
        if(name === 'google') {
            url.searchParams.set("access_type", "offline");
        }
        return url;
    }
    const getProfile = async (accessToken: string) => {
        const res = await fetch(profileFetchUri, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        const raw: any = await res.json();
        return {
            ...extractRawProfile(raw),
            raw,
        }
    }
    return {
        name,
        ...provider,
        createAuthorizationURL,
        getProfile,
    }
};
export default arcticAdapter;
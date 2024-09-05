import type { OAuth2Provider, OAuth2ProviderWithPKCE } from "arctic";
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
    const provider: Promise<OAuth2Provider | OAuth2ProviderWithPKCE> = Provider.then((Provider: any) => new Provider(clientId, clientSecret, redirectUri))
    const createAuthorizationURL = async <T extends object = any>(state: T, codeVerifier = '') => {
        const isPKCE = (await provider).createAuthorizationURL.length === 3;
        const options = { scopes };
        const params = isPKCE ? [codeVerifier, options] : [options];
        const stateStr = JSON.stringify(state);
        const url: URL = await ((await provider).createAuthorizationURL as any)(stateStr, ...params);
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
    const validateAuthorizationCode = async (code: string, codeVerifier: string) => (await provider).validateAuthorizationCode(code, codeVerifier);
    return {
        name,
        validateAuthorizationCode,
        createAuthorizationURL,
        getProfile,
    }
};
export default arcticAdapter;
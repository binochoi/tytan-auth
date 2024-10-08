import { SessionTokens } from "@tytan-auth/common";

export type Tokens = SessionTokens & { idToken?: string };
interface Profile {
    id: string,
    name?: string,
    email?: string,
    image?: string,
}
type OAuthTokens = {
    accessToken: string;
    refreshToken?: string | null;
    accessTokenExpiresAt?: Date;
    refreshTokenExpiresAt?: Date | null;
    idToken?: string;
}
export type Provider<TRawProfile = any, TName extends string = string> = {
    name: TName,
    createAuthorizationURL: <T extends object = any>(state: T, codeVerifier?: string) => Promise<URL>
    refreshAccessToken?: (refreshToken: string) => Promise<OAuthTokens>
    validateAuthorizationCode(code: string, codeVerifier?: string): Promise<OAuthTokens>
    getProfile: (accessToken: string) => Promise<Profile & Record<'raw', TRawProfile>>,
}
export type ProviderGeneratorParams = {
    clientId: string,
    clientSecret: string,
    scopes?: string[],
}
export type ProviderContext = {
    redirectUri: string,
}
export type ProviderConfig<TRawProfile> = {
    profileFetchUri: string,
    extractRawProfile: (profile: TRawProfile) => Profile
}
export type ProviderGenerator = <TName extends string, TRawProfile extends object = any>(name: TName, Provider: any, params: ProviderGeneratorParams, config: ProviderConfig<TRawProfile>) => ProviderWrap<TName, TRawProfile>;
export type ProviderWrap<TName extends string, TRawProfile extends object = any> = (context: ProviderContext) => Provider<TRawProfile, TName>;
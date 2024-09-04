
export interface Tokens {
    accessToken: string;
    refreshToken?: string | null;
    accessTokenExpiresAt?: Date;
    refreshTokenExpiresAt?: Date | null;
    idToken?: string;
}
export type Provider<TRawProfile extends object, TName extends string = string, TProfile = {
    id: string,
    name?: string,
    email?: string,
    image?: string,
}> = {
    name: TName,
    createAuthorizationURL: <T extends object = any>(state: T, codeVerifier?: string) => Promise<URL>
    refreshAccessToken?: (refreshToken: string) => Promise<Tokens>
    validateAuthorizationCode(code: string, codeVerifier?: string): Promise<Tokens>
    getProfile: (accessToken: string) => Promise<TProfile & Record<'raw', TRawProfile>>,
}
export type ProviderGeneratorParams = {
    clientId: string,
    clientSecret: string,
    scopes?: string[],
}
export type ProviderContext = {
    redirectUri: string,
}
export type ProviderConfig<TRawProfile, TProfile> = {
    profileFetchUri: string,
    extractRawProfile: (profile: TRawProfile) => TProfile
}
export type ProviderGenerator = <TName extends string, TRawProfile extends object = any, TProfile extends object = any>(name: TName, Provider: any, params: ProviderGeneratorParams, config: ProviderConfig<TRawProfile, TProfile>) => ProviderWrap<TName, TRawProfile>;
export type ProviderWrap<TName extends string, TRawProfile extends object = any> = (context: ProviderContext) => Provider<TRawProfile, TName>;
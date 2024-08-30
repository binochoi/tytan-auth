
export interface Tokens {
    accessToken: string;
    refreshToken?: string | null;
    accessTokenExpiresAt?: Date;
    refreshTokenExpiresAt?: Date | null;
    idToken?: string;
}
export type Provider<TName extends string = string> = {
    name: TName,
    createAuthorizationURL: <T extends object = any>(state: T, codeVerifier?: string) => Promise<URL>
    refreshAccessToken?: (refreshToken: string) => Promise<Tokens>
    validateAuthorizationCode(code: string, codeVerifier?: string): Promise<Tokens>
}
export type ProviderGeneratorParams = {
    clientId: string,
    clientSecret: string,
    scopes?: string[],
}
export type ProviderContext = {
    redirectUri: string,
}
export type ProviderGenerator = <TName extends string>(name: TName, Provider: any, params: ProviderGeneratorParams) => ProviderWrap<TName>;
export type ProviderWrap<TName extends string> = (context: ProviderContext) => Provider<TName>;
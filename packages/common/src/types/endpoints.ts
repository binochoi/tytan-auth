
interface Tokens {
    accessToken: string;
    refreshToken?: string | null;
    accessTokenExpiresAt?: Date;
    refreshTokenExpiresAt?: Date | null;
    idToken?: string;
}
export interface OauthEndpoints<TProviderKey extends string> {
    'createAuthorizationURL': (
        provider: TProviderKey,
        state?: {
            [K: string]: any,
            user?: {
                name: string;
            }
        }
    ) => Promise<URL>,
    'validateAuthorizationCodeAndGenerateSession': (code: string, state: string) => Promise<{ tokens: Tokens, session: any }>,
    // 'refreshTokens': (provider: TProviderKey, tokens: Record<'refreshToken', string>) => Promise<{ tokens: Tokens, session: any }> | undefined,
};
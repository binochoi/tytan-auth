import { SessionTokens, StrategyCore } from "@tytan-auth/common";
import { ProviderWrap } from '@tytan-auth/provider'

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
        tokens: SessionTokens,
        user: any,
        profile?: any,
        session: any,
        status: 'beginner' | 'existing'
    }>
};
export type OAuthParam<TProviderKey extends string> = {
    providers: ProviderWrap<TProviderKey>[],
    redirectUri: string,
};
export type OAuthState<TProviderKey extends string = string> = {
    provider: TProviderKey,
}
export type OAuthStrategyTypes<TProviderKey extends string> = {
    $OAuthProviderName: TProviderKey,
}
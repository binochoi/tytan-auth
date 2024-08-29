import { TokenManager, TokenManagerParams, SessionTokens } from '@tytan-auth/common';
class JwtManager<T extends object> implements TokenManager<T> {
    constructor({
        secret,
        accessTokenExpires = 1000 * 60 * 2,
        refreshTokenExpires = 1000 * 60 * 60 * 24 * 30
    }: TokenManagerParams) {
        
    }
    issue: (data: T) => SessionTokens;
    validate(token: string): T {
        throw new Error('Method not implemented.');
    }
}
export default <T extends object>(params: TokenManagerParams) => new JwtManager<T>(params);
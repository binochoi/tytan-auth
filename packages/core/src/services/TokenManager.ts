import { DefaultUser as User, TokenManager as ITokenManager, SessionTokens, TokenAdapter, TytanAuthConfigOutput } from "@tytan-auth/common";

/**
 * at, rt 관리 클래스
 * 토큰 자동 refresh 로직.
 * - 로그인 하면 쿠키에 넣을 토큰을 발급함 (RT, AT)
 *   persisted를 X-User라는 헤더로 받아 session storage에 저장함
 * - 이후 사이트를 왔다갔다 할 경우 쿠키가 있으면 validation을 하는데,
 * - validation failed 뜰 경우 RT, AT 모두 변경함.
 */
export default class TokenManager<T extends object> implements ITokenManager {
    constructor(
        private readonly token: TokenAdapter<any>,
        private readonly config: TytanAuthConfigOutput
    ) {}
    async generate<T extends User>(data: T): Promise<SessionTokens> {
        const accessTokenExpiresAt = new Date(Date.now() + this.config.accessTokenExpires);
        const accessToken = await this.token.generate(data, accessTokenExpiresAt.getTime());
        const refreshTokenExpiresAt = new Date(Date.now() + this.config.refreshTokenExpires);
        const refreshToken = await this.token.generate(data, refreshTokenExpiresAt.getTime());
        return {
            accessToken,
            accessTokenExpiresAt,
            refreshToken,
            refreshTokenExpiresAt
        }
    }
    /** @param token at or rt */
    validate(token: string) {
        return this.token.verify(token);
    };
    // refreshAccessToken() {}
}
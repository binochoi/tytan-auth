import { DefaultUser as User, DefaultSession as Session, TokenManager as ITokenManager, SessionTokens, TokenAdapter, TytanAuthConfigOutput } from "@tytan-auth/common";

/**
 * at, rt 관리 클래스
 * 토큰 자동 refresh 로직.
 * - 로그인 하면 쿠키에 넣을 토큰을 발급함 (RT, AT)
 *   persisted를 X-User라는 헤더로 받아 session storage에 저장함
 * - 이후 사이트를 왔다갔다 할 경우 쿠키가 있으면 validation을 하는데,
 * - validation failed 뜰 경우 RT, AT 모두 변경함.
 */
export default class TokenManager implements ITokenManager {
    constructor(
        private readonly token: TokenAdapter<any>,
        private readonly config: TytanAuthConfigOutput
    ) {}
    
    async generate<TUser extends User, TSession extends Session>(at: TUser, rt?: TSession) {
        const { accessTokenExpires, refreshTokenExpires, setUserTokenAttributes } = this.config;
        const accessToken = await this.token.generate(setUserTokenAttributes(at), accessTokenExpires);
        if(!rt) {
            return { accessToken, accessTokenExpires, refreshToken: '', refreshTokenExpires: 0 }
        }
        const refreshToken = await this.token.generate(rt, refreshTokenExpires);
        return {
            accessToken,
            accessTokenExpires,
            refreshToken,
            refreshTokenExpires
        }
    }
    /** @param token at or rt */
    validate(token: string) {
        return this.token.verify(token);
    };
    // refreshAccessToken() {}
}
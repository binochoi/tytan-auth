import { DefaultSession, DefaultUser, AuthService as IAuthService, SessionAdapter, TokenAdapter, TokenManager, UserAdapter } from '@tytan-auth/common';
class AuthService<
    TUser extends DefaultUser,
    TSession extends DefaultSession,
> implements IAuthService<TUser, TSession> {
    constructor(
        private readonly userManager: UserAdapter,
        private readonly sessionManager: SessionAdapter,
        private readonly tokenManager: TokenManager
    ) {}
    async signup(userInfo: TUser) {
        const { mail } = userInfo;
        const user = await this.userManager.findOne({ mail }, []);
        if(user) {
            const tokens = await this.tokenManager.generate(user);
            const session = await this.sessionManager.insertOne({
                id: tokens.refreshToken,
                userId: user.id,
            });
            return {
                user,
                session,
                tokens,
                status: 'existing' as const,
            }
        }
        const newUser = await this.userManager.insertOne(userInfo);
        const tokens = await this.tokenManager.generate(newUser);
        const session = await this.sessionManager.insertOne({
            id: tokens.refreshToken,
            userId: newUser.id,
            expiresAt: tokens.refreshTokenExpiresAt,
        });
        const status: 'existing' | 'beginner' = newUser.mail ? 'existing' : 'beginner';
        return {
            user: newUser,
            session,
            tokens,
            status,
        }
    }
    async signin(where: TUser) {
        console.log('sign in...', where); /* @DELETE  */
        const user = await this.userManager.findOne(where, ['oauth']);
        console.log('???'); /* @DELETE  */
        if(!user) {
            throw new Error('user is not exist');
        }
        const tokens = await this.tokenManager.generate(user);
        const session = await this.sessionManager.insertOne({
            id: tokens.refreshToken,
            userId: user.id,
            expiresAt: tokens.refreshTokenExpiresAt,
        });
        const status: 'existing' | 'beginner' = user.mail ? 'existing' : 'beginner';
        return {
            user,
            session,
            tokens,
            status,
        }
    }
    async verifyOrRefresh(accessToken: string, refreshToken: string) {
        const isHealthy = await this.tokenManager.validate(accessToken);
        if(isHealthy) {
            return { status: 'healthy' as const }
        }
        const { isExpired, userId } = await this.sessionManager.validate(refreshToken);
        if(!isExpired) {
            return { status: 'expired' as const }
            // remove cookie, session
        }
        const user = await this.userManager.findOne({ id: userId }, []);
        if(!user) {
            // throw
        }
        const tokens = await this.tokenManager.generate(user);
        const session = await this.sessionManager.insertOne({
            id: tokens.refreshToken,
            userId: user.id,
        });
        return {
            status: 'refreshed' as const,
            session,
            tokens,
        }
    }
}

export const getAuthService = ({
    user, session, token
}: {
    user: UserAdapter,
    session: SessionAdapter,
    token: TokenManager
}) => new AuthService(user, session, token);
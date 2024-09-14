import { DefaultSession, DefaultUser, AuthService as IAuthService } from '@tytan-auth/common';
class AuthService<
    TUser extends DefaultUser,
    TSession extends DefaultSession,
> implements IAuthService<TUser, TSession> {
    constructor(
        private readonly userManager: any,
        private readonly sessionManager: any,
        private readonly tokenManager: any
    ) {}
    async signup(userInfo: TUser) {
        const { mail } = userInfo;
        const user = await this.userManager.find({ mail });
        if(user) {
            const tokens = await this.tokenManager.generate(user);
            const session = await this.sessionManager.insert(tokens.refreshToken, user.id);
            return {
                user,
                session,
                tokens,
                status: 'existing' as const,
            }
        }
        const newUser = await this.userManager.insert(userInfo);
        const tokens = await this.tokenManager.generate(newUser);
        const session = await this.sessionManager.insert(tokens.refreshToken, user.id);
        const status: 'existing' | 'newbie' = user.mail ? 'existing' : 'newbie';
        return {
            user: newUser,
            session,
            tokens,
            status,
        }
    }
    async signin(where: TUser) {
        const user = await this.userManager.find(where);
        if(!user) {
            throw new Error('user is not exist');
        }
        const tokens = await this.tokenManager.generate();
        const session = await this.sessionManager.insert(tokens.refreshToken, user.id);
        const status: 'existing' | 'newbie' = user.mail ? 'existing' : 'newbie';
        return {
            user,
            session,
            tokens,
            status,
        }
    }
    async verifyOrRefresh(accessToken: string, refreshToken: string) {
        const isHealthy = await this.tokenManager.verify(accessToken);
        if(isHealthy) {
            return { status: 'healthy' as const }
        }
        const { isExpired, userId } = await this.sessionManager.verify(refreshToken);
        if(!isExpired) {
            return { status: 'expired' as const }
            // remove cookie, session
        }
        const user = await this.userManager.find({ id: userId });
        if(!user) {
            // throw
        }
        const tokens = await this.tokenManager.generate(user);
        const session = await this.sessionManager.insert(userId, tokens.refreshToken);
        return {
            status: 'refreshed' as const,
            session,
            tokens,
        }
    }
}

export const getAuthService = ({
    user, session, token
}: any) => new AuthService(user, session, token);
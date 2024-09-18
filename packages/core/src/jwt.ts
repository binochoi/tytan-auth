import { TokenManagerParams, SessionTokens, TokenAdapter } from '@tytan-auth/common';
import * as jwt from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';
class JwtAdapter<T extends object> implements TokenAdapter<T> {
    private readonly secret: string;
    constructor({
        secret,
    }: TokenManagerParams) {
        this.secret = secret;
    }
    async generate(payload: T, expiresIn: number): Promise<string> {
        return jwt.sign(payload, this.secret, { expiresIn });
    }
    async verify(token: string): Promise<T & JwtPayload> {
        return new Promise((resolve, reject) => {
            jwt.verify(
                token,
                this.secret,
                (err, decoded) => err ? reject(err) : resolve(decoded as T & JwtPayload)
            )
        });
    }
}
export default <T extends object>(params: TokenManagerParams) => new JwtAdapter<T>(params);
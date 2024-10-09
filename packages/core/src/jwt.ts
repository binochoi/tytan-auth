import { TokenManagerParams, SessionTokens, TokenAdapter } from '@tytan-auth/common';
import * as jsonwebtoken from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';
class JwtAdapter<T extends object> implements TokenAdapter<T> {
    private readonly secret: string;
    private readonly jwt = ('default' in jsonwebtoken) ? jsonwebtoken.default as typeof jsonwebtoken : jsonwebtoken;
    constructor({
        secret,
    }: TokenManagerParams) {
        this.secret = secret;
    }
    async generate(payload: T, expiresIn: number): Promise<string> {
        return this.jwt.sign(payload, this.secret, { expiresIn });
    }
    async verify(token: string): Promise<T & JwtPayload> {
        return new Promise((resolve, reject) => {
            this.jwt.verify(
                token,
                this.secret,
                (err, decoded) => err ? reject(err) : resolve(decoded as T & JwtPayload)
            )
        });
    }
}
export default <T extends object>(params: TokenManagerParams) => new JwtAdapter<T>(params);
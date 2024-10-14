import { JWTPayload, jwtVerify, SignJWT } from 'jose';
import { TokenManagerOptions, TokenAdapter } from '@tytan-auth/common';

class JoseAdapter<T extends {}> implements TokenAdapter<T> {
  private readonly secret: Uint8Array;
  private readonly alg: string;
  
  constructor({
    alg = 'HS256',
    secret,
  }: TokenManagerOptions) {
    this.secret = new TextEncoder().encode(secret);
    this.alg = alg;
  }
  
  async generate(payload: T, expiresIn: number): Promise<string> {
    const { secret, alg } = this;
    return new SignJWT(payload)
      .setIssuedAt()
      .setProtectedHeader({ alg })
      .setExpirationTime(Date.now() + expiresIn)
      .sign(secret);
  }
  
  async verify(token: string): Promise<T & JWTPayload> {
    const { payload } = await jwtVerify(token, this.secret);
    return payload as T & JWTPayload;
  }
}
export default <T extends object>(params: TokenManagerOptions) => new JoseAdapter<T>(params);

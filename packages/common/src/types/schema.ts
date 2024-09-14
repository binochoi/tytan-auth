
export type DefaultUser = {
    id: number,
    name: string,
    mail: string,
    lastAccessAt: Date,
    signUpAt: Date,
    [K: string]: string | number | Date,
}
export type DefaultSession = {
    id: string, // refreshToken,
    userId: number,
    expiresAt: Date,
    [K: string]: string | number | Date,
}
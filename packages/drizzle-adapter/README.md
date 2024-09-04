

# user 스키마
```ts
// 기본
{
    id: number,
    mail?: string,
    phoneNumber?: string,
    name: string,
    lastAccessAt: Date,
}
// with oauth
{ // users_provider.table
    id: number,
    pid: string,
    type: 'google' | 'kakao',
}
// with local
{
    id: number,
    password: string,
}
// with only mail
{
    id: string,
    expiresAt: Date,
    /** id to allow access */
    userId: number,
}

```
# session 스키마
```ts
{
    /** sessionId */
    id: string,
    userId: number,
    /** 나중에 lastAccessAt에 덮어씌우는 용도? */
    createdAt: Date,
    expiresAt: Date,
}
```
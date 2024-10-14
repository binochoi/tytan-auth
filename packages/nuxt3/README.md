# 서버일 경우
로그인 시 AT, RT 받음
페이지 이동할때마다 AT 넘김.
만료되었을 경우 refresh 요청 알아서 보냄.

## prerequisite
- ssr 시에 요청한 클라이언트의 쿠키를 가져오는 모듈 필요

# 클라이언트일 경우
쿠키로 알아서 인증되기 때문에 refresh만 잘 해주면 됨.
refresh 페이지도 필요하고.


# Vue 3
```ts
import Tytan from '@tytan-auth/vue'
app.use(
    Tytan({
        host: '/api',
    }),
);
```
# Nuxt 3
```ts
import TytanAuth from '@tytan-auth/nuxt3'
import { local } from '@tytan-auth/client'

app.use(
    new TytanClient({
        host: '/api',
        plugins: [
            local(),
            oauth(),
            magiclink(),
        ],
    }),
);
```
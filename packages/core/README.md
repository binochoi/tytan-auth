```ts
import { TytanAuth } from '@tytan/core';
import { local, oauth } from '@tytan/core/strategy';
import { rateLimitter, delay } from '@tytan/server/plugins';

const auth = new TytanAuth({
	token,
	adapters: {
		userAdapter,
		sessionAdapter,
	},
	strategies: [
		local(),
		oauth({
			providers: {
				google: new Google(),
				naver: new Naver(),
			}
		})
	],
	sender: {
		email: mailgun(),
		phoneNumber: firebase(),
	},
	plugins: [
		rateLimitter(), // 새 테이블이 필요함.. adapter도 redis꺼 고려중
		delay(1000), // default delay
	],
});
```
# iFunny.ts

![License](https://img.shields.io/npm/l/ifunny.ts)
![npm](https://img.shields.io/npm/v/ifunny.ts)

The go-to iFunny API wrapper library written in TypeScript! Reverse engineered from the ground up, taking heavy inspiration from discord.js!

## Authors

-   [@MakeShiftArtist](https://www.github.com/MakeShiftArtist)

## Example Usage

Install iFunny.ts

```sh-session
  npm install ifunny.ts
```

Get your basic token

```ts
import iFunnyClient from "ifunny.ts";

const client = new iFunnyClient();
console.log(client.basic);
```

Store your basic token in a config

```json
{
	"bearer": "yourTokenHere"
}
```

Pass basic token into client constructor

```ts
import iFunnyClient from "ifunny.ts";
import config from "./config.json";

const client = new iFunnyClient({ basic: config.basic });
console.log(client.basic); // should be the one stored
```

Get your bearer token

```ts
import iFunnyClient from "ifunny.ts";
import config from "./config.json";

const client = new iFunnyClient({ basic: config.basic });

client.on("ready", (client) => {
	console.log(client.bearer);
});

client.login("your@email.com", "yourpassword").catch((error) => {
	// if a captcha is returned
	if (error.captcha_url) {
		// log it
		console.log(error.captcha_url);
		// Open the url in any browser and solve it. Then run the script again
	} else throw error;
});
```

## Links

-   [npm](https://www.npmjs.com/package/ifunny.ts)
-   [GitHub](https://github.com/ifunny-co/iFunny.ts)
-   [iFunny API Discord Server](https://discord.gg/Wvkycj5xGW)

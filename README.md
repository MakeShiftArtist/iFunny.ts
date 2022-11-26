# iFunny.ts

![License](https://img.shields.io/npm/l/ifunny.ts)
![npm](https://img.shields.io/npm/v/ifunny.ts)

The go-to iFunny API wrapper library written in TypeScript! Reverse engineered from the ground up, taking heavy inspiration from discord.js!

## Authors

-   [@MakeShiftArtist](https://www.github.com/MakeShiftArtist)

## Example Usage

Install iFunny.ts

```powershell
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
	"basic": "yourTokenHere"
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
import iFunnyClient, { iFunnyError } from "ifunny.ts";
import config from "./config.json";

const client = new iFunnyClient({ basic: config.basic });

client.on("ready", (client) => {
	console.log(client.bearer);
});

async function main() {
	await client.prime_basic(); // This only needs to be run once per basic token. Any time you create a new basic token, it needs to be primed. This will wait 15 seconds to prime it
	try {
		await client.login("your@email.com", "your_password!");
		console.log("Client logged in successfully!");
	} catch (error) {
		if (!iFunnyError.isiFunnyError(error)) throw error;
		console.log(error.message);
	}
}

main();
```

## Links

-   [npm](https://www.npmjs.com/package/ifunny.ts)
-   [GitHub](https://github.com/ifunny-co/iFunny.ts)
-   [iFunny API Discord Server](https://discord.gg/Wvkycj5xGW)

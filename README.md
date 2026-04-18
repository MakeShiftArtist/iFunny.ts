# iFunny.ts

![License](https://img.shields.io/npm/l/ifunny.ts)
![npm](https://img.shields.io/npm/v/ifunny.ts)

The go-to iFunny API wrapper library written in TypeScript! Reverse engineered from the ground up, taking heavy inspiration from discord.js!

Full documentation can be found [here](https://makeshiftartist.github.io/iFunny.ts/)

## Authors

- [@MakeShiftArtist](https://www.github.com/MakeShiftArtist)

## Quick Start Guide

While the iFunny client is able to do quite a bit without logging in, to use the full feature set you'll want to get authorization.

There are 2 ways to get a basic token and a bearer token

1. Use a packet sniffer while already logged in to iFunny.
2. Use the iFunny.ts client to login and generate new basic and bearer tokens

I won't be walking you through the first option as that is a lengthy process of setting up and configuring.

Instead, I'll walk you through using the custom Client.

If you don't want to write any code, you can clone the repo, and run the "login" script

```sh
git clone https://github.com/MakeShiftArtist/iFunny.ts.git

cd iFunny.ts

npm i

npm run login
```

This will prompt you to enter your username and password

```
Enter your iFunny username (email address): your@email.com
Enter your iFunny password: *********
Re-enter your iFunny password: *********
Priming Basic Token...
Basic Primed! RTJCM0FENzlCMkNCNDgyOEFBNTc2QjIyNEEyREQ4MDFfTXNPSUozOVEyODpmOTMyMjE3N2ZhYTM1MTVjMjZlN2M1MjY5NTcyYzY4M2VmYTk5YzZl
Replace `const BASIC = null` with your basic token
Logging in...
Captcha error!
Human verification is required: https://ifunny.co/captcha/c272fd81558bcf.24861254
Open the link above in a browser, solve the captcha, and run the script again.
```

Priming the basic token takes 15 seconds to complete.
The long string of characters after "Basic Primed!" is your Basic Token.
Save that and set it for the `BASIC` variable in `./login.ts`
Once that's done, solve the captcha and run the script again.

```sh
npm run login
```

After entering your credentials once more, you should get sucessfully logged in

```
Enter your iFunny username (email address): your@email.com
Enter your iFunny password: *********
Re-enter your iFunny password: *********
Logging in...
Logged in successfully!
Basic Token: RTJCM0FENzlCMkNCNDgyOEFBNTc2QjIyNEEyREQ4MDFfTXNPSUozOVEyODpmOTMyMjE3N2ZhYTM1MTVjMjZlN2M1MjY5NTcyYzY4M2VmYTk5YzZl
Bearer Token: 0d8527df847cb15b1c808422a7b150951fe7452bdb0a04d0c2bf920d2a302466
```

Once you see these, you'll want to save these somewhere secure.
NEVER SHARE THESE WITH ANYONE. A bearer token grants full control over your account.

## Example Usage

Install iFunny.ts

```powershell
  npm install ifunny.ts
```

```ts
import iFunnyClient from "ifunny.ts";

const client = new iFunnyClient({
    basic: process.env.BASIC,
    bearer: process.env.BEARER,
});

async function main() {
    const user = client.users.byNick("iFunnyChef");
    if (user) {
        console.log(user.id);
        await user.suscribe();
    }
}
```

## Links

- [Documentation](https://makeshiftartist.github.io/iFunny.ts/)
- [npm](https://www.npmjs.com/package/ifunny.ts)
- [GitHub](https://github.com/ifunny-co/iFunny.ts)
- [iFunny API Discord Server](https://discord.gg/Wvkycj5xGW)

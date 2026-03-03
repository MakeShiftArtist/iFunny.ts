import Client, { Errors } from "../src/index.ts"; // or import from "ifunny.ts";
import readline from "node:readline";
const { stdin: input, stdout: output } = await import("node:process");

const rl = readline.promises.createInterface({ input, output });

// * After solving the captcha, replace null with your basic token
const BASIC: string | null = Deno.args[1] || Deno.env.get("IFUNNY_BASIC") ||
    null; // ! Failing to replace this value will result in another captcha error

/**
 * Prompts the user for their username
 * @returns The username
 */
async function getUsername(): Promise<string> {
    return await rl.question("Enter your iFunny username (email address): ");
}

/**
 * Prompts the user for their password and verifies it\
 * This function is called recursively until the user enters the same password twice
 * @returns The password
 */
async function getPassword() {
    const pass1 = await rl.question("Enter your iFunny password: ");

    const pass2 = await rl.question("Re-enter your iFunny password: ");

    if (pass1 !== pass2) {
        console.log("Passwords do not match!");
        await getPassword();
    }
    return pass1;
}

async function main() {
    const client = new Client({ basic: BASIC });

    const username = await getUsername();
    const password = await getPassword();

    // This primes a basic token before attempting to login
    if (BASIC === null) {
        console.log("Priming Basic Token...");
        await client.primeBasic();
        console.log("Basic Primed!", client.basic);
        console.log("Replace `const BASIC = null` with your basic token");
    }

    console.log("Logging in...");
    try {
        // This is expected to throw a CaptchaError on the first attempt
        await client.login(username, password);
    } catch (error) {
        if (error instanceof Errors.CaptchaError) {
            console.log("Captcha error!");
            console.log(error.message);
            console.log(error.captchaUrl);
            console.log(
                "Open the link above in a browser, solve the captcha, replace null with your basic token, and run the script again.",
            );
            Deno.exit(1);
        } else throw error;
    }

    if (client.isAuthorized()) {
        console.log("Logged in successfully!");
        console.log("Basic Token: " + client.basic);
        console.log("Bearer Token: " + client.bearer);
        Deno.exit(0);
    } else {
        console.log("Login failed!");
        Deno.exit(1);
    }
}

main();

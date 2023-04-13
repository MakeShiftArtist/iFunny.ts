import Client, { CaptchaError } from "./src"; // or import from "ifunny.ts";
import rl from "readline-sync";

// * After solving the captcha, replace null with your basic token
const BASIC: string | null = null; // ! Failing to replace this value will result in another captcha error

/**
 * Prompts the user for their username
 * @returns The username
 */
function getUsername(): string {
	return rl.question("Enter your iFunny username (email address): ");
}

/**
 * Prompts the user for their password and verifies it\
 * This function is called recursively until the user enters the same password twice
 * @returns The password
 */
function getPassword() {
	const pass1 = rl.question("Enter your iFunny password: ", {
		hideEchoBack: true,
	});

	const pass2 = rl.question("Re-enter your iFunny password: ", {
		hideEchoBack: true,
	});

	if (pass1 !== pass2) {
		console.log("Passwords do not match!");
		getPassword();
	}
	return pass1;
}

async function main() {
	const client = new Client({ basic: BASIC });

	const username = getUsername();
	const password = getPassword();

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
		if (error instanceof CaptchaError) {
			console.log("Captcha error!");
			console.log(error.message);
			console.log(
				"Open the link above in a browser, solve the captcha, replace null with your basic token, and run the script again."
			);
			process.exit(1);
		} else throw error;
	}

	if (client.isAuthorized()) {
		console.log("Logged in successfully!");
		console.log("Basic Token: " + client.basic);
		console.log("Bearer Token: " + client.bearer);
	} else {
		console.log("Login failed!");
		process.exit(1);
	}
}

main();

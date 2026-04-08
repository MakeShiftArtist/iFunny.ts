import type { Client } from "./Client";
import type { Topic } from "@ifunny/ifunny-api-types";

/**
 * Event handler type for subscribe callbacks
 */
type SubscriptionHandler<T = Record<string, any>> = (eventType: number, event: T) => void;

/**
 * WAMP WebSocket connection wrapper for chat operations
 * @internal
 */
export class Chat {
    /**
     * WAMP client instance (autobahn Connection)
     * @internal
     */
    #ws: any = null;

    /**
     * The client instance
     */
    readonly #client: Client;

    /**
     * Bearer token for authentication
     */
    readonly #bearer: string;

    /**
     * Flag to track if connection is active
     */
    #connected: boolean = false;

    /**
     * Subscriptions map to manage unsubscribe functions
     */
    #subscriptions: Map<string, () => void> = new Map();

    /**
     * @param client Client instance (must be authorized)
     * @param bearer Bearer token for authentication
     */
    public constructor(client: Client, bearer: string) {
        this.#client = client;
        this.#bearer = bearer;
    }

    /**
     * Ensures the WebSocket connection is established
     */
    async #ensureConnected(): Promise<void> {
        if (this.#connected) {
            return;
        }

        // Dynamically import autobahn to avoid hard dependency
        const { Connection } = await import("autobahn");

        this.#ws = new Connection({
            url: "wss://chat.ifunny.co/chat",
            realm: "ifunny",
            authmethods: ["ticket"],
            authid: "client",
            onchallenge: (session: any, method: string, extra: any) => {
                if (method === "ticket") {
                    return this.#bearer;
                }
                throw new Error(`Unsupported auth method: ${method}`);
            },
        });

        return new Promise((resolve, reject) => {
            this.#ws.onopen = (session: any) => {
                this.#connected = true;
                this.#client.emit("chat:connected");
                resolve();
            };

            this.#ws.onclose = (reason: string, details: any) => {
                this.#connected = false;
                this.#client.emit("chat:disconnected", reason, details);
            };

            this.#ws.open();
        });
    }

    /**
     * Call a WAMP RPC procedure
     */
    public async call<T = Record<string, any>>(
        procedure: string,
        kwargs: Record<string, any>,
    ): Promise<T> {
        await this.#ensureConnected();
        return this.#ws.call(procedure, [], kwargs) as T;
    }

    /**
     * Publish to a WAMP topic
     */
    public async publish<T = Record<string, any>>(
        topic: string,
        event: T,
    ): Promise<void> {
        await this.#ensureConnected();
        await this.#ws.publish(topic, [], event);
    }

    /**
     * Subscribe to a WAMP topic
     * Returns an unsubscribe function
     */
    public async subscribe<T = Record<string, any>>(
        topic: Topic,
        handler: SubscriptionHandler<T>,
    ): Promise<() => void> {
        await this.#ensureConnected();

        const subscription = await this.#ws.subscribe(
            topic.topic,
            (args: any[], kwargs: any) => {
                handler(args[0], kwargs as T);
            },
        );

        const unsubscribe = () => {
            this.#ws.unsubscribe(subscription);
            this.#subscriptions.delete(topic.topic);
        };

        this.#subscriptions.set(topic.topic, unsubscribe);
        return unsubscribe;
    }

    /**
     * Disconnect the WebSocket
     */
    public disconnect(): void {
        if (this.#ws) {
            this.#ws.close();
            this.#connected = false;
            this.#subscriptions.clear();
        }
    }

    /**
     * Check if connection is active
     */
    public isConnected(): boolean {
        return this.#connected;
    }
}

export default Chat;

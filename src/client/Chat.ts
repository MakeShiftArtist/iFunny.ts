import type { Client } from "./Client";
import type { Topic } from "@ifunny/ifunny-api-types";
import { Connection, Session } from "autobahn";
import { setupWAMPCompatTransport } from "../utils/Transport";

/**
 * Event handler type for subscribe callbacks
 */
export type SubscriptionHandler<T = Record<string, any>> = (eventType: number, event: T) => void;

/**
 * WAMP WebSocket connection wrapper for chat operations
 * @internal
 */
export class Chat {
    /**
     * WAMP client instance (autobahn Connection)
     * @internal
     */
    #ws: Connection | null = null;

    /**
     * Autobahn session — available after onopen fires
     * @internal
     */
    #session: Session | null = null;

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

        setupWAMPCompatTransport();

        const ws = new Connection({
            transports: [
                {
                    type: "websocket",
                    url: "wss://chat.ifunny.co/chat",
                    headers: {
                        "ifunny-project-id": "iFunny",
                    },
                } as any,
            ],
            realm: "co.fun.chat.ifunny",
            use_es6_promises: true, // when.js (autobahn default) does not work in Bun
            authmethods: ["ticket"],
            authid: "client",
            onchallenge: (session: any, method: string, extra: any) => {
                if (method === "ticket") {
                    return this.#bearer;
                }
                throw new Error(`Unsupported auth method: ${method}`);
            },
        });
        this.#ws = ws;

        return new Promise((resolve, reject) => {
            let connected = false;

            ws.onopen = (session: Session) => {
                connected = true;
                this.#connected = true;
                this.#session = session;
                this.#client.emit("chat:connected");
                resolve();
            };

            ws.onclose = (reason: string, details: any): boolean => {
                this.#connected = false;
                this.#session = null;
                this.#client.emit("chat:disconnected", reason, details);

                if (!connected)
                    reject(new Error(`Failed to connect to chat WebSocket. Reason: ${details?.message || reason || "Unknown"}`));

                return false;
            };

            (ws as any).onerror = (error: any) => {
                this.#client.emit("chat:error", error);
                if (!connected) {
                    reject(error);
                }
            };

            ws.open();
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
        options?: { acknowledge?: boolean; exclude_me?: boolean },
    ): Promise<void> {
        await this.#ensureConnected();
        await this.#session!.publish(topic, [], event, options);
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

        const subscription = await this.#session!.subscribe(
            topic.topic,
            (args?: any[], kwargs?: any) => {
                handler(args?.[0], kwargs as T);
            },
        );

        const unsubscribe = () => {
            this.#session?.unsubscribe(subscription);
            this.#subscriptions.delete(topic.topic);
        };

        this.#subscriptions.set(topic.topic, unsubscribe);
        return unsubscribe;
    }

    /**
     * Get the underlying autobahn Connection for advanced WAMP operations
     * (must be connected first via ensureConnected or other operations)
     */
    public getConnection(): Connection {
        if (!this.#ws) {
            throw new Error("Not connected");
        }
        return this.#ws;
    }

    /**
     * Disconnect the WebSocket
     */
    public disconnect(): void {
        if (this.#ws) {
            this.#ws.close();
            this.#connected = false;
            this.#session = null;
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

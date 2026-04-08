import type { Client } from "../client/Client";
import { Base } from "./Base";
import { ChatMessage } from "./ChatMessage";

/**
 * TODO: Move this to @ifunny/ifunny-api-types after testing
 */
interface APIChatChannel {
    id: string;
    name: string;
    title: string;
    membersOnline: number;
    membersTotal: number;
    type: "DM" | "Private" | "Public";
    joinState: "NotJoined" | "Invited" | "Joined";
    role?: string;
    touchDt: number;
    user: {
        id: string;
        nick: string;
        lastSeenAt?: number;
        isVerified: boolean;
    };
}

/**
 * Represents a chat channel
 * @extends Base<APIChatChannel>
 */
export class Chat extends Base<APIChatChannel> {
    #eventListeners: Set<(event: ChatMessage) => void> = new Set();

    /**
     * @param client Client instance associated with the Chat
     * @param payload Payload of the Chat
     */
    public constructor(client: Client, payload: APIChatChannel) {
        super(client, payload);
    }

    /**
     * The name/identifier of the chat channel
     */
    public get name(): string {
        return this.get("name");
    }

    /**
     * The display title of the chat channel
     */
    public get title(): string {
        return this.get("title");
    }

    /**
     * The number of members currently online in this channel
     */
    public get membersOnline(): number {
        return this.get("membersOnline");
    }

    /**
     * The total number of members in this channel
     */
    public get membersTotal(): number {
        return this.get("membersTotal");
    }

    /**
     * The type of chat channel
     */
    public get type(): "DM" | "Private" | "Public" {
        return this.get("type");
    }

    /**
     * The current user's join state for this channel
     */
    public get joinState(): "NotJoined" | "Invited" | "Joined" {
        return this.get("joinState");
    }

    /**
     * The role of the current user in this channel
     */
    public get role(): string | null {
        return this.get("role");
    }

    /**
     * The timestamp of the last touch/activity
     */
    public get touchDt(): number {
        return this.get("touchDt");
    }

    /**
     * The user info associated with this channel
     */
    public get user(): {
        id: string;
        nick: string;
        lastSeenAt?: number;
        isVerified: boolean;
    } {
        return this.payload.user;
    }

    /**
     * Join the chat channel
     */
    public async join(): Promise<void> {
        const chat = await this.client.chat();
        await chat.call("com.ifunny.channel.join", {
            channel: this.name,
        });
    }

    /**
     * Leave the chat channel
     */
    public async leave(): Promise<void> {
        const chat = await this.client.chat();
        await chat.call("com.ifunny.channel.exit", {
            channel: this.name,
        });
    }

    /**
     * Send a message to the chat channel
     */
    public async sendMessage(text: string): Promise<ChatMessage> {
        const chat = await this.client.chat();
        const result = await chat.call("com.ifunny.channel.send_message", {
            channel: this.name,
            text,
        });
        return new ChatMessage(this.client, result);
    }

    /**
     * Async generator to fetch messages from the channel
     */
    public async *getMessages(limit?: number, after?: string) {
        const chat = await this.client.chat();
        let cursor = after;

        while (true) {
            const result = await chat.call("com.ifunny.channel.get_messages", {
                channel: this.name,
                limit: limit ?? 50,
                ...(cursor && { after: cursor }),
            });

            if (!result.messages || result.messages.length === 0) {
                break;
            }

            for (const msg of result.messages) {
                yield new ChatMessage(this.client, msg);
            }

            if (!result.cursor) {
                break;
            }

            cursor = result.cursor;
        }
    }

    /**
     * Register a callback for chat events in this channel
     */
    public onEvent(callback: (event: ChatMessage) => void): void {
        this.#eventListeners.add(callback);
    }

    /**
     * Unregister a callback for chat events in this channel
     */
    public offEvent(callback: (event: ChatMessage) => void): void {
        this.#eventListeners.delete(callback);
    }

    /**
     * Internal method to dispatch a chat event to listeners
     * @internal
     */
    public _dispatchEvent(event: ChatMessage): void {
        for (const listener of this.#eventListeners) {
            listener(event);
        }
    }
}

export default Chat;

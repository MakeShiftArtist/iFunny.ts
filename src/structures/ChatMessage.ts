import type { Client } from "../client/Client";
import { type APIChatMessage, type MessageType } from "@ifunny/ifunny-api-types";
import { Base } from "./Base";

/**
 * Represents an event in a chat channel (message, join, leave, etc.)
 * @extends Base<APIChatMessage>
 */
export class ChatMessage extends Base<APIChatMessage> {
    /**
     * @param client Client instance associated with the ChatMessage
     * @param payload Payload of the ChatMessage
     */
    public constructor(client: Client, payload: APIChatMessage) {
        super(client, payload);
    }

    /**
     * The text content of the message
     */
    public get text(): string {
        return this.get("text");
    }

    /**
     * The type of message
     */
    public get type(): MessageType {
        return this.get("type");
    }

    /**
     * The status of the message
     */
    public get status(): number | null {
        return this.get("status");
    }

    /**
     * The timestamp when the message was published
     */
    public get pubAt(): number {
        return this.get("pub_at");
    }

    /**
     * The user who sent the message.
     * Note: the user ID is at the "user" key (not "id") in message payloads.
     */
    public get user(): {
        user: string;
        nick: string;
        is_verified: boolean;
        last_seen_at?: number;
    } {
        return this.payload.user;
    }
}

export default ChatMessage;

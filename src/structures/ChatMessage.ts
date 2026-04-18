import type { Client } from "../client/Client";
import type { APIChatMessage } from "@ifunny/ifunny-api-types";
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
    public get type(): "TEXT_MESSAGE" | "JOIN_CHANNEL" | "EXIT_CHANNEL" {
        return this.get("type");
    }

    /**
     * The status of the message
     */
    public get status(): string | null {
        return this.get("status");
    }

    /**
     * The timestamp when the message was published
     */
    public get pubAt(): number {
        return this.get("pubAt");
    }

    /**
     * The user who sent the message
     */
    public get user(): {
        id: string;
        nick: string;
        isVerified: boolean;
        lastSeenAt?: number;
    } {
        return this.payload.user;
    }
}

export default ChatMessage;

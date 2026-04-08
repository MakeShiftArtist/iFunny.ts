import type { Client } from "../client/Client";
import type { APIGetMessagesResponse } from "@ifunny/ifunny-api-types";
import { BaseFeed } from "./BaseFeed";
import { ChatMessage } from "./ChatMessage";

/**
 * Represents a message feed for a chat channel
 * @extends BaseFeed
 */
export class ChatFeed extends BaseFeed {
    /**
     * The channel name
     */
    public readonly channelName: string;

    /**
     * @param client Client attached to the ChatFeed
     * @param channelName The name of the chat channel
     */
    public constructor(client: Client, channelName: string) {
        super(client, channelName);
        this.channelName = channelName;
    }

    /**
     * Scrolls through message history in a channel from newest to oldest
     * @param limit The maximum number of messages to fetch per page (default: 50)
     */
    public async *scroll(limit: number = 50): AsyncGenerator<ChatMessage> {
        const chat = await this.client.chat();
        let cursor: string | undefined;

        do {
            const result = await chat.call<APIGetMessagesResponse>(
                "com.ifunny.channel.get_messages",
                { channel: this.channelName, limit, ...(cursor && { after: cursor }) },
            );

            for (const message of result.messages ?? []) {
                yield new ChatMessage(this.client, message);
            }

            cursor = result.cursor;
        } while (cursor);
    }
}

export default ChatFeed;

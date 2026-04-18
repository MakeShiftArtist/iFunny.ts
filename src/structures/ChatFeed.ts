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
        let next: number | undefined;

        do {
            const result = await chat.call<APIGetMessagesResponse>(
                "co.fun.chat.list_messages",
                { chat_name: this.channelName, limit, ...(next && { next }) },
            );

            for (const message of result.messages ?? []) {
                yield new ChatMessage(this.client, message);
            }

            next = result.next || undefined;
        } while (next);
    }
}

export default ChatFeed;

import type { Client } from "../client/Client";
import { Chat } from "../structures/Chat";
import { ChatMessage } from "../structures/ChatMessage";
import type { ChannelType, APIChannelsResponse } from "@ifunny/ifunny-api-types";
import { RESTAPISuccessResponse as Success } from "@ifunny/ifunny-api-types";
import { eventsIn, userJoinedChats, dmChannelTopic } from "@ifunny/ifunny-api-types";

/**
 * Manages chat channels and chat operations via REST API
 */
export class ChatManager {
    /**
     * The client this manager is attached to
     */
    public readonly client: Client;

    /**
     * @param client Client instance
     */
    public constructor(client: Client) {
        this.client = client;
    }

    /**
     * Get paginated list of chat channels
     */
    public async getChannels(
        limit: number = 50,
        cursor?: string,
    ): Promise<{ channels: Chat[]; cursor?: string }> {
        const response = await this.client.instance.get<
            Success<APIChannelsResponse>
        >("/channels", {
            params: {
                limit,
                ...(cursor && { cursor }),
            },
        });

        const channels = response.data.data.channels.items.map(
            (data: any) => new Chat(this.client, data),
        );

        return {
            channels,
            cursor: response.data.data.channels.paging?.cursors?.next,
        };
    }

    /**
     * Get a specific chat channel by name
     */
    public async getChannel(name: string): Promise<Chat | null> {
        try {
            const response = await this.client.instance.get<Success<any>>(
                `/channels/${name}`,
            );
            return new Chat(this.client, response.data.data);
        } catch (error) {
            return null;
        }
    }

    /**
     * Query chat channels by search term
     * Returns an async generator for pagination
     */
    public async *queryChannels(
        query: string,
        limit: number = 50,
    ): AsyncGenerator<Chat> {
        let cursor: string | undefined;

        while (true) {
            const response = await this.client.instance.get<
                Success<APIChannelsResponse>
            >("/channels/search", {
                params: {
                    q: query,
                    limit,
                    ...(cursor && { cursor }),
                },
            });

            const channels = response.data.data.channels.items.map(
                (data: any) => new Chat(this.client, data),
            );

            for (const channel of channels) {
                yield channel;
            }

            cursor = response.data.data.channels.paging?.cursors?.next;
            if (!cursor) {
                break;
            }
        }
    }

    /**
     * Get or create a DM channel with one or more users
     */
    public async getDMChannel(...userIds: string[]): Promise<Chat> {
        const response = await this.client.instance.post<Success<any>>(
            "/channels/dm",
            {
                user_ids: userIds,
            },
        );
        return new Chat(this.client, response.data.data);
    }

    /**
     * Create a new chat channel
     */
    public async createChannel(
        type: ChannelType,
        title: string,
        name: string,
        description?: string,
        inviteIds?: string[],
    ): Promise<Chat> {
        const response = await this.client.instance.post<Success<any>>(
            "/channels",
            {
                type,
                title,
                name,
                description,
                invite_ids: inviteIds,
            },
        );
        return new Chat(this.client, response.data.data);
    }

    /**
     * Get topic for events in a channel
     */
    public eventsIn(channelName: string) {
        return eventsIn(channelName);
    }

    /**
     * Get topic for user joined chats
     */
    public userJoinedChats(userId: string) {
        return userJoinedChats(userId);
    }

    /**
     * Get topic for DM channel
     */
    public dmChannelTopic(channelName: string) {
        return dmChannelTopic(channelName);
    }

    /**
     * Get a single page of message history from a channel
     */
    public async getHistoryPage(
        channelName: string,
        limit: number = 50,
        cursor?: string,
    ): Promise<{ messages: ChatMessage[]; cursor?: string }> {
        const channel = await this.getChannel(channelName);
        if (!channel) {
            return { messages: [], cursor: undefined };
        }
        return channel.getHistoryPage(limit, cursor);
    }

    /**
     * Async generator to iterate all message history from a channel
     */
    public async *getHistory(channelName: string, limit?: number) {
        const channel = await this.getChannel(channelName);
        if (!channel) {
            return;
        }
        yield* channel.getMessages(limit);
    }
}

export default ChatManager;

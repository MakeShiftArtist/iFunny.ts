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
        if (!this.client.isAuthorized()) {
            throw new Error("Client must be authorized to fetch channels");
        }

        // Ensure we have the user's ID by fetching their data if needed
        if (!this.client.id) {
            await this.client.fetch();
        }

        const response = await this.client.instance.get<
            Success<APIChannelsResponse>
        >(`/users/${this.client.id}/chats`, {
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
     * Get a specific chat channel by name via WAMP RPC
     */
    public async getChannel(name: string): Promise<Chat | null> {
        try {
            if (!this.client.isAuthorized()) {
                throw new Error("Client must be authorized to get channels");
            }

            const chat = await this.client.chat();
            const result = await chat.call<any>("co.fun.chat.get_chat", {
                chat_name: name,
            });

            return new Chat(this.client, result.chat ?? result);
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
            >("/chats/open_channels", {
                params: {
                    q: query,
                    limit,
                    ...(cursor && { next: cursor }),
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
     * Get or create a DM channel with one or more users via WAMP RPC
     */
    public async getDMChannel(...userIds: string[]): Promise<Chat> {
        if (!this.client.isAuthorized()) {
            throw new Error("Client must be authorized to get DM channels");
        }

        const chat = await this.client.chat();
        const result = await chat.call<any>("co.fun.chat.get_or_create_chat", {
            type: 1, // DM channel type
            users: userIds,
            name: "", // Server will compute the name
        });

        return new Chat(this.client, result);
    }

    /**
     * Create a new chat channel via WAMP RPC
     */
    public async createChannel(
        type: ChannelType,
        title: string,
        name: string,
        description?: string,
        inviteIds?: string[],
    ): Promise<Chat> {
        if (!this.client.isAuthorized()) {
            throw new Error("Client must be authorized to create channels");
        }

        const chat = await this.client.chat();
        const result = await chat.call<any>("co.fun.chat.new_chat", {
            users: inviteIds ?? [],
            title,
            name,
            description: description ?? "",
            type,
        });

        return new Chat(this.client, result);
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

    /**
     * Invite users to a chat channel
     */
    public async inviteUserToChannel(channelName: string, userIds: string[]): Promise<void> {
        const channel = await this.getChannel(channelName);
        if (!channel) {
            throw new Error(`Channel not found: ${channelName}`);
        }
        return channel.invite(userIds);
    }

    /**
     * Kick a user from a chat channel
     */
    public async kickUserFromChannel(channelName: string, userId: string): Promise<void> {
        const channel = await this.getChannel(channelName);
        if (!channel) {
            throw new Error(`Channel not found: ${channelName}`);
        }
        return channel.kick(userId);
    }
}

export default ChatManager;

import type { Client } from "../client/Client";
import { Chat } from "../structures/Chat";
import { ChatMessage } from "../structures/ChatMessage";
import {
    type ChannelType,
    type APIChannelsResponse,
    type APIGetChatResponse,
    RESTAPISuccessResponse as Success,
    userJoinedChats,
} from "@ifunny/ifunny-api-types";

const CHANNEL_TYPE_MAP: Record<ChannelType, number> = {
    DM: 1,
    Private: 2,
    Public: 3,
};

/**
 * Manages chat channels and chat operations via REST API and WAMP RPC
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
     * Async generator for user's joined chat channels via WAMP subscription
     * Yields each channel as events arrive
     */
    public async *getChannels(): AsyncGenerator<Chat> {
        if (!this.client.isAuthorized()) {
            throw new Error("Client must be authorized to fetch channels");
        }

        if (!this.client.id) {
            await this.client.fetch();
        }

        const chat = await this.client.chat();
        const queue: Chat[] = [];
        let resolve!: () => void;
        let reject!: (e: Error) => void;
        const ready = new Promise<void>((res, rej) => {
            resolve = res;
            reject = rej;
        });

        const unsubscribe = await chat.subscribe(
            userJoinedChats(this.client.id!),
            (_eventType: number, event: any) => {
                const channels = (event.chats ?? []).map(
                    (data: any) => new Chat(this.client, data),
                );
                queue.push(...channels);
                resolve();
            },
        ).catch((error: Error) => {
            reject(error);
            return () => {};
        });

        try {
            await ready;
            for (const ch of queue) {
                yield ch;
            }
        } finally {
            unsubscribe();
        }
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
            const result = await chat.call<APIGetChatResponse>("co.fun.chat.get_chat", {
                chat_name: name,
            });

            return new Chat(this.client, result.chat);
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

        if (!this.client.id) {
            await this.client.fetch();
        }

        const selfId = this.client.id!;
        const name = [...userIds, selfId].sort().reverse().join("_");

        const chat = await this.client.chat();
        const result = await chat.call<APIGetChatResponse>("co.fun.chat.get_or_create_chat", {
            type: CHANNEL_TYPE_MAP.DM,
            users: userIds,
            name,
        });

        return new Chat(this.client, result.chat);
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
        const result = await chat.call<APIGetChatResponse>("co.fun.chat.new_chat", {
            users: inviteIds ?? [],
            title,
            name,
            description: description ?? "",
            type: CHANNEL_TYPE_MAP[type],
        });

        return new Chat(this.client, result.chat);
    }

    /**
     * Get a single page of message history from a channel
     */
    public async getHistoryPage(
        channelName: string,
        limit: number = 50,
        next?: number,
    ): Promise<{ messages: ChatMessage[]; next: number; prev: number }> {
        const channel = await this.getChannel(channelName);
        if (!channel) {
            return { messages: [], next: 0, prev: 0 };
        }
        return channel.getHistoryPage(limit, next);
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

import type { Client } from "../client/Client";
import {
    type APIChatChannel,
    type APIGetMessagesResponse,
    type Topic,
    eventsIn,
    inviteUsers,
    acceptInvite,
    declineInvite,
    kickMember,
} from "@ifunny/ifunny-api-types";
import { Base } from "./Base";
import { ChatMessage } from "./ChatMessage";

/**
 * Represents a chat channel
 * @extends Base<APIChatChannel>
 */
export class Chat extends Base<APIChatChannel> {
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
        await chat.call<void>("co.fun.chat.join_chat", {
            chat_name: this.name,
        });
    }

    /**
     * Leave the chat channel
     */
    public async leave(): Promise<void> {
        const chat = await this.client.chat();
        await chat.call<void>("co.fun.chat.leave_chat", {
            chat_name: this.name,
        });
    }

    /**
     * Send a message to the chat channel
     */
    public async sendMessage(text: string): Promise<void> {
        const chat = await this.client.chat();
        await chat.publish(
            eventsIn(this.name).topic,
            { message_type: 1, type: 200, text },
            { acknowledge: true, exclude_me: true },
        );
    }

    /**
     * Invite users to the chat channel
     */
    public async invite(userIds: string[]): Promise<void> {
        const chat = await this.client.chat();
        const rpc = inviteUsers(this.name, userIds);
        await chat.call<void>(rpc.procedure, rpc.kwargs);
    }

    /**
     * Kick a user from the chat channel
     */
    public async kick(userId: string): Promise<void> {
        const chat = await this.client.chat();
        const rpc = kickMember(this.name, userId);
        await chat.call<void>(rpc.procedure, rpc.kwargs);
    }

    /**
     * Accept an invite to a chat channel
     */
    public async acceptInvite(): Promise<void> {
        const chat = await this.client.chat();
        const rpc = acceptInvite(this.name);
        await chat.call<void>(rpc.procedure, rpc.kwargs);
    }

    /**
     * Decline an invite to a chat channel
     */
    public async declineInvite(): Promise<void> {
        const chat = await this.client.chat();
        const rpc = declineInvite(this.name);
        await chat.call<void>(rpc.procedure, rpc.kwargs);
    }

    /**
     * Fetch a single page of message history
     */
    public async getHistoryPage(
        limit: number = 50,
        next?: number,
    ): Promise<{ messages: ChatMessage[]; next: number; prev: number }> {
        const chat = await this.client.chat();
        const result = await chat.call<APIGetMessagesResponse>("co.fun.chat.list_messages", {
            chat_name: this.name,
            limit,
            ...(next && { next }),
        });

        return {
            messages: (result.messages ?? []).map(m => new ChatMessage(this.client, m)),
            next: result.next,
            prev: result.prev,
        };
    }

    /**
     * Async generator to fetch messages from the channel
     */
    public async *getMessages(limit?: number) {
        const chat = await this.client.chat();
        let next: number | undefined;

        while (true) {
            const result = await chat.call<APIGetMessagesResponse>("co.fun.chat.list_messages", {
                chat_name: this.name,
                limit: limit ?? 50,
                ...(next && { next }),
            });

            if (!result.messages || result.messages.length === 0) {
                break;
            }

            for (const msg of result.messages) {
                yield new ChatMessage(this.client, msg);
            }

            if (!result.next) {
                break;
            }

            next = result.next;
        }
    }

    /**
     * Returns the topic for subscribing to this channel's events
     */
    public topic(): Topic {
        return eventsIn(this.name);
    }
}

export default Chat;

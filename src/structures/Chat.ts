import type { Client } from "../client/Client";
import {
    type APIChatChannel,
    type APIGetMessagesResponse,
    type Topic,
    type ChannelType,
    type JoinState,
    MessageType,
    EventType,
    eventsIn,
    inviteUsers,
    acceptInvite,
    declineInvite,
    kickMember,
} from "@ifunny/ifunny-api-types";
import { Base } from "./Base";
import { ChatFeed } from "./ChatFeed";
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
        return this.get("members_online");
    }

    /**
     * The total number of members in this channel
     */
    public get membersTotal(): number {
        return this.get("members_total");
    }

    /**
     * The type of chat channel
     */
    public get type(): ChannelType {
        return this.get("type");
    }

    /**
     * The current user's join state for this channel
     */
    public get joinState(): JoinState {
        return this.get("join_state");
    }

    /**
     * The role of the current user in this channel
     */
    public get role(): number | null {
        return this.get("role");
    }

    /**
     * The timestamp of the last touch/activity
     */
    public get touchDt(): number {
        return this.get("touch_dt");
    }

    /**
     * The user info associated with this channel
     */
    public get user(): {
        id: string;
        nick: string;
        last_seen_at?: number;
        is_verified: boolean;
    } {
        return this.payload.user;
    }

    /**
     * Join the chat channel
     */
    public async join(): Promise<void> {
        const ws = await this.client.chat();
        await ws.call<void>("co.fun.chat.join_chat", {
            chat_name: this.name,
        });
    }

    /**
     * Leave the chat channel
     */
    public async leave(): Promise<void> {
        const ws = await this.client.chat();
        await ws.call<void>("co.fun.chat.leave_chat", {
            chat_name: this.name,
        });
    }

    /**
     * Send a message to the chat channel
     */
    public async sendMessage(text: string): Promise<void> {
        const ws = await this.client.chat();
        await ws.publish(
            eventsIn(this.name).topic,
            { message_type: MessageType.TEXT_MESSAGE, type: EventType.MESSAGE, text },
            { acknowledge: true, exclude_me: true },
        );
    }

    /**
     * Invite users to the chat channel
     */
    public async invite(userIds: string[]): Promise<void> {
        const ws = await this.client.chat();
        const rpc = inviteUsers(this.name, userIds);
        await ws.call<void>(rpc.procedure, rpc.kwargs);
    }

    /**
     * Kick a user from the chat channel
     */
    public async kick(userId: string): Promise<void> {
        const ws = await this.client.chat();
        const rpc = kickMember(this.name, userId);
        await ws.call<void>(rpc.procedure, rpc.kwargs);
    }

    /**
     * Accept an invite to a chat channel
     */
    public async acceptInvite(): Promise<void> {
        const ws = await this.client.chat();
        const rpc = acceptInvite(this.name);
        await ws.call<void>(rpc.procedure, rpc.kwargs);
    }

    /**
     * Decline an invite to a chat channel
     */
    public async declineInvite(): Promise<void> {
        const ws = await this.client.chat();
        const rpc = declineInvite(this.name);
        await ws.call<void>(rpc.procedure, rpc.kwargs);
    }

    /**
     * Fetch a single page of message history
     */
    public async getHistoryPage(
        limit: number = 50,
        next?: number,
    ): Promise<{ messages: ChatMessage[]; next: number; prev: number }> {
        const ws = await this.client.chat();
        const result = await ws.call<APIGetMessagesResponse>("co.fun.chat.list_messages", {
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
     * Returns a ChatFeed for scrolling through this channel's message history
     */
    public feed(): ChatFeed {
        return new ChatFeed(this.client, this.name);
    }

    /**
     * Returns the topic for subscribing to this channel's events
     */
    public topic(): Topic {
        return eventsIn(this.name);
    }
}

export default Chat;

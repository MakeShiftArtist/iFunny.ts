import type { Client } from "../client/Client";
import type { APIChatChannel, APIChatMessage, Topic, APIGetMessagesResponse } from "@ifunny/ifunny-api-types";
import { eventsIn, inviteUsers, acceptInvite, declineInvite, kickMember } from "@ifunny/ifunny-api-types";
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
        await chat.call<void>("com.ifunny.channel.join", {
            channel: this.name,
        });
    }

    /**
     * Leave the chat channel
     */
    public async leave(): Promise<void> {
        const chat = await this.client.chat();
        await chat.call<void>("com.ifunny.channel.exit", {
            channel: this.name,
        });
    }

    /**
     * Send a message to the chat channel
     */
    public async sendMessage(text: string): Promise<ChatMessage> {
        const chat = await this.client.chat();
        const result = await chat.call<APIChatMessage>("com.ifunny.channel.send_message", {
            channel: this.name,
            text,
        });
        return new ChatMessage(this.client, result);
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
        cursor?: string,
    ): Promise<{ messages: ChatMessage[]; cursor?: string }> {
        const chat = await this.client.chat();
        const result = await chat.call<APIGetMessagesResponse>("com.ifunny.channel.get_messages", {
            channel: this.name,
            limit,
            ...(cursor && { after: cursor }),
        });

        return {
            messages: (result.messages ?? []).map(m => new ChatMessage(this.client, m)),
            cursor: result.cursor,
        };
    }

    /**
     * Async generator to fetch messages from the channel
     */
    public async *getMessages(limit?: number, after?: string) {
        const chat = await this.client.chat();
        let cursor = after;

        while (true) {
            const result = await chat.call<APIGetMessagesResponse>("com.ifunny.channel.get_messages", {
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
     * Returns the topic for subscribing to this channel's events
     */
    public topic(): Topic {
        return eventsIn(this.name);
    }
}

export default Chat;

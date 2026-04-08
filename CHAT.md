# Chat API Documentation

iFunny's chat system uses two transports in tandem: a standard REST API for channel management, and a WAMP WebSocket for real-time messaging.

---

## Usage

### Setup

The chat connection is lazy — it opens automatically the first time you call `client.chat()`. You need a valid bearer token.

```ts
import iFunnyClient from "ifunny.ts";

const client = new iFunnyClient({
    basic: process.env.BASIC,
    bearer: process.env.BEARER,
});

// Opens WAMP connection on first call
const chat = await client.chat();
```

---

### Channel Management (via `client.chatManager`)

```ts
// List your channels (paginated)
const { channels, cursor } = await client.chatManager.getChannels(50);
// next page:
const { channels: page2 } = await client.chatManager.getChannels(50, cursor);

// Get a channel by name
const channel = await client.chatManager.getChannel("my-channel");

// Search public channels
for await (const ch of client.chatManager.queryChannels("gaming", 25)) {
    console.log(ch.name, ch.membersTotal);
}

// Get or create a DM
const dm = await client.chatManager.getDMChannel(userId1, userId2);

// Create a new channel
import { ChannelType } from "@ifunny/ifunny-api-types";
const newChannel = await client.chatManager.createChannel(
    ChannelType.Public,
    "My Channel Title",
    "my-channel-name",
    "Optional description",
    ["optionalInviteUserId"],
);
```

---

### Sending and Receiving Messages

```ts
const channel = await client.chatManager.getChannel("my-channel");
if (!channel) throw new Error("Channel not found");

// Join the channel
await channel.join();

// Send a message
const msg = await channel.sendMessage("Hello, world!");
console.log(msg.text, msg.pubAt, msg.user.nick);

// Subscribe to live events
const unsubscribe = await chat.subscribe<APIChatMessage>(
    channel.topic(),           // eventsIn("my-channel")
    (eventType, event) => {
        if (eventType === 200) {   // EVENT_MESSAGE
            console.log(`[${event.user.nick}]: ${event.text}`);
        } else if (eventType === 100) {  // EVENT_JOIN
            console.log(`${event.user.nick} joined`);
        } else if (eventType === 101) {  // EVENT_EXIT
            console.log(`${event.user.nick} left`);
        }
    },
);

// Later: unsubscribe
unsubscribe();

// Leave the channel
await channel.leave();
```

---

### Channel Membership Management

```ts
const channel = await client.chatManager.getChannel("my-channel");
if (!channel) throw new Error("Channel not found");

// Invite users to the channel
await channel.invite(["userId1", "userId2", "userId3"]);

// Kick a user from the channel
await channel.kick("userId");

// Accept a pending invite
await channel.acceptInvite();

// Decline a pending invite
await channel.declineInvite();

// Via ChatManager (resolves channel internally)
await client.chatManager.inviteUserToChannel("my-channel", ["userId1", "userId2"]);
await client.chatManager.kickUserFromChannel("my-channel", "userId");
```

---

### Message History

Three ways to read history, all paging newest-to-oldest:

```ts
// 1. ChatFeed — standalone async generator (easiest)
import { ChatFeed } from "ifunny.ts";

const feed = new ChatFeed(client, "my-channel");
for await (const msg of feed.scroll(50)) {
    console.log(msg.pubAt, msg.user.nick, msg.text);
}

// 2. Chat.getMessages() — generator on the channel struct
const channel = await client.chatManager.getChannel("my-channel");
for await (const msg of channel.getMessages()) {
    console.log(msg.text);
}

// 3. Single page with cursor control
const { messages, cursor } = await channel.getHistoryPage(50);
const { messages: page2 } = await channel.getHistoryPage(50, cursor);

// 4. Via ChatManager (resolves channel internally)
for await (const msg of client.chatManager.getHistory("my-channel")) {
    console.log(msg.text);
}
```

---

### Subscribing to User-Level Events

```ts
const myUserId = (await client.users.fetchSelf()).id;

// Get notified when you join/leave a channel
const unsub = await chat.subscribe(
    client.chatManager.userJoinedChats(myUserId),
    (eventType, event) => {
        console.log("Channel event", eventType, event);
    },
);
```

---

### Topics and RPC Composition Reference

Helper functions are exported from `@ifunny/ifunny-api-types` for both subscriptions (topics) and RPC calls:

#### Subscription Topics

```ts
import { eventsIn, userJoinedChats, dmChannelTopic } from "@ifunny/ifunny-api-types";

eventsIn("channel-name")      // → { topic: "co.fun.chat.chat.channel-name" }
userJoinedChats("userId")     // → { topic: "co.fun.chat.user.userId.chats" }
dmChannelTopic("channel-name") // → { topic: "co.fun.chat.chat.channel-name" }
```

#### RPC Call Composition

```ts
import { 
    inviteUsers, 
    acceptInvite, 
    declineInvite, 
    kickMember 
} from "@ifunny/ifunny-api-types";

// Each returns RpcCall<PayloadType> with { procedure, kwargs }
inviteUsers("channel-name", ["userId1"])    // → { procedure, kwargs }
acceptInvite("channel-name")                 // → { procedure, kwargs }
declineInvite("channel-name")                // → { procedure, kwargs }
kickMember("channel-name", "userId")         // → { procedure, kwargs }
```

---

## API Reference

### Transport

| | |
|---|---|
| **REST base URL** | `https://api.ifunny.mobi/v4` |
| **WebSocket URL** | `wss://chat.ifunny.co/chat` |
| **WAMP realm** | `ifunny` |
| **WAMP auth method** | `ticket` (respond to challenge with raw bearer token) |
| **WAMP namespace** | `co.fun.chat` |

#### Required HTTP headers

```
Authorization: Bearer <token>
ifunny-project-id: iFunny
user-agent: <app-user-agent>
```

---

### Authentication Flow

1. Obtain a bearer token via `POST /oauth2/token` (password grant).
2. Use `Authorization: Bearer <token>` on all REST requests.
3. Open WebSocket to `wss://chat.ifunny.co/chat`, join realm `ifunny` with `authmethods: ["ticket"]`.
4. Server sends a `CHALLENGE` with method `ticket`; respond with the raw bearer token string.
5. On `WELCOME`, the session is live. RPC calls and subscriptions proceed over this connection.

---

### REST Endpoints

#### Channels

##### `GET /channels`
List the authenticated user's channels (paginated).

Query params:
| Param | Type | Description |
|---|---|---|
| `limit` | integer | Max results per page (default 50) |
| `cursor` | string | Opaque cursor from previous response |

Response: `APIChannelsResponse`

```json
{
  "data": {
    "channels": {
      "items": [ /* APIChatChannel[] */ ],
      "paging": { "cursors": { "next": "..." } }
    }
  }
}
```

---

##### `GET /channels/:name`
Get a single channel by its unique name.

Response: `{ "data": APIChatChannel }`

---

##### `POST /channels`
Create a new channel.

Body:
```json
{
  "type": "Public" | "Private" | "DM",
  "title": "Display Name",
  "name": "url-slug",
  "description": "optional",
  "invite_ids": ["userId1"]
}
```

Response: `{ "data": APIChatChannel }`

---

##### `POST /channels/dm`
Get or create a DM channel with one or more users.

Body:
```json
{
  "user_ids": ["userId1", "userId2"]
}
```

Response: `{ "data": APIChatChannel }`

---

##### `GET /chats/open_channels`
Search public channels by query string (paginated).

Query params:
| Param | Type | Description |
|---|---|---|
| `q` | string | Search query |
| `limit` | integer | Max results per page |
| `next` | string | Cursor from previous response |

Response: `APIChannelsResponse`

---

##### `GET /chats/trending`
Get trending public channels. No pagination.

Response: `APIChannelsResponse`

---

#### User / Notifications

| Method | Path | Description |
|---|---|---|
| `GET` | `/users/my/chat_invitations` | Pending chat invitations |
| `GET` | `/users/my/unread_chat_messages` | Unread message count |

---

### WAMP Procedures (RPC)

All procedure URIs are prefixed `co.fun.chat.`. Call pattern: `call(procedure, [], kwargs)`.

#### Channel Operations

| Procedure | kwargs | Returns |
|---|---|---|
| `co.fun.chat.get_chat` | `{ chat_name }` | `{ chat: APIChatChannel }` |
| `co.fun.chat.join_chat` | `{ chat_name }` | void |
| `co.fun.chat.leave_chat` | `{ chat_name }` | void |
| `co.fun.chat.hide_chat` | `{ chat_name }` | void |
| `co.fun.chat.new_chat` | `{ users, title, name, description, type }` | `APIChatChannel` |
| `co.fun.chat.get_or_create_chat` | `{ type: 1, users: string[], name: string }` | `APIChatChannel` (DM) |

> **Note:** The TypeScript SDK uses shorter procedure names in a different namespace (`com.ifunny.channel.*`). These map to the same server-side handlers.

#### TypeScript SDK Procedure Names

| Procedure | kwargs | Returns |
|---|---|---|
| `com.ifunny.channel.join` | `{ channel }` | void |
| `com.ifunny.channel.exit` | `{ channel }` | void |
| `com.ifunny.channel.send_message` | `{ channel, text }` | `APIChatMessage` |
| `com.ifunny.channel.get_messages` | `{ channel, limit, after? }` | `APIGetMessagesResponse` |

#### Message History — `com.ifunny.channel.get_messages`

| kwarg | Type | Description |
|---|---|---|
| `channel` | string | Channel name |
| `limit` | integer | Max messages to return |
| `after` | string | Opaque cursor from previous response (optional) |

Response:
```json
{
  "messages": [ /* APIChatMessage[] */ ],
  "cursor": "opaque-string-or-absent"
}
```

Pagination terminates when `cursor` is absent from the response.

#### Invitations

##### TypeScript SDK Methods

| Method | Signature | Description |
|---|---|---|
| `channel.invite(userIds)` | `invite(userIds: string[]): Promise<void>` | Invite users to channel |
| `channel.kick(userId)` | `kick(userId: string): Promise<void>` | Kick user from channel |
| `channel.acceptInvite()` | `acceptInvite(): Promise<void>` | Accept pending invite |
| `channel.declineInvite()` | `declineInvite(): Promise<void>` | Decline pending invite |

##### WAMP Procedures (Raw)

| Procedure | kwargs | Description |
|---|---|---|
| `co.fun.chat.invite.invite` | `{ chat_name, users: string[] }` | Invite users to channel |
| `co.fun.chat.invite.accept` | `{ chat_name }` | Accept channel invite |
| `co.fun.chat.invite.decline` | `{ chat_name }` | Decline channel invite |
| `co.fun.chat.kick_member` | `{ user_id, chat_name }` | Kick user from channel |

##### RPC Composition Functions

For advanced use, typed composition functions are available:

```ts
import { 
    inviteUsers, 
    acceptInvite, 
    declineInvite, 
    kickMember 
} from "@ifunny/ifunny-api-types";

// Returns RpcCall<APIInvitePayload>
const inviteRpc = inviteUsers("channel-name", ["userId1", "userId2"]);
await chat.call<void>(inviteRpc.procedure, inviteRpc.kwargs);

// Returns RpcCall<APIInviteResponsePayload>
const acceptRpc = acceptInvite("channel-name");
await chat.call<void>(acceptRpc.procedure, acceptRpc.kwargs);

// Returns RpcCall<APIInviteResponsePayload>
const declineRpc = declineInvite("channel-name");
await chat.call<void>(declineRpc.procedure, declineRpc.kwargs);

// Returns RpcCall<APIKickPayload>
const kickRpc = kickMember("channel-name", "userId");
await chat.call<void>(kickRpc.procedure, kickRpc.kwargs);
```

#### Contacts

| Procedure | kwargs |
|---|---|
| `co.fun.chat.list_contacts` | `{ limit }` |
| `co.fun.chat.search_contacts` | `{ query, limit }` |
| `co.fun.chat.list_operators` | `{ chat_name }` |

---

### WAMP Topics (Pub/Sub)

#### Subscribe: Channel Events

Topic: `co.fun.chat.chat.<channelName>`

Fires for all activity in a channel. Handler receives:
- `args[0]` — integer event type (see Event Types below)
- `kwargs` — the event payload (`APIChatMessage`)

```ts
chat.subscribe({ topic: "co.fun.chat.chat.my-channel" }, (eventType, event) => {
    // eventType: 100 | 101 | 200 | 300
    // event: APIChatMessage
});
```

#### Subscribe: User Channel Notifications

Topic: `co.fun.chat.user.<userId>.chats`

Fires when the user joins or leaves a channel.

#### Subscribe: Invitations

Topic: `co.fun.chat.user.<userId>.invites`

Fires when the user receives a channel invitation.

#### Publish: Send a Message

Topic: `co.fun.chat.chat.<channelName>`

Options: `{ acknowledge: 1, exclude_me: 1 }`

kwargs:
```json
{
  "message_type": 1,
  "type": 200,
  "text": "your message text"
}
```

---

### Event Types

| Value | Constant | Description |
|---|---|---|
| `100` | `EVENT_JOIN` | User joined the channel |
| `101` | `EVENT_EXIT` | User left the channel |
| `200` | `EVENT_MESSAGE` | Text message sent |
| `300` | `EVENT_INVITED` | User was invited |

---

### Data Models

#### `APIChatChannel`

```ts
interface APIChatChannel {
    id: string;
    name: string;           // unique slug / identifier
    title: string;          // display name
    membersOnline: number;
    membersTotal: number;
    type: "DM" | "Private" | "Public";
    joinState: "NotJoined" | "Invited" | "Joined";
    role?: string;          // current user's role in channel
    touchDt: number;        // last activity timestamp (unix seconds)
    user: {
        id: string;
        nick: string;
        lastSeenAt?: number;
        isVerified: boolean;
    };
}
```

#### `APIChatMessage`

```ts
interface APIChatMessage {
    id: string;
    text: string;
    type: "TEXT_MESSAGE" | "JOIN_CHANNEL" | "EXIT_CHANNEL";
    status?: string;
    pubAt: number;          // publication timestamp (unix float)
    user: {
        id: string;
        nick: string;
        isVerified: boolean;
        lastSeenAt?: number;
    };
}
```

#### `APIGetMessagesResponse`

```ts
interface APIGetMessagesResponse {
    messages: APIChatMessage[];
    cursor?: string;        // absent when no more pages
}
```

#### `APIChannelsResponse`

```ts
interface APIChannelsResponse {
    channels: {
        items: APIChatChannel[];
        paging?: { cursors?: { next?: string } };
    };
}
```

#### DM Channel Name Algorithm

DM channel names are computed from participant user IDs: collect all IDs, sort lexicographically, reverse, join with `_`.

```ts
const dmName = [userId1, userId2].sort().reverse().join("_");
```

---

### Channel Types

| String (TS) | Integer (Go) | Description |
|---|---|---|
| `"DM"` | `1` | Direct message between users |
| `"Private"` | `2` | Invite-only channel |
| `"Public"` | `3` | Open, searchable channel |

### Join States

| String (TS) | Integer (Go) | Description |
|---|---|---|
| `"NotJoined"` | `0` | Not a member |
| `"Invited"` | `1` | Has a pending invitation |
| `"Joined"` | `2` | Active member |

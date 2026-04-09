# User Interaction Documentation

Everything a logged-in client can do to interact with another user on iFunny.

---

## Usage

### Fetching Users

```ts
import iFunnyClient from "ifunny.ts";

const client = new iFunnyClient({
    basic: process.env.BASIC,
    bearer: process.env.BEARER,
});

// By nick
const user = await client.users.fetch("iFunnyChef", true);

// By ID
const user = await client.users.fetch("abcdef1234567890");

// The authenticated user
const self = await client.user();
```

---

### Subscribe / Unsubscribe (Follow)

```ts
const user = await client.users.fetch("iFunnyChef", true);

// Follow the user
await user.subscribe();    // PUT /users/:id/subscribers

// Unfollow
await user.unsubscribe();  // DELETE /users/:id/subscribers
```

Requires authorization. Attempting to subscribe to yourself is a no-op (returns silently).

---

### Reading User Profile Data

All properties are available as getters on the `User` / `BaseUser` object:

```ts
const user = await client.users.fetch("iFunnyChef", true);

// Identity
user.nick              // "iFunnyChef"
user.username          // alias for nick
user.id                // unique ID
user.bio               // about text
user.about             // alias for bio
user.webUrl            // profile URL
user.link              // alias for webUrl

// Profile visuals
user.profilePhoto      // { bg_color, thumb, url } | null
user.coverUrl          // cover image URL | null
user.coverColor        // cover background color | null
user.nickColor         // special nick color | null
user.memeExperience    // { rank, days, badgeUrl, badgeSize, nextMilestone }

// Stats
user.totalSubscribers
user.totalSubscriptions
user.totalPosts
user.totalOriginalPosts
user.totalRepublishedPosts  // computed: totalPosts - totalOriginalPosts
user.totalFeatures
user.totalSmiles
user.totalAchievements
user.num               // raw { subscribers, subscriptions, total_posts, created, featured, total_smiles, achievements }
user.stats             // alias for num

// Relationship to the authenticated client
user.isSubscription    // does the client follow this user?
user.isSubscriber      // does this user follow the client?
user.isBlocked         // has the client blocked this user?
user.areYouBlocked     // has this user blocked the client?
user.blockType         // "user" | "installation" | null
user.isSubscribedToUpdates

// Account state
user.isBanned
user.isDeleted
user.isPrivate
user.isVerified
user.bans              // BanSmall[] — active bans

// Chat
user.canChat           // alias for isAvailableForChat
user.isAvailableForChat
user.chatPrivacy       // "closed" | "public" | "subscribers"
user.messengerActive
user.messengerToken

// Linked accounts
user.socials           // { apple, fb, ggl, ok, tw, vk } | null
```

---

### Browsing a User's Timeline

```ts
const user = await client.users.fetch("iFunnyChef", true);

// user.timeline is a Feed — scroll through their posts
for await (const content of user.timeline.scroll()) {
    console.log(content.title, content.type, content.id);
}

// With options
for await (const content of user.timeline.scroll({ limit: 10 })) {
    console.log(content.url);
}
```

---

### Check Nick / Email Availability

```ts
const nickFree = await client.users.isNickAvailable("CoolName123");
const emailFree = await client.users.isEmailAvailable("user@example.com");
```

---

### Endpoints Defined But Not Yet Implemented in the SDK

The API types define these endpoints, but the TypeScript SDK does not yet have wrapper methods for them:

| Action | Method | Endpoint | Notes |
|---|---|---|---|
| Block user | `PUT` | `/users/my/blocked/users/:userId` | |
| Unblock user | `DELETE` | `/users/my/blocked/users/:userId` | |
| Block by nick | `PUT` | `/users/my/blocked/users/by_nick/:nick` | |
| List blocked users | `GET` | `/users/:userId/blocked` | |
| Blocked data | `GET` | `/users/:userId/blocked/data` | |
| List subscribers | `GET` | `/users/:userId/subscribers` | Paginated |
| List subscriptions | `GET` | `/users/:userId/subscriptions` | Paginated |
| View profile guests | `GET` | `/users/:userId/guests` | Profile visitors |
| Report content | `PUT` | (see REPORT_TYPE enum) | Types defined, no endpoint wired |

These can still be called manually via `client.instance.request(...)`.

---

## API Reference

### REST Endpoints

All paths relative to `https://api.ifunny.mobi/v4`. Require `Authorization: Bearer <token>`.

#### User Lookup

| Method | Path | Description |
|---|---|---|
| `GET` | `/users/:userId` | Fetch user by ID |
| `GET` | `/users/by_nick/:nick` | Fetch user by nickname |
| `GET` | `/account` | Fetch the authenticated user |

Response: `{ "data": APIUserProfile }`

---

#### Follow / Unfollow

| Method | Path | Description |
|---|---|---|
| `PUT` | `/users/:userId/subscribers` | Subscribe (follow) the user |
| `DELETE` | `/users/:userId/subscribers` | Unsubscribe (unfollow) the user |

No request body. Returns updated user data.

---

#### Subscribers / Subscriptions Lists

| Method | Path | Description |
|---|---|---|
| `GET` | `/users/:userId/subscribers` | Paginated list of the user's followers |
| `GET` | `/users/:userId/subscriptions` | Paginated list of users this user follows |

Query params: `limit`, `next` (cursor)

---

#### Blocking

| Method | Path | Description |
|---|---|---|
| `PUT` | `/users/my/blocked/users/:userId` | Block a user by ID |
| `DELETE` | `/users/my/blocked/users/:userId` | Unblock a user by ID |
| `PUT` | `/users/my/blocked/users/by_nick/:nick` | Block a user by nick |
| `GET` | `/users/:userId/blocked` | List blocked users |
| `GET` | `/users/:userId/blocked/data` | Blocked data details |

---

#### Profile Visitors

| Method | Path | Description |
|---|---|---|
| `GET` | `/users/:userId/guests` | Profile visitors list |

---

#### User Timeline

| Method | Path | Description |
|---|---|---|
| `GET` | `/timelines/users/:userId` | User's posted content |
| `GET` | `/timelines/users/by_nick/:nick` | User's posted content by nick |

Query params: `limit`, `next` (cursor). Response wraps content items with standard paging.

---

#### Availability Checks

| Method | Path | Description |
|---|---|---|
| `GET` | `/users/nicks_available?nick=...` | Check if a nickname is available |
| `GET` | `/users/emails_available?email=...` | Check if an email is available |

---

#### Bans

| Method | Path | Description |
|---|---|---|
| `GET` | `/users/:userId/bans` | List user's active bans |
| `GET` | `/users/:userId/bans/:banId` | Get specific ban details |

---

### Data Models

#### `APIUserProfile`

```ts
interface APIUserProfile {
    id: string;
    nick: string;
    about: string;
    photo?: APIProfilePhoto;            // { bg_color, thumb, url }
    cover_url?: string;
    cover_bg_color?: string;
    web_url: string;
    num: APIUserProfileNums;
    social?: APIUserAllSocials;         // { apple, fb, ggl, ok, tw, vk }
    nick_color?: APINickColor;
    meme_experience: APIMemeExperience;
    messaging_privacy_status: APIUserMessagePrivacy;  // "closed" | "public" | "subscribers"
    is_verified: boolean;
    is_banned: boolean;
    is_deleted: boolean;
    is_private: boolean;
    is_blocked: boolean;               // client blocked this user
    are_you_blocked: boolean;          // this user blocked client
    block_type?: APIUserBlockType;     // "user" | "installation"
    is_in_subscribers: boolean;        // user follows client
    is_in_subscriptions: boolean;      // client follows user
    is_subscribed_to_updates: boolean;
    is_available_for_chat: boolean;
    messenger_active: boolean;
    messenger_token: string;
    bans: APIBanSmall[];
}
```

#### `APIUserProfileNums`

```ts
interface APIUserProfileNums {
    subscribers: number;
    subscriptions: number;
    total_posts: number;
    created: number;          // original posts
    featured: number;
    total_smiles: number;
    achievements: number;
}
```

#### `APIUserMessagePrivacy`

```ts
type APIUserMessagePrivacy = "closed" | "public" | "subscribers";
```

#### `APIUserBlockType`

```ts
type APIUserBlockType = "user" | "installation";
```

#### `REPORT_TYPE`

```ts
enum REPORT_TYPE {
    hate, nude, spam, fraud, target,
    harm, violence, harassment, suicide,
    illegal, banner
}
```

#### Error: `YOU_ARE_BLOCKED`

When a blocked user attempts to interact, the API returns:
```json
{
    "error": "you_are_blocked",
    "error_description": "...",
    "status": 403
}
```

The SDK throws an `iFunnyError` with `IFUNNY_ERRORS.YOU_ARE_BLOCKED`.

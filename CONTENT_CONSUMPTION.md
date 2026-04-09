# Content Consumption Documentation

How iFunny content is consumed — interacting with posts, reading data, and reacting.

---

## Usage

### Fetching Content

```ts
import iFunnyClient from "ifunny.ts";

const client = new iFunnyClient({
    basic: process.env.BASIC,
    bearer: process.env.BEARER,
});

// By ID
const content = await client.content.fetch("abc123def456");

// From cache (if previously fetched)
const cached = await client.content.fetch("abc123def456", true);
```

---

### Smiling / Unsmiling Content

```ts
const content = await client.content.fetch(contentId);

// Smile (like)
await content.smile();        // PUT /content/:id/smiles

// Remove your smile
await content.removeSmile();  // DELETE /content/:id/smiles

// Unsmile (dislike)
await content.unsmile();      // PUT /content/:id/unsmiles

// Remove your unsmile
await content.removeUnsmile(); // DELETE /content/:id/unsmiles

// All methods accept an optional `from` param to track feed origin
await content.smile("feat");   // smiled from the featured feed
await content.unsmile("coll"); // unsmiled from the collective feed
```

All smile/unsmile methods return `boolean` (success) and automatically update the local `content.num` counts.

---

### Browsing Users Who Smiled

```ts
// Async generator — paginated
for await (const user of content.smiles(30)) {
    console.log(user.nick);  // SimpleUser instances
}
```

Also updates `content.num.smiles` and `content.num.guest_smiles` as it pages.

---

### Reading Comments

```ts
for await (const comment of content.comments(30)) {
    console.log(comment.text, comment.author?.nick);
}
```

---

### Deleting Content

Only works if the authenticated client is the content author:

```ts
const success = await content.delete();  // DELETE /content/:id
// Returns false if you're not the author (checked client-side before the request)
```

---

### Marking Content as Read

```ts
// Single item
await client.content.markAsRead(contentId);
await client.content.markAsRead(content);

// Batch — comma-separated IDs in a single request
await client.content.markAsRead([content1, "id2", content3]);
```

---

### Reading Content Properties

```ts
const content = await client.content.fetch(contentId);

// Identity
content.id
content.type           // "pic" | "gif" | "video" | "video_clip" | "caption" | "mem" | "comics" | "coub" | "vine" | "gif_caption" | "app" | "old" | "dem" | "special"
content.url            // direct media URL
content.link           // web page URL
content.canonicalUrl

// Metadata
content.title
content.tags           // string[]
content.state          // "published" | "delayed" | "draft" | "deleted"
content.visibility     // "public" | "subscribers" | "closed" | "chats"
content.shotStatus     // "approved" | "shot" | "hardShot"
content.dateCreated    // epoch seconds
content.publishAt      // epoch seconds
content.issueAt        // epoch seconds (when featured, if applicable)

// Stats
content.num            // { smiles, unsmiles, guest_smiles, comments, views, republished, shares }

// Interaction state (for the authenticated user)
content.isSmiled
content.isUnsmiled
content.isRepublished
content.isFeatured
content.isPinned
content.isAbused

// Author
content.author         // APIUser | undefined (creator)
content.source         // { id, date_create, creator } — original content if this is a republish

// Media
content.size           // { h, w }
content.thumbnail      // Thumbnail object
content.data           // type-specific payload (video URL, image URL, etc.)
content.bgColor

// Feed tracking
content.feedFrom       // APIFeedFrom — which feed this was loaded from
```

---

### `APIFeedFrom` Values

Tracks where a content interaction originated (used for analytics):

| Value | Meaning |
|---|---|
| `"feat"` | Featured feed |
| `"coll"` | Collective feed |
| `"subs"` | Subscriptions/home feed |
| `"prof"` | User profile |
| `"sear"` | Search results |
| `"rec"` | Recommendations |
| `"channel"` | Chat channel |
| `"attach"` | Attachment |
| `"monofeed"` | Single-content feed |
| `"mySmiles"` / `"my-smiles"` | User's smiled content |
| `"mycomms"` | User's commented content |
| `"userfeat"` | User features list |
| `"reads"` | Read history |
| `"tag"` | Tag browse |

---

## API Reference

### REST Endpoints

All paths relative to `https://api.ifunny.mobi/v4`.

#### Content CRUD

| Method | Path | Description |
|---|---|---|
| `GET` | `/content/:id` | Fetch single content item |
| `DELETE` | `/content/:id` | Delete own content |

#### Smile / Unsmile

| Method | Path | Description |
|---|---|---|
| `PUT` | `/content/:id/smiles` | Smile content |
| `DELETE` | `/content/:id/smiles` | Remove smile |
| `PUT` | `/content/:id/unsmiles` | Unsmile content |
| `DELETE` | `/content/:id/unsmiles` | Remove unsmile |
| `GET` | `/content/:id/smiles` | List users who smiled (paginated) |
| `GET` | `/content/:id/republished` | List users who republished |

Response for PUT/DELETE smile:
```json
{
    "data": {
        "num_smiles": 42,
        "num_unsmiles": 3,
        "num_guest_smiles": 5
    }
}
```

#### Comments

| Method | Path | Description |
|---|---|---|
| `GET` | `/content/:id/comments` | Paginated comments list |

Query params: `limit`, `next` (cursor)

#### Mark as Read

| Method | Path | Description |
|---|---|---|
| `PUT` | `/reads/:id` | Mark single content as read |
| `PUT` | `/reads/:id1,:id2,...` | Batch mark as read (comma-separated IDs) |

---

### Content Types

The `APIContent` type is a discriminated union based on the `type` field:

| Type Value | Category | Description |
|---|---|---|
| `"pic"` | Image | Static image |
| `"caption"` | Image | Image with caption overlay |
| `"mem"` | Image | Meme format |
| `"comics"` | Image | Comics format |
| `"gif"` | Animated | GIF |
| `"gif_caption"` | Animated | GIF with caption |
| `"video"` | Video | Standard video |
| `"video_clip"` | Video | Video clip |
| `"vine"` | Video | Vine-style short video |
| `"coub"` | Video | Coub loop video |
| `"app"` | Special | App-specific content |
| `"old"` / `"dem"` / `"special"` | Special | Legacy/special formats |

### Data Models

#### `APIContentBase` (common to all types)

```ts
interface APIContentBase {
    id: string;
    type: string;
    url: string;              // direct media URL
    link: string;             // web page URL
    title: string;
    tags: string[];
    state: "published" | "delayed" | "draft" | "deleted";
    visibility: "public" | "subscribers" | "closed" | "chats";
    shot_status: "approved" | "shot" | "hardShot";
    date_create: number;      // epoch seconds
    publish_at: number;
    issue_at?: number;        // featured timestamp
    is_smiled: boolean;
    is_unsmiled: boolean;
    is_abused: boolean;
    is_featured: boolean;
    is_republished: boolean;
    is_pinned: boolean;
    num: {
        smiles: number;
        unsmiles: number;
        guest_smiles: number;
        comments: number;
        views: number;
        republished: number;
        shares: number;
    };
    creator?: APIUser;
    source?: {                // present if republished
        id: string;
        date_create: number;
        creator: APIUser;
    };
    size: { h: number; w: number };
    thumb: APIContentThumbnail;
    bg_color?: string;
    canonical_url: string;
    risk: number;
    ftag?: APIFeedFrom;       // feed origin tag
}
```

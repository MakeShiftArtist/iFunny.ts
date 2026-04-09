# Feeds Documentation

Deep dive into iFunny's feed system — how content is paginated, delivered, and consumed.

---

## Usage

### Accessing Feeds

The client exposes pre-configured feeds via `client.feeds`:

```ts
import iFunnyClient from "ifunny.ts";

const client = new iFunnyClient({
    basic: process.env.BASIC,
    bearer: process.env.BEARER,
});

// Featured — curated popular content
for await (const content of client.feeds.features.scroll()) {
    console.log(content.title, content.type);
}

// Collective — everything uploaded to iFunny
for await (const content of client.feeds.collective.scroll()) {
    console.log(content.title);
}

// Home / Subscriptions — personalized feed (requires auth)
for await (const content of client.feeds.home.scroll()) {
    console.log(content.title);
}

// client.feeds.subscriptions is an alias for client.feeds.home
```

### Scroll Options

```ts
// Custom page size
for await (const content of client.feeds.features.scroll({ limit: 10 })) {
    // ...
}

// Resume from a cursor
for await (const content of client.feeds.features.scroll({ next: savedCursor })) {
    // ...
}

// Mark content as read automatically while scrolling
for await (const content of client.feeds.features.scroll({}, true)) {
    // Each item is marked read via PUT /reads/:id as it's yielded
}
```

### User Timelines

User timelines are not pre-configured — access them via the `User` object:

```ts
const user = await client.users.fetch("iFunnyChef", true);

for await (const content of user.timeline.scroll()) {
    console.log(content.title);
}
```

---

## Feed Architecture

### The Three Layers

```
FeedManager               — creates and holds Feed instances
  └─ Feed                  — extends BaseFeed, has scroll() async generator
       └─ BaseFeed         — holds client ref and URL string
            └─ Util.paginate()  — the core pagination engine
```

### Feed Types

| Feed | URL Path | HTTP Method | Auth Required |
|---|---|---|---|
| Featured | `feeds/featured` | `GET` | No |
| **Collective** | `feeds/collective` | **`POST`** | No |
| Home | `timelines/home` | `GET` | Yes |
| User Timeline | `timelines/users/:id` | `GET` | No |

---

## The Collective POST Quirk

The collective feed is the **only** feed that uses `POST` instead of `GET`. This is a server-side design choice by iFunny, not a bug in the client.

### How it works

In `Util.paginate()` (`src/utils/Util.ts:143-160`):

```ts
let method: "GET" | "POST" = "GET";
if (url.toLowerCase() === "feeds/collective") {
    method = "POST";
}

const config: AxiosRequestConfig =
    method === "GET"
        ? { method, url, params: data }    // query string
        : { method, url, data };           // request body
```

For `GET` feeds, pagination params (`limit`, `next`, `prev`) are sent as **query string parameters**. For collective (`POST`), the same params are sent as the **request body** (URL-encoded form data via `URLSearchParams`).

The Go client has the same special case (`ifunny-go/compose/content.go:21-22`):

```go
if feed == "collective" {
    return Request{"POST", "/feeds/collective", nil, feedParams(limit, page)}
}
```

### The 5xx Error Problem

When you send a malformed request to the collective endpoint (e.g., invalid cursor, bad parameters), the server returns a **5xx error** instead of the expected **4xx (400 Bad Request)**.

This matters because the client's error handling treats them differently:

- **4xx errors** — The response body is valid JSON matching the iFunny error schema (`{ error, error_description, status }`). The SDK parses it and throws a typed `iFunnyError`.
- **5xx errors** — The response body is often non-standard (HTML error page, empty body, or malformed JSON). The SDK's `isAPIError` check fails, and the raw Axios error is re-thrown instead of being wrapped in an `iFunnyError`.

This means error handling around collective feed requests needs to catch both `iFunnyError` and raw `AxiosError`:

```ts
try {
    for await (const content of client.feeds.collective.scroll()) {
        // ...
    }
} catch (err) {
    if (err instanceof iFunnyError) {
        // Normal API error (4xx) — typed, has error code
        console.error(err.errorCode, err.description);
    } else {
        // Likely a 5xx from malformed request — raw AxiosError
        console.error("Server error:", err.message);
    }
}
```

The same behavior exists for explore compilations, which also use `POST`.

---

## Pagination Internals

### Cursor-Based Pagination

All feeds use cursor-based pagination. The flow:

1. First request is sent with `limit` (default: 30) and no cursor.
2. Response includes items and paging metadata.
3. If `paging.hasNext` is `true`, extract `paging.cursors.next` and set it as the `next` param for the next request.
4. Repeat until `hasNext` is `false`.

### Response Shape

All paginated endpoints return:

```json
{
    "data": {
        "<key>": {
            "items": [ /* content/user objects */ ],
            "paging": {
                "hasNext": true,
                "hasPrev": false,
                "cursors": {
                    "next": "opaque-cursor-string",
                    "prev": "opaque-cursor-string"
                }
            }
        }
    }
}
```

The `key` varies by endpoint:
- Feeds: `"content"`
- User lists: `"users"`
- Comments: `"comments"`
- Chat channels: `"channels"`

### PaginateConfig

```ts
interface PaginateConfig {
    limit?: number;    // items per page (default: 30)
    next?: string;     // cursor for next page (URL-encoded)
    prev?: string;     // cursor for previous page
    is_new?: boolean;  // server-side flag (rarely used)
}
```

### Page Size

The default page size is **30 items** in both the TypeScript and Go clients.

---

## Explore Compilations

The explore system provides curated content collections. Like collective, these use `POST`.

### Endpoint

```
POST /v4/explore/compilation/:compilationId
```

Query params: `limit`, `next` (cursor)

### Known Compilation IDs

| ID | Description |
|---|---|
| `content_top_overall` | Top content of all time |
| `content_top_today` | Top content today |
| `content_top_by_share` | Most shared content |
| `content_shuffle` | Random content |
| `users_top_overall` | Top users |
| `users_top_by_featured` | Most featured users |
| `chats_popular_last_week` | Popular channels this week |

Additional compilations exist for categories, tags, calendar dates, and channel IDs.

### Explore Response Shape

Slightly different from feeds:

```json
{
    "data": {
        "value": {
            "context": {
                "items": [ /* content objects */ ],
                "paging": { /* same cursor structure */ }
            }
        }
    }
}
```

---

## API Reference

### REST Endpoints

All paths relative to `https://api.ifunny.mobi/v4`.

#### Feeds

| Method | Path | Description |
|---|---|---|
| `GET` | `/feeds/featured` | Featured/popular content |
| **`POST`** | `/feeds/collective` | All uploaded content (**POST, not GET**) |
| `GET` | `/timelines/home` | Home feed (auth required) |
| `GET` | `/timelines/users/:userId` | User's timeline |
| `GET` | `/timelines/users/by_nick/:nick` | User's timeline by nick |

Query params (GET) / Body params (POST):

| Param | Type | Description |
|---|---|---|
| `limit` | string | Items per page (default "30") |
| `next` | string | Opaque cursor for next page |
| `prev` | string | Opaque cursor for previous page |

#### Explore

| Method | Path | Description |
|---|---|---|
| `POST` | `/explore/compilation/:id` | Explore compilation (various content/user lists) |

Query params: `limit`, `next`

#### Content Read Tracking

| Method | Path | Description |
|---|---|---|
| `PUT` | `/reads/:id` | Mark content as read |
| `PUT` | `/reads/:id1,:id2,...` | Batch mark as read |

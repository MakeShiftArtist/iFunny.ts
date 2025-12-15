import {
    Endpoints,
    type APIBan,
    type APIBanReason,
    type APIBanType,
} from "@ifunny/ifunny-api-types";
import { Base } from "./Base";
import { Comment } from "./Comment";
import { Content } from "./Content";
import type { User } from "./User";

/**
 * Represents a complete Ban Object on iFunny
 * @extends Base<APIBan>
 */
export class Ban extends Base<APIBan> {
    /**
     * The user attached to the Ban
     */
    readonly #user: User;

    /**
     * @param user User the ban is attached to
     * @param payload The payload of the Ban
     */
    public constructor(user: User, payload: APIBan) {
        super(user.client, payload);
        this.#user = user;
        this.endpointUrl = Endpoints.bans(user.id, payload.id);
    }

    /**
     * The user attached to the Ban
     */
    public get user(): User {
        return this.#user;
    }

    /**
     * The type of ban
     */
    public get type(): APIBanType {
        return this.get("type");
    }

    /**
     * Timestamp of when the Ban expires
     */
    public get expiresAt(): Date {
        return new Date(this.get("date_until") * 1000);
    }

    /**
     * How long (in miliseconds) until the Ban expires
     */
    public get expiresIn(): number {
        return this.expiresAt.getTime() - new Date().getTime();
    }

    /**
     * The reason for the Ban
     */
    public get reason(): APIBanReason {
        return this.get("ban_reason");
    }

    /**
     * The ban reason message
     */
    public get reasonMessage(): string | null {
        return this.get("ban_reason_message");
    }

    /**
     * Can the ban be appealed?
     */
    public get canBeAppealed(): boolean {
        return this.get("can_be_appealed");
    }

    /**
     * When the ban was created
     */
    public get createdAt(): Date {
        return new Date(this.get("created_at") * 1000);
    }

    /**
     * Not sure what this is
     */
    public get dateUntilMinimum(): number | null {
        return this.get("date_until_minimum");
    }

    /**
     * Is the Ban active?
     */
    public get isActive(): boolean {
        return this.get("is_active");
    }

    /**
     * Has the Ban be appealed?
     */
    public get isAppealed(): boolean {
        return this.get("is_appealed");
    }

    /**
     * Is the ban shortable?
     */
    public get isShortable(): boolean {
        return this.get("is_shortable");
    }

    /**
     * Don't know what this is yet
     */
    public get pid(): number {
        // TODO: Document what pid is
        return this.get("pid");
    }

    /**
     * The Comment related to the Ban if applicable
     */
    public get relatedComment(): Comment | null {
        const comment = this.get("related_comment");
        if (!comment) return null;
        if (!comment.content) return null;
        const content = new Content(this.client, comment.content);
        return new Comment(content, comment);
    }

    /**
     * The Content related to the Ban if applicable
     */
    public get relatedContent(): Content | null {
        const content = this.get("related_content");
        return content ? new Content(this.client, content) : null;
    }

    /**
     * The Ban Type message
     */
    public get typeMessage(): string | null {
        return this.get("type_message");
    }

    /**
     * Was the Ban shown to the Client?
     */
    public get wasShown(): boolean {
        return this.get("was_shown");
    }
}

export default Ban;

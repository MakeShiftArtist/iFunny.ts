import { APIBan, APIBanReason, APIBanType, Endpoints } from "@ifunny/ifunny-api-types";
import { Base } from "./Base";
import { Comment } from "./Comment";
import { Content } from "./Content";
import { User } from "./User";

/**
 * Represents a complete Ban Object on iFunny
 * @extends Base<APIBan>
 */
export class Ban extends Base<APIBan> {
	readonly #user: User;
	/**
	 * @param user User the ban is attached to
	 * @param payload The payload of the Ban
	 */
	constructor(user: User, payload: APIBan) {
		super(user.client, payload);
		this.#user = user;
		this.endpoint_url = Endpoints.bans(user.id, payload.id);
	}

	/**
	 * The user attached to the Ban
	 */
	get user(): User {
		return this.#user;
	}

	/**
	 * The type of ban
	 */
	get type(): APIBanType {
		return this.get("type");
	}

	/**
	 * Timestamp of when the Ban expires
	 */
	get expires_at(): Date {
		return new Date(this.get("date_until") * 1000);
	}

	/**
	 * How long (in miliseconds) until the Ban expires
	 */
	get expires_in(): number {
		return this.expires_at.getTime() - new Date().getTime();
	}

	/**
	 * The reason for the Ban
	 */
	get reason(): APIBanReason {
		return this.get("ban_reason");
	}

	/**
	 * The ban reason message
	 */
	get reason_message(): string | null {
		return this.get("ban_reason_message");
	}

	/**
	 * Can the ban be appeald?
	 */
	get can_be_appealed(): boolean {
		return this.get("can_be_appealed");
	}

	/**
	 * When the ban was created
	 */
	get created_at(): Date {
		return new Date(this.get("created_at") * 1000);
	}

	/**
	 * Not sure what this is
	 */
	get date_until_minimum(): number | null {
		return this.get("date_until_minimum");
	}

	/**
	 * Is the Ban active?
	 */
	get is_active(): boolean {
		return this.get("is_active");
	}

	/**
	 * Has the Ban be appealed?
	 */
	get is_appealed(): boolean {
		return this.get("is_appealed");
	}

	/**
	 * Is the ban shortable?
	 */
	get is_shortable(): boolean {
		return this.get("is_shortable");
	}

	/**
	 * Don't know what this is yet
	 */
	get pid(): number {
		return this.get("pid");
	}

	/**
	 * The Comment related to the Ban if applicable
	 */
	get related_comment(): Comment | null {
		const comment = this.get("related_comment");
		if (!comment) return null;
		const content = new Content(this.client, comment.content);
		return new Comment(content, comment);
	}

	/**
	 * The Content related to the Ban if applicable
	 */
	get related_content(): Content | null {
		const content = this.get("related_content");
		return content ? new Content(this.client, content) : null;
	}

	/**
	 * The Ban Type message
	 */
	get type_message(): string | null {
		return this.get("type_message");
	}

	/**
	 * Was the Ban shown to the Client?
	 */
	get was_shown(): boolean {
		return this.get("was_shown");
	}
}

export default Ban;

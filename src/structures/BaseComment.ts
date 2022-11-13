import { APIComment } from "@ifunny/ifunny-api-types";
import { Base } from "./Base";
import { SimpleUser } from "./SimpleUser";
import { Content } from "./Content";

// TODO: Add missing docs to BaseComment

/**
 * Represents a BaseComment on iFunny
 * @extends Base<APIComment>
 */
export class BaseComment extends Base<APIComment> {
	#author: SimpleUser | null = null;
	#content: Content;

	/**
	 * @param content Content the Comment is attached to
	 * @param payload Payload of the Comment
	 */
	constructor(content: Content, payload: APIComment) {
		super(content.client, payload);
		this.#content = content;
	}

	/**
	 * Content ID the comment is attached to
	 */
	get content_id() {
		return this.get("cid");
	}

	/**
	 * Content attached to the Comment
	 */
	get content() {
		return this.#content;
	}

	get thumbnails() {
		return this.get("content_thumbs");
	}

	get date() {
		return this.get("date");
	}

	get is_edited() {
		return this.get("is_edited");
	}

	is_reply() {
		return this.get("is_reply");
	}

	get is_smiled() {
		return this.get("is_smiled");
	}

	get is_unsmiled() {
		return this.get("is_unsmiled");
	}

	get last_reply() {
		return this.get("last_reply");
	}

	get num() {
		return this.get("num");
	}

	get state() {
		return this.get("state");
	}

	get status() {
		return this.get("status");
	}

	/**
	 * The text of the Comment. Can be an empty string
	 */
	get text() {
		return this.get("text");
	}

	/**
	 * Author of the Comment
	 * @alias creator
	 */
	get author(): SimpleUser {
		return (this.#author ??= new SimpleUser(this.client, this.get("user")));
	}

	/**
	 * Author of the Comment
	 * @alias author
	 */
	get creator(): SimpleUser {
		return this.author;
	}
}

export default BaseComment;

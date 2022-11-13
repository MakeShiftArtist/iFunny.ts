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
	public constructor(content: Content, payload: APIComment) {
		super(content.client, payload);
		this.#content = content;
	}

	/**
	 * Content ID the comment is attached to
	 */
	public get content_id() {
		return this.get("cid");
	}

	/**
	 * Content attached to the Comment
	 */
	public get content() {
		return this.#content;
	}

	public get thumbnails() {
		return this.get("content_thumbs");
	}

	public get date() {
		return this.get("date");
	}

	public get is_edited() {
		return this.get("is_edited");
	}

	public is_reply() {
		return this.get("is_reply");
	}

	public get is_smiled() {
		return this.get("is_smiled");
	}

	public get is_unsmiled() {
		return this.get("is_unsmiled");
	}

	public get last_reply() {
		return this.get("last_reply");
	}

	public get num() {
		return this.get("num");
	}

	public get state() {
		return this.get("state");
	}

	public get status() {
		return this.get("status");
	}

	/**
	 * The text of the Comment. Can be an empty string
	 */
	public get text() {
		return this.get("text");
	}

	/**
	 * Author of the Comment
	 * @alias creator
	 */
	public get author(): SimpleUser {
		return (this.#author ??= new SimpleUser(this.client, this.get("user")));
	}

	/**
	 * Author of the Comment
	 * @alias author
	 */
	public get creator(): SimpleUser {
		return this.author;
	}
}

export default BaseComment;

import {
	Endpoints,
	type APIComment,
	type APICommentNum,
	type APICommentState,
} from "@ifunny/ifunny-api-types";
import { Base } from "./Base";
import { Comment } from "./Comment";
import { SimpleUser } from "./SimpleUser";
import { Thumbnail } from "./Thumbnail";
import type { Content } from "./Content";

/**
 * Represents a BaseComment on iFunny
 * @extends Base<APIComment>
 */
export class BaseComment extends Base<APIComment> {
	/**
	 * The author of the comment
	 */
	#author: SimpleUser | null = null;
	/**
	 * The content of the comment
	 */
	#content: Content;

	/**
	 * @param content Content the Comment is attached to
	 * @param payload Payload of the Comment
	 */
	public constructor(content: Content, payload: APIComment) {
		super(content.client, payload);
		this.#content = content;
		this.endpointUrl = Endpoints.comments(this.content.id, this.payload.id);
	}

	/**
	 * Content ID the comment is attached to
	 */
	public get contentId(): string {
		return this.get("cid");
	}

	/**
	 * Content attached to the Comment
	 */
	public get content(): Content {
		return this.#content;
	}

	/**
	 * Thumbnails for the content
	 */
	public get thumbnails(): Thumbnail | null {
		const thumbs = this.get("content_thumbs");
		return thumbs ? new Thumbnail(thumbs) : null;
	}

	/**
	 * Returns the date when the comment was created.
	 * @returns The comment's date as a `Date` object.
	 */

	public get date(): Date {
		return new Date(this.get("date") * 1000);
	}

	/**
	 * Whether the comment has been edited.
	 * @returns True if the comment has been edited, false otherwise.
	 */
	public get isEdited(): boolean {
		return this.get("is_edited");
	}

	/**
	 * Whether the comment is a reply to another comment.
	 * @returns True if the comment is a reply, false otherwise.
	 */
	public get isReply(): boolean {
		return this.get("is_reply");
	}

	/**
	 * Whether the comment has been smiled by the user.
	 * @returns True if the comment has been smiled, false otherwise.
	 */
	public get isSmiled(): boolean {
		return this.get("is_smiled");
	}

	/**
	 * Whether the user has un-smiled the comment.
	 * @returns True if the comment has been un-smiled, false otherwise.
	 */
	public get isUnsmiled(): boolean {
		return this.get("is_unsmiled");
	}

	/**
	 * The last reply to the comment.
	 * @returns The last reply to the comment, or null if there are no replies.
	 */
	public get lastReply(): Comment | null {
		const reply = this.get("last_reply");
		return reply ? new Comment(this.content, reply) : null;
	}

	/**
	 * The number of the comment.
	 * @returns The number of the comment.
	 */
	public get num(): APICommentNum {
		return this.get("num");
	}

	/**
	 * The state of the comment.
	 * @returns The state of the comment, or null if the state is not available.
	 */
	public get state(): APICommentState | null {
		return this.get("state");
	}

	/**
	 * The text of the Comment. Can be an empty string
	 */
	public get text(): string {
		return this.get("text");
	}

	/**
	 * Author of the Comment
	 * @alias creator
	 * @example
	 * const author = comment.author; // SimpleUser
	 * const user = await author.user(); // Full User
	 */
	public get author(): SimpleUser | null {
		const user = this.get("user");
		return (this.#author ??= user ? new SimpleUser(this.client, user) : null);
	}

	/**
	 * Author of the Comment
	 * @alias author
	 * @example
	 * const author = comment.author; // SimpleUser
	 * const user = await author.user(); // Full User
	 */
	public get creator(): SimpleUser | null {
		return this.author;
	}

	/**
	 * Delete the comment
	 * @example
	 * for (const comment of content.comments())
	 * 	await comment.delete()
	 */
	public async delete() {
		return await this.client.instance.request<any>({
			url: Endpoints.comments(this.content.id, this.id),
			method: "DELETE"
		})
	}
}

export default BaseComment;

import { BaseComment } from "./BaseComment";
import type { APIComment } from "@ifunny/ifunny-api-types";
import type { Content } from "./Content";

// TODO: Add Comment methods

/**
 * Represents a Comment on iFunny
 * @extends BaseComment
 */
export class Comment extends BaseComment {
	/**
	 * @param content Content attached to the Comment
	 * @param payload Payload of the Comment
	 */
	public constructor(content: Content, payload: APIComment) {
		super(content, payload);
	}
}

export default Comment;

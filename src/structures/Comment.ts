import { BaseComment } from "./BaseComment";
import type { Endpoints, APIComment } from "@ifunny/ifunny-api-types";
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

export default Comment;

import { APIMemeExperience } from "@ifunny/ifunny-api-types";

/**
 * The Meme Experience for a user
 */
export class MemeExperience {
	protected data: APIMemeExperience;
	constructor(data: APIMemeExperience) {
		this.data = data;
	}

	/**
	 * The user's rank
	 */
	get rank() {
		return this.data.rank;
	}

	/**
	 * How many days the user has spent logged in
	 */
	get days() {
		return this.data.days;
	}

	/**
	 * Url of the badge
	 * @example
	 * `https://img.ifunny.co/meme_experience/${number}.png`
	 */
	get badgeUrl() {
		return this.data.badge_url;
	}

	/**
	 * Size of the badge
	 */
	get badgeSize() {
		return this.data.badge_size;
	}

	/**
	 * Days needed to get the next rank\
	 * ? Chef's Meme Agent will show 3000 but does not change when it reaches it
	 */
	get nextMilestone() {
		return this.data.next_milestone;
	}

	/**
	 * Days until the user reaches the next milestone
	 */
	get daysUntilNextMilestone() {
		return this.nextMilestone - this.days;
	}
}

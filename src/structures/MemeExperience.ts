import { APIMemeExperience, APIMemeRank, Size } from "@ifunny/ifunny-api-types";

/**
 * The Meme Experience for a user
 */
export class MemeExperience {
	/**
	 * Raw data from the API
	 */
	protected data: APIMemeExperience;

	/**
	 * @param data The raw api data for the meme experience
	 */
	public constructor(data: APIMemeExperience) {
		this.data = data;
	}

	/**
	 * The user's rank
	 */
	public get rank(): APIMemeRank {
		return this.data.rank;
	}

	/**
	 * How many days the user has spent logged in
	 */
	public get days(): number {
		return this.data.days;
	}

	/**
	 * Url of the badge
	 * @example
	 * `https://img.ifunny.co/meme_experience/${number}.png`
	 */
	public get badge_url(): string {
		return this.data.badge_url;
	}

	/**
	 * Size of the badge
	 */
	public get badge_size(): Size {
		return this.data.badge_size;
	}

	/**
	 * Days needed to get the next rank\
	 * ? Chef's Meme Agent will show 3000 but does not change when it reaches it
	 */
	public get next_milestone(): number {
		return this.data.next_milestone;
	}

	/**
	 * Days until the user reaches the next milestone
	 */
	public get days_until_next_milestone(): number {
		return this.next_milestone - this.days;
	}
}

export default MemeExperience;

import {
    APIAppPrivacy,
    APIAppSettings,
    APICounters,
    Endpoints,
    RESTAPICountersResponse,
    RESTAPISuccessResponse,
} from "@ifunny/ifunny-api-types";
import Client from "../client/Client";

/**
 * Manages misc data from the app.
 */
export class AppManager {
    readonly #client: Client;
    /**
     * @param client Client instance
     */
    constructor(client: Client) {
        this.#client = client;
    }

    /**
     * Client instance attached to the manager
     */
    public get client(): Client {
        return this.#client;
    }

    /**
     * Fetches the counter data for the Client.
     * @returns App counters for the API
     */
    public async counters(): Promise<APICounters> {
        return (
            await this.client.instance.get<RESTAPICountersResponse>(
                Endpoints.counters,
            )
        ).data.data;
    }

    /**
     * Fetches App settings
     * @returns App settings configuration
     */
    public async settings(): Promise<APIAppSettings> {
        return (
            await this.client.instance.get<
                RESTAPISuccessResponse<APIAppSettings>
            >(Endpoints.settings)
        ).data.data;
    }

    /**
     * Fetches App privacy
     * @returns The App's privacy configuration
     */
    public async privacy(): Promise<APIAppPrivacy> {
        return (
            await this.client.instance.get<
                RESTAPISuccessResponse<APIAppPrivacy>
            >(Endpoints.privacy)
        ).data.data;
    }
}

export default AppManager;

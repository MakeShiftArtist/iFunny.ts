// * "Root" classes (starting points)
export { BaseClient } from "./client/BaseClient";
export { Client, default } from "./client/Client";

// ! Errors
export { CaptchaError } from "./errors/CaptchaError";
export { iFunnyError } from "./errors/iFunnyError";

// ? Structs
export { Ban } from "./structures/Ban";
export { BanSmall } from "./structures/BanSmall";
export { Comment } from "./structures/Comment";
export { Content } from "./structures/Content";
export { Creator } from "./structures/Creator";
export { Feed } from "./structures/Feed";
export { MemeExperience } from "./structures/MemeExperience";
export { News } from "./structures/News";
export { SimpleUser } from "./structures/SimpleUser";
export { Thumbnail } from "./structures/Thumbnail";
export { User } from "./structures/User";
export { Util } from "./utils/Util";

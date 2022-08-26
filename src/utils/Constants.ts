import { BasicAuthConfig, BasicAuthLength } from "./Util";

// * User Agent
// ? As of 7/24/22 on Android 7.1.2

// App Version

export type SemanticVersion = `${number}.${number}.${number}`;
export const DefaultAppVersion: SemanticVersion = "8.8.11";
export const DefaultAppBuild: number = 1130392;
export const DefaultAppAgent = `iFunny/${DefaultAppVersion}(${DefaultAppBuild})`;
export const DefaultClientId: string = "MsOIJ39Q28";
export const DefaultClientSecret: string = "PTDc3H8a)Vi=UYap";
export const DefaultBasicTokenLength: BasicAuthLength = 112;
export const DefaultBasicAuthConfig: BasicAuthConfig = {
	clientId: DefaultClientId,
	clientSecret: DefaultClientSecret,
	length: DefaultBasicTokenLength,
};

// Device Agent (Android)
export const DefaultDeviceOS = "Android";
export const DefaultOSVersion = "7.1.2";
export const DefaultDeviceBrand = "samsung";
export const DefaultDeviceModel = "SM-G973N";
export const DefaultDeviceAgent = `${DefaultDeviceOS}/${DefaultOSVersion} (${DefaultDeviceBrand}; ${DefaultDeviceModel}; ${DefaultDeviceBrand})`;
export const DefaultUserAgent = `${DefaultAppAgent} ${DefaultDeviceAgent}`;

// * Headers
export const APIVersion = 4;
export const APIBase = "api.ifunny.mobi";
export const WebSocketBase = "chat.ifunny.co";
export const iFunnyProjectId = "iFunny";
export const DefaultAccept = "application/json,image/jpeg,image/webp,video/mp4";
export const DefaultAcceptLang = "en";
export const DefaultAcceptEncoding = "gzip";
export const DefaultApplicationState = 1;

export const DefaultHeaders = {
	"ifunny-project-id": iFunnyProjectId,
	accept: DefaultAccept,
	"accept-encoding": DefaultAcceptEncoding,
	"accept-language": DefaultAcceptLang,
	"user-agent": DefaultUserAgent,
};

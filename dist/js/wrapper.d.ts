import { Event, Response } from "@sentry/types";
/**
 * Our internal interface for calling native functions
 */
export declare const NATIVE: {
    /**
     * Sending the event over the bridge to native
     * @param event Event
     */
    sendEvent(event: Event): Promise<Response>;
    platform: import("react-native").PlatformOSType;
};
//# sourceMappingURL=wrapper.d.ts.map
import * as tslib_1 from "tslib";
import { NativeModules, Platform } from "react-native";
const { RNSentry } = NativeModules;
/**
 * Our internal interface for calling native functions
 */
export const NATIVE = {
    /**
     * Sending the event over the bridge to native
     * @param event Event
     */
    sendEvent(event) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (NATIVE.platform === "android") {
                const header = JSON.stringify({ event_id: event.event_id });
                event.message = {
                    message: event.message
                };
                const payload = JSON.stringify(event);
                let length = payload.length;
                try {
                    // tslint:disable-next-line: no-unsafe-any
                    length = yield RNSentry.getStringBytesLength(payload);
                }
                catch (_a) {
                    // The native call failed, we do nothing, we have payload.length as a fallback
                }
                const item = JSON.stringify({
                    content_type: "application/json",
                    length,
                    type: "event"
                });
                const envelope = `${header}\n${item}\n${payload}`;
                // tslint:disable-next-line: no-unsafe-any
                return RNSentry.captureEnvelope(envelope);
            }
            // tslint:disable-next-line: no-unsafe-any
            return RNSentry.sendEvent(event);
        });
    },
    platform: Platform.OS
};
//# sourceMappingURL=wrapper.js.map
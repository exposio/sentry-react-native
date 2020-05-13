import * as tslib_1 from "tslib";
import { addGlobalEventProcessor, getCurrentHub } from "@sentry/core";
import { NativeModules } from "react-native";
const { RNSentry } = NativeModules;
/** Load device context from native. */
export class DeviceContext {
    constructor() {
        /**
         * @inheritDoc
         */
        this.name = DeviceContext.id;
    }
    /**
     * @inheritDoc
     */
    setupOnce() {
        addGlobalEventProcessor((event) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const self = getCurrentHub().getIntegration(DeviceContext);
            if (!self) {
                return event;
            }
            try {
                // tslint:disable-next-line: no-unsafe-any
                const deviceContexts = yield RNSentry.deviceContexts();
                event.contexts = Object.assign({}, deviceContexts, event.contexts);
            }
            catch (_Oo) {
                // Something went wrong, we just continue
            }
            return event;
        }));
    }
}
/**
 * @inheritDoc
 */
DeviceContext.id = "DeviceContext";
//# sourceMappingURL=devicecontext.js.map
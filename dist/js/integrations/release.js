import * as tslib_1 from "tslib";
import { addGlobalEventProcessor, getCurrentHub } from "@sentry/core";
import { NativeModules } from "react-native";
const { RNSentry } = NativeModules;
/** Release integration responsible to load release from file. */
export class Release {
    constructor() {
        /**
         * @inheritDoc
         */
        this.name = Release.id;
    }
    /**
     * @inheritDoc
     */
    setupOnce() {
        addGlobalEventProcessor((event) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const self = getCurrentHub().getIntegration(Release);
            if (!self) {
                return event;
            }
            try {
                // tslint:disable-next-line: no-unsafe-any
                const release = (yield RNSentry.fetchRelease());
                if (release) {
                    event.release = `${release.id}@${release.version}+${release.build}`;
                    event.dist = `${release.build}`;
                }
            }
            catch (_Oo) {
                // Something went wrong, we just continue
            }
            // If __sentry_release or __sentry_dist it should be stronger because the user set it
            if (event.extra && event.extra.__sentry_release) {
                event.release = `${event.extra.__sentry_release}`;
            }
            if (event.extra && event.extra.__sentry_dist) {
                event.dist = `${event.extra.__sentry_dist}`;
            }
            return event;
        }));
    }
}
/**
 * @inheritDoc
 */
Release.id = "Release";
//# sourceMappingURL=release.js.map
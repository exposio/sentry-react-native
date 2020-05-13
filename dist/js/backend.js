import { Transports } from "@sentry/browser";
import { BrowserBackend } from "@sentry/browser/dist/backend";
import { BaseBackend, NoopTransport } from "@sentry/core";
import { Severity } from "@sentry/types";
import { Alert, NativeModules, YellowBox } from "react-native";
import { NativeTransport } from "./transports/native";
const { RNSentry } = NativeModules;
/** The Sentry ReactNative SDK Backend. */
export class ReactNativeBackend extends BaseBackend {
    /** Creates a new ReactNative backend instance. */
    constructor(_options) {
        super(_options);
        this._options = _options;
        this._browserBackend = new BrowserBackend(_options);
        // This is a workaround for now using fetch on RN, this is a known issue in react-native and only generates a warning
        YellowBox.ignoreWarnings(["Require cycle:"]);
        // tslint:disable: no-unsafe-any
        if (RNSentry &&
            RNSentry.nativeClientAvailable &&
            _options.enableNative !== false) {
            RNSentry.startWithDsnString(_options.dsn, _options).then(() => {
                RNSentry.setLogLevel(_options.debug ? 2 : 1);
            });
        }
        else {
            if (__DEV__ && _options.enableNativeNagger) {
                Alert.alert("Sentry", "Warning, could not connect to Sentry native SDK.\nIf you do not want to use the native component please pass `enableNative: false` in the options.\nVisit: https://docs.sentry.io/platforms/react-native/#linking for more details.");
            }
        }
        // tslint:enable: no-unsafe-any
    }
    /**
     * @inheritDoc
     */
    _setupTransport() {
        if (!this._options.dsn) {
            // We return the noop transport here in case there is no Dsn.
            return new NoopTransport();
        }
        const transportOptions = Object.assign({}, this._options.transportOptions, { dsn: this._options.dsn });
        if (this._options.transport) {
            return new this._options.transport(transportOptions);
        }
        if (this._isNativeTransportAvailable()) {
            return new NativeTransport();
        }
        return new Transports.FetchTransport(transportOptions);
    }
    /**
     * If true, native client is availabe and active
     */
    _isNativeTransportAvailable() {
        // tslint:disable: no-unsafe-any
        return (this._options.enableNative &&
            RNSentry &&
            RNSentry.nativeClientAvailable &&
            RNSentry.nativeTransport);
        // tslint:enable: no-unsafe-any
    }
    /**
     * If native client is available it will trigger a native crash.
     * Use this only for testing purposes.
     */
    nativeCrash() {
        if (this._options.enableNative) {
            // tslint:disable-next-line: no-unsafe-any
            RNSentry.crash();
        }
    }
    /**
     * @inheritDoc
     */
    eventFromException(exception, hint) {
        return this._browserBackend.eventFromException(exception, hint);
    }
    /**
     * @inheritDoc
     */
    eventFromMessage(message, level = Severity.Info, hint) {
        return this._browserBackend.eventFromMessage(message, level, hint);
    }
}
//# sourceMappingURL=backend.js.map
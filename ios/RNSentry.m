#import "RNSentry.h"

#if __has_include(<React/RCTConvert.h>)
#import <React/RCTConvert.h>
#else
#import "RCTConvert.h"
#endif

#import <Sentry/Sentry.h>

@interface RNSentry()

@end


@implementation RNSentry

- (dispatch_queue_t)methodQueue
{
    return dispatch_get_main_queue();
}

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

RCT_EXPORT_MODULE()

- (NSDictionary<NSString *, id> *)constantsToExport
{
    return @{@"nativeClientAvailable": @YES, @"nativeTransport": @YES};
}

RCT_EXPORT_METHOD(startWithDsnString:(NSString * _Nonnull)dsnString
                  options:(NSDictionary *_Nonnull)options
                  resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    NSError *error = nil;
    
    SentryOptions *sentryOptions = [[SentryOptions alloc] initWithDict:options didFailWithError:&error];
    if (error) {
        reject(@"SentryReactNative", error.localizedDescription, error);
        return;
    }
    
    SentryBeforeSendEventCallback beforeSend = ^SentryEvent*(SentryEvent *event) {
        // We don't want to send an event after startup that came from a Unhandled JS Exception of react native
        // Because we sent it already before the app crashed.
        if (nil != event.exceptions.firstObject.type &&
            [event.exceptions.firstObject.type rangeOfString:@"Unhandled JS Exception"].location != NSNotFound) {
            NSLog(@"Unhandled JS Exception");
            return nil;
        }
        return event;
    };
    
    [options setValue:beforeSend forKey:@"beforeSend"];
    
    [SentrySDK startWithOptionsObject:sentryOptions];

    resolve(@YES);
}

// TODO: Need to expose device context from sentry-cocoa
////RCT_EXPORT_METHOD(deviceContexts:(RCTPromiseResolveBlock)resolve
////                  rejecter:(RCTPromiseRejectBlock)reject)
////{
////    resolve([[[SentryContext alloc] init] serialize]);
////}

RCT_EXPORT_METHOD(setLogLevel:(int)level)
{
    SentryLogLevel cocoaLevel;
    switch (level) {
        case 1:
            cocoaLevel = kSentryLogLevelError;
        case 2:
            cocoaLevel = kSentryLogLevelDebug;
        case 3:
            cocoaLevel = kSentryLogLevelVerbose;
        default:
            cocoaLevel = kSentryLogLevelNone;
    }
    [SentrySDK setLogLevel:cocoaLevel];
}

RCT_EXPORT_METHOD(fetchRelease:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    NSDictionary *infoDict = [[NSBundle mainBundle] infoDictionary];
    resolve(@{
              @"id": infoDict[@"CFBundleIdentifier"],
              @"version": infoDict[@"CFBundleShortVersionString"],
              @"build": infoDict[@"CFBundleVersion"],
              });
}

RCT_EXPORT_METHOD(sendEvent:(NSDictionary * _Nonnull)event
                  resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0ul), ^{
        if ([NSJSONSerialization isValidJSONObject:event]) {
            NSData *jsonData = [NSJSONSerialization dataWithJSONObject:event
                                                               options:0
                                                                 error:nil];

            SentryEvent *sentryEvent = [[SentryEvent alloc] initWithJSON:jsonData];
            [SentrySDK captureEvent:sentryEvent];
            resolve(@YES);
        } else {
            reject(@"SentryReactNative", @"Cannot serialize event", nil);
        }
    });
}

RCT_EXPORT_METHOD(crash)
{
    [SentrySDK crash];
}

@end

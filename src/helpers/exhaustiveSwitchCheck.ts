/**
  * Copyright © 2021 Serelay Ltd. All rights reserved.
  */


/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * Utility to to check that a switch is exhaustive. Call the function
 * with the switch argument in the `default` case. If the switch is not
 * exhaustive you will get a compilation error.
 *
 * @example
 * Compilation error if an option is missed
 * ```
 * switch(mediaType) {
 *   case MediaType.IMAGE:
 *    doSomething();
 *   default:
 *    exhaustiveSwitchCheck(mediaType) // compile time error
 * }
 * ```
 *
 * @example
 * Narrow types by ensuring all branches are covered. No need to throw,
 * no need for `thing as xyz` or `thing!`:
 * ```
 * let thing;
 * switch(mediaType) {
 *   case MediaType.IMAGE:
 *    thing = 'image';
 *    break;
 *   case MediaType.VIDEO:
 *    thing = 'video';
 *    break;
 *   default:
 *    exhaustiveSwitchCheck(mediaType) // ✅
 * }
 * thing.toLowerCase(); // `thing` is guaranteed to be a string
 * ```
 */
export default function exhaustiveSwitchCheck(param: never): void {}

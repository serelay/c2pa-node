/**
  * Copyright © 2021 Serelay Ltd. All rights reserved.
  */


/**
 * @module framework/errors
 */

/**
 * Base Error Class.
 * Abstract base class from which all custom errors should extend.
 * Main purpose is to provide more informative errors, that provide better insight
 * and faster debugging.
 * @extends Error
 */
export default abstract class BaseError extends Error {
  name: string;

  debug: string;

  details: object;

  /**
   * @param message High-level and/or general error message/description, that
   * can potentially be shown to the user, unchanged.
   * @param debug Error message/description that provides a better insight into
   * the issue. Meant for internal/developer use only, should never reach
   * the consumer.
   * @param details Additional error data that might be relevant for debugging.
   */
  constructor(message: string, debug = '', details: object = {}) {
    super(message);
    this.name = this.constructor.name;
    this.debug = debug;
    this.details = details;
  }
}

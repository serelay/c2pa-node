/**
  * Copyright © 2021 Serelay Ltd. All rights reserved.
  */


/**
 * @module app/mediaProcessing/errors
 */

import BaseError from './BaseError';

/**
 * Abstract Media Processing Error Class.
 * @extends BaseError
 */
export default abstract class MediaProcessingError extends BaseError {
  /**
   * @param message High-level and/or general error message/description, that
   * can potentially be shown to the user, unchanged.
   * @param debug Error message/description that provides a better insight into
   * the issue. Meant for internal/developer use only, should never reach the
   * consumer.
   * @param details Additional error data that might be relevant for debugging
   */
  constructor(message: string, debug = '', details: object = {}) {
    super(message, debug, details);
  }
}

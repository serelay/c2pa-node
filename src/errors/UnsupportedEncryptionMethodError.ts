/**
  * Copyright © 2021 Serelay Ltd. All rights reserved.
  */


/**
 * @module framework/errors
 */
import BaseError from './BaseError';

const DEFAULT_MESSAGE = 'UnsupportedEncryptionMethodError. Failed to encrypt/decrypt message.';

/**
 * UnsupportedEncryptionMethodError Class.
 * @extends BaseError
 */
export default class UnsupportedEncryptionMethodError extends BaseError {
  /**
   * @param rawDebugMessage Basic developer-oriented error message.
   * @param details Extra error details.
   */
  constructor(message = DEFAULT_MESSAGE, details = {}) {
    super(message, 'UnsupportedEncryptionMethodError. See details.', details);
  }
}

/**
  * Copyright © 2021 Serelay Ltd. All rights reserved.
  */


/** @module modules/provenance/errors */

import ProvenanceError from './ProvenanceError';

const ERROR_MESSAGE = 'Could not create a signature';
const DEBUG_MESSAGE = ERROR_MESSAGE;

/**
 * Provenance Signing error
 * @extends ProvenanceError
 */
export default class ProvenanceSigningError extends ProvenanceError {
  constructor(debugMessage = DEBUG_MESSAGE, error: Error) {
    super(ERROR_MESSAGE, debugMessage, { originalError: error });
  }
}

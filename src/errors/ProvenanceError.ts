/**
  * Copyright © 2021 Serelay Ltd. All rights reserved.
  */


/** @module modules/provenance/errors */

import BaseError from './BaseError';

export default abstract class ProvenanceError extends BaseError {
  constructor(message: string, debug = '', details: Record<string, unknown>) {
    super(message, debug, details);
  }
}

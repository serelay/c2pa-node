/**
  * Copyright © 2021 Serelay Ltd. All rights reserved.
  */


/** @module app/mediaProcessing/errors */

import MediaProcessingError from './MediaProcessingError';

const ERROR_MESSAGE = 'There was an error parsing a JPG.';
const DEBUG_MESSAGE = ERROR_MESSAGE;

export default class JpegParsingError extends MediaProcessingError {
  constructor(message: string = ERROR_MESSAGE) {
    super(message, DEBUG_MESSAGE);
  }
}

/**
  * Copyright © 2021 Serelay Ltd. All rights reserved.
  */


import HashingToolkit from '../../hashing/HashingToolkit';
import JpegDataParser from '../../jpegParsing/JpegDataParser';
import C2PAAssetHash from '../models/C2PAAssetHash';

export default class C2PAImageHasher {
  private readonly parser: JpegDataParser;

  constructor(media: Buffer) {
    // We strip the XMP here because API will generate a new XMP block containing
    // C2PA data.
    this.parser = JpegDataParser.create(media);
  }

  public contentHash(): C2PAAssetHash {
    const visualData = this.parser.getSosToEndOfFile();
    const hash = HashingToolkit.sha256Hash(visualData.content);
    return {
      hash: Buffer.from(hash, 'hex').toString('base64'),
      pad: '',
      name: 'JPEG Content',
      alg: 'sha256',
      exclusions: [],
    };
  }
}

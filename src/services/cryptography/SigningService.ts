/**
  * Copyright © 2021 Serelay Ltd. All rights reserved.
  */


import * as cbor from 'cbor';
import * as crypto from 'crypto';
import SigningAlgorithm from './SigningAlgorithm.enum';

export default class SigningService {
  public static sign(data: Buffer, algorithm: SigningAlgorithm): Buffer {
    switch (algorithm.algorithm) {
      case 'SHA256':
        return SigningService.signSha256(data, algorithm.privateKey);
      case 'COSE':
        return SigningService.signCOSE(data, algorithm.privateKey, algorithm.chain);
      default:
        throw new Error('Unrecognised signing algorithm');
    }
  }

  private static signSha256(data: Buffer, privateKey: Buffer): Buffer {
    const sign = crypto.createSign('SHA256');
    sign.write(data);
    sign.end();
    return sign.sign(privateKey);
  }

  private static signCOSE(data: Buffer, privateKey: Buffer, chain: Buffer[]): Buffer {
    const signature = SigningService.signSha256(data, privateKey);
    // when RFC is fixed up with a real value we can use this. C2PA spec issue #485
    const X5CHAIN_PLACEHOLDER = 'x5chain';
    const ALGORITHM_LABEL = 1;
    const RSA = -257;
    const sigData = [
      { [ALGORITHM_LABEL]: RSA },
      { [X5CHAIN_PLACEHOLDER]: chain },
      Buffer.alloc(0),
      signature,
    ];
    const coseSign1Tag = 18;
    return cbor.encodeCanonical(new cbor.Tagged(coseSign1Tag, sigData));
  }
}

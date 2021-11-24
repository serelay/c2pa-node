/**
  * Copyright © 2021 Serelay Ltd. All rights reserved.
  */


import * as cbor from 'cbor';
import C2PAAssertion from './C2PAAssertion';

import C2PALabel from '../enums/c2paLabel.enum';

type AssertionHash = {
  url: string;
  hash: string;
  alg: 'sha256';
};

class C2PAClaimBuilder {
  private assertions: AssertionHash[] = [];

  public readonly signatureUri: string;

  constructor(
    public recorder = 'RecorderAppName',
    manifestIdentifier: string,
  ) {
    this.signatureUri = `self#jumbf=c2pa/${manifestIdentifier}/${C2PALabel.c2paSignature}`;
  }

  public addAssertion(assertion: C2PAAssertion): this {
    this.assertions.push({
      hash: assertion.hash,
      url: assertion.uri,
      alg: assertion.alg,
    });
    return this;
  }

  public build(): Buffer {
    return cbor.encode({
      recorder: this.recorder,
      signature: this.signatureUri,
      assertions: this.assertions,
    });
  }
}

export default C2PAClaimBuilder;

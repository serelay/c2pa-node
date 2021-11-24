/**
  * Copyright © 2021 Serelay Ltd. All rights reserved.
  */


import * as cbor from 'cbor';

import C2PALabel from '../enums/c2paLabel.enum';

import HashingToolkit, { Encoding } from '../../hashing/HashingToolkit';

type SimpleAssertion = Record<string, unknown> | Buffer;

export type AssertionValue = SimpleAssertion | SimpleAssertion[];

class C2PAAssertion<T extends AssertionValue = AssertionValue> {
  public readonly uri: string;

  public readonly value: Buffer;

  public readonly hash: string;

  public readonly alg = 'sha256';

  private readonly id: string;

  constructor(
    name: string,
    value: T | Buffer,
    manifestIdentifier: string,
    hash?: string,
  ) {
    this.value = Buffer.isBuffer(value) ? value : cbor.encode(value);
    this.hash = hash ?? HashingToolkit.sha256Hash(this.value, Encoding.BASE64);
    this.id = name;
    this.uri = `self#jumbf=c2pa/${manifestIdentifier}/${C2PALabel.c2paAssertions}/${this.id}`;
  }

  public get label(): string {
    return this.id;
  }
}

export default C2PAAssertion;

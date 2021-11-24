/**
  * Copyright © 2021 Serelay Ltd. All rights reserved.
  */


import SigningService from './cryptography/SigningService';
import ProvenanceSigningError from '../errors/ProvenanceSigningError';

export interface SigningServiceConfig {
  privateKey: Buffer;
  chain: Buffer[];
}

export default class ProvenanceSigningService {

  public static async sign(
    content: Buffer,
    config: SigningServiceConfig,
  ): Promise<Buffer> {
    try {
      return SigningService.sign(content, {
        privateKey: config.privateKey,
        chain: config.chain,
        algorithm: 'COSE',
      });
    } catch (e) {
      throw new ProvenanceSigningError('Could not create signature', e as any);
    }
  }
}

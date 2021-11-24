/**
  * Copyright © 2021 Serelay Ltd. All rights reserved.
  */


/**
 * @module app/authentication/services/hashing
 */
import { promisify } from 'util';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import exhaustiveSwitchCheck from '../helpers/exhaustiveSwitchCheck';

export enum Encoding {
  HEX = 'hex',
  BASE64 = 'base64',
}

type MultiHashOptions = {
  encoding?: Encoding;
  withMultiBase?: boolean;
};

/**
 * Hashing Toolkit Service.
 */
class HashingToolkit {
  /** Used to decrease speed of hash function to guard against brute force attacks. */
  private static readonly hashingCostFactor = 12;

  /** Default size of a random string generated. */
  private static readonly defaultRandomStringBytesLength = 64;

  private static readonly randomBytes = promisify(crypto.randomBytes);

  /**
   * Returns a hex encoded SHA-256 hash of given text.
   * @param text Plain text to be hashed.
   * @return Hex encoded SHA-256 hash of given text.
   */
  static sha256Hash(text: string | Buffer, encoding = Encoding.HEX): string {
    return crypto
      .createHash('sha256')
      .update(text)
      .digest(encoding);
  }

  // Multihash: https://multiformats.io/multihash/#sha2-256-256-bits-aka-sha256
  // Multibase: https://tools.ietf.org/id/draft-multiformats-multibase-00.html
  static sha256MultiHash(
    text: string | Buffer,
    options?: MultiHashOptions,
  ): string {
    const encoding = options?.encoding ?? Encoding.HEX;
    const withMultiBase = options?.withMultiBase ?? false;
    const hash = HashingToolkit.sha256Hash(text, Encoding.HEX);
    const multihash = Buffer.from(`1220${hash}`, Encoding.HEX).toString(encoding);
    if (withMultiBase) {
      switch (encoding) {
        case Encoding.BASE64:
          return `M${multihash}`;
        case Encoding.HEX:
          return `f${multihash.toLowerCase()}`;
        default:
          exhaustiveSwitchCheck(encoding);
      }
    }
    return multihash;
  }

  /**
   * Hash a secret string using the Bcrypt library.
   * @param secret The secret string to hash.
   * @param cost Hashing cost factor.
   * @return The hashed string.
   */
  static async hashSecret(
    secret: string,
    costFactor = HashingToolkit.hashingCostFactor,
  ): Promise<string> {
    return bcrypt.hash(secret, costFactor);
  }

  /**
   * Check a candidate plain-text secret string against a hashed secret string.
   * @param candidateSecret The candidate string to be checked
   * @param realSecretHash The hashed real secret.
   * @return Result of the check.
   */
  static async checkSecret(candidateSecret: string, realSecretHash: string): Promise<boolean> {
    return bcrypt.compare(candidateSecret, realSecretHash);
  }

  /**
   * Generate a cryptographically secure random string of hex characters.
   * @param length Number of random bytes to generate. Defaults to 64.
   * There are likely to be double the number of characters as bytes.
   * @param encoding Encoding to get the random bytes as - default hex.
   * @return The random string.
   */
  static async randomString(
    length: number = HashingToolkit.defaultRandomStringBytesLength,
    encoding: Encoding = Encoding.HEX,
  ): Promise<string> {
    const bytes = await HashingToolkit.randomBytes(length);
    return bytes.toString(encoding);
  }
}

export default HashingToolkit;

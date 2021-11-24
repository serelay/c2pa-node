/**
  * Copyright © 2021 Serelay Ltd. All rights reserved.
  */


import { expect } from 'chai';
import HashingToolkit, { Encoding } from './HashingToolkit';

// Test fixtures.
const SECRET = 'test-secret';
const HASHED_SECRET_HEX = '9caf06bb4436cdbfa20af9121a626bc1093c4f54b31c0fa937957856135345b6';
const MULTIHASHED_SECRET_HEX = `1220${HASHED_SECRET_HEX}`;
const MULTIBASE_MULTIHASHED_SECRET_HEX = `f1220${HASHED_SECRET_HEX}`;
const MULTIHASHED_SECRET_BASE64 = Buffer.from(MULTIHASHED_SECRET_HEX, 'hex').toString('base64');
const MULTIBASE_MULTIHASHED_SECRET_BASE64 = `M${MULTIHASHED_SECRET_BASE64}`;

// Stored test variables.
let hashedSecretDefaultCostFactor: string;

// Test suite.
describe('Hashing Toolkit', () => {
  describe('sha256Hash()', () => {
    it('returns a sha256 hash string', () => {
      const hash = HashingToolkit.sha256Hash(SECRET);

      expect(hash).to.equal(HASHED_SECRET_HEX);
    });
  });

  describe('sha256MultiHash', () => {
    it('returns a multihash with multibase sha256 in hex', () => {
      const hash = HashingToolkit.sha256MultiHash(SECRET, { withMultiBase: true });

      expect(hash).to.equal(MULTIBASE_MULTIHASHED_SECRET_HEX);
    });

    it('returns a multihash sha256 in hex', () => {
      const hash = HashingToolkit.sha256MultiHash(SECRET);

      expect(hash).to.equal(MULTIHASHED_SECRET_HEX);
    });

    it('returns a multihash with multibase sha256 in base64', () => {
      const hash = HashingToolkit.sha256MultiHash(SECRET, { encoding: Encoding.BASE64, withMultiBase: true });

      expect(hash).to.equal(MULTIBASE_MULTIHASHED_SECRET_BASE64);
    });

    it('returns a multihash sha256 in base64', () => {
      const hash = HashingToolkit.sha256MultiHash(SECRET, { encoding: Encoding.BASE64, withMultiBase: false });

      expect(hash).to.equal(MULTIHASHED_SECRET_BASE64);
    });
  });

  describe('hashSecret()', () => {
    it('returns a hash of a secret string', async () => {
      const hash = await HashingToolkit.hashSecret(SECRET);
      hashedSecretDefaultCostFactor = hash;

      expect(hash).to.not.equal(SECRET);
      expect(hash).to.be.a('string');
    });

    it('returns a hash of a secret with a different cost factor', async () => {
      const hash = await HashingToolkit.hashSecret(SECRET, 5);

      expect(hash).to.not.equal(hashedSecretDefaultCostFactor);
      expect(hash).to.be.a('string');
    });
  });
  describe('checkSecret()', () => {
    it('should successfully approve a valid hash', async () => {
      const isValid = await HashingToolkit.checkSecret(
        SECRET,
        hashedSecretDefaultCostFactor,
      );

      expect(isValid).to.be.true;
    });
    it('should successfully reject an invalid hash', async () => {
      const isValid = await HashingToolkit.checkSecret(
        'nonsense',
        hashedSecretDefaultCostFactor,
      );

      expect(isValid).to.be.false;
    });
  });

  describe('randomString()', () => {
    it('should generate hex encoded random strings of default length', async () => {
      const defaultLength = 64; // result string should be hex encoded

      const string1 = await HashingToolkit.randomString();
      const string2 = await HashingToolkit.randomString();

      expect(string1).to.not.equal(string2);
      expect(string1.length).to.equal(2 * defaultLength);
      expect(string2.length).to.equal(2 * defaultLength);
    });

    it('should generate hex encoded random strings of specified length', async () => {
      const length = 10; // result string should be hex encoded

      const randomeString = await HashingToolkit.randomString(length);

      expect(randomeString.length).to.equal(2 * length);
    });
  });
});

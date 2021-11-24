/**
  * Copyright © 2021 Serelay Ltd. All rights reserved.
  */


import * as fs from 'fs';
import * as path from 'path';
import * as _ from 'lodash';
import { expect } from 'chai';
import c2paWithoutImage from '../src/c2pa/implementations/trustedClient';

describe('Trusted client C2PA', async () => {
  it('returns HTTP200: Created, if a valid request is submitted', async () => {
    const data = await c2paWithoutImage({
      c2paImageMeta: {
        thumbnailAssertionLength: 17000,
        thumbnailHash: 'hash',
        jumbfInsertionPoint: 200,
        xmpInsertionPoint: 3000,
      },
      contentHash: 'cHash',
      companyName: 'test-company-name',
      details: {
        time: new Date().toISOString(),
      },
      signingServiceConfig: {
        privateKey: fs.readFileSync(path.join(__dirname, 'testFixtures/key.pem')),
        chain: [fs.readFileSync(path.join(__dirname, 'testFixtures/certificate.pem'))],
      }
    });

    expect(data).to.have.property('jumbfs').that.is.an('array');
    expect(data).to.have.property('xmp').that.is.a('string');
    expect(data).to.have.property('thumbnailSegments').that.is.an('array');
  });
});

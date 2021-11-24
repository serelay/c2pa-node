/**
  * Copyright © 2021 Serelay Ltd. All rights reserved.
  */


import * as fs from 'fs';
import * as path from 'path';
import * as _ from 'lodash';
import { expect } from 'chai';
import c2paWithImage from '../src/c2pa/implementations/untrustedClient';

process.env.THUMBNAIL_MAX_HEIGHT = process.env.THUMBNAIL_MAX_HEIGHT || '768';
process.env.THUMBNAIL_MAX_WIDTH = process.env.THUMBNAIL_MAX_WIDTH || '1024';

describe('Untrusted client C2PA', async () => {
  const imageBuffer = fs.readFileSync(`${__dirname}/image.jpeg`);

  it('returns HTTP200: Created, if a valid request is submitted', async () => {
    const data = await c2paWithImage({
      file: imageBuffer,
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
  });
});

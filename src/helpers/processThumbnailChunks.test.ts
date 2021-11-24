/**
  * Copyright © 2021 Serelay Ltd. All rights reserved.
  */


import * as fs from 'fs';
import * as path from 'path';

import { expect } from 'chai';
import App11XtSplitter from '../jpegWriting/App11XtSplitter';
import processThumbnailChunks from './processThumbnailChunks';

const fakeHeader1 = Buffer.from('4A500001000000010000010e6a756d62', 'hex');
const fakeHeader2 = Buffer.from('4A500001000000020000010e6a756d62', 'hex');
const fakeHeader3 = Buffer.from('4A500001000000030000010e6a756d62', 'hex');

describe('processThumbnailChunks', () => {
  it('should not modify chunks if thumbnail has zero length', () => {
    const payload = Buffer.from('Hello, world'.repeat(16));
    const buffer = Buffer.concat([
      fakeHeader1,
      payload
    ]);
    const chunks = App11XtSplitter.split(buffer, 32);
    const processedChunks = processThumbnailChunks(chunks, 0, 0);
    expect(processedChunks.thumbnailSegments).to.have.length(0);
    chunks.forEach((chunk, index) => {
      expect(chunk.compare(processedChunks.jumbfChunks[index])).to.eq(0);
    });
  });

  it('should remove thumbnail data and include thumbnail replacement specifications (multiple chunks)', () => {
    const beforeThumbnail = Buffer.from('Hello, world'); // 12 bytes
    const thumbnail = Buffer.from('4A'.repeat(62), 'hex') // splits into 20 bytes, 32 bytes, 10 bytes
    const afterThumbnail = Buffer.from('Hello, world');
    const buffer = Buffer.concat([
      fakeHeader1,
      beforeThumbnail,
      thumbnail,
      afterThumbnail,
    ]);

    const chunks = App11XtSplitter.split(buffer, 32);
    const thumbnailStart = beforeThumbnail.length + fakeHeader1.length;
    const processedChunks = processThumbnailChunks(chunks, thumbnailStart, thumbnail.length);
    expect(processedChunks.thumbnailSegments).to.have.length(3);

    const expectedChunks = [
      Buffer.concat([fakeHeader1, beforeThumbnail]),
      Buffer.from(fakeHeader2),
      Buffer.concat([fakeHeader3, afterThumbnail]),
    ];

    expectedChunks.forEach((chunk, index) => {
      expect(chunk.compare(processedChunks.jumbfChunks[index])).to.eq(0);
    });

    const expectedThumbnailSpec = [
      { index: 0, start: 28, length: 20 },
      { index: 1, start: 16, length: 32 },
      { index: 2, start: 16, length: 10 },
    ];

    expect(processedChunks.thumbnailSegments).to.deep.equal(expectedThumbnailSpec);
  });

  it('should remove thumbnail data and include thumbnail replacement specifications (single chunk)', () => {
    const thumbnailStart = 2377;
    const thumbnailLength = 55019;
    const chunks = [fs.readFileSync(path.resolve(__dirname, 'fixtures/chunk.fixture.bin'))];
    const processedChunks = processThumbnailChunks(chunks, thumbnailStart, thumbnailLength);
    expect(processedChunks.thumbnailSegments).to.have.length(1);

    const expectedChunks = [
      fs.readFileSync(path.resolve(__dirname, 'fixtures/expected.fixture.bin'))
    ];

    expectedChunks.forEach((chunk, index) => {
      expect(chunk.compare(processedChunks.jumbfChunks[index])).to.eq(0);
    });

    const expectedThumbnailSpec = [
      { index: 0, start: thumbnailStart, length: thumbnailLength }
    ];

    expect(processedChunks.thumbnailSegments).to.deep.equal(expectedThumbnailSpec);
  });
});

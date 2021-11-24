/**
  * Copyright © 2021 Serelay Ltd. All rights reserved.
  */


const HEADER_LENGTH_BYTES = 16;

type ThumbnailSegmentInfo = {
  index: number;
  start: number;
  length: number;
};

type JumbfSegments = {
  jumbfChunks: Buffer[];
  thumbnailSegments: ThumbnailSegmentInfo[];
};

export default function processThumbnailChunks(
  chunks: Buffer[],
  thumbnailStart: number,
  thumbnailLength: number,
): JumbfSegments {
  const jumbfChunks: Buffer[] = [];
  const thumbnailSegments: ThumbnailSegmentInfo[] = [];

  // This is indexing the JUMBF _before_ chunking
  let nakedBufferIndex = HEADER_LENGTH_BYTES;
  chunks.forEach((chunk, index) => {
    const header = chunk.subarray(0, HEADER_LENGTH_BYTES);
    const payload = chunk.subarray(HEADER_LENGTH_BYTES);

    const isAllBefore = nakedBufferIndex + payload.length < thumbnailStart;
    const isAllAfter = nakedBufferIndex >= thumbnailStart + thumbnailLength;
    const isAllThumbnail = (nakedBufferIndex >= thumbnailStart)
      && (nakedBufferIndex + payload.length < thumbnailStart + thumbnailLength);

    const isEntirelyWithinThisChunk = (thumbnailStart >= nakedBufferIndex)
      && (thumbnailStart + thumbnailLength < nakedBufferIndex + payload.length);

    if (isAllBefore || isAllAfter) { // nothing to do
      jumbfChunks.push(chunk);
    } else if (isAllThumbnail) { // simple case
      jumbfChunks.push(header);
      thumbnailSegments.push({
        index,
        length: payload.length,
        start: HEADER_LENGTH_BYTES,
      });
    } else if (isEntirelyWithinThisChunk) {
      const start = HEADER_LENGTH_BYTES + thumbnailStart - nakedBufferIndex;
      thumbnailSegments.push({
        index,
        start,
        length: thumbnailLength,
      });
      jumbfChunks.push(Buffer.concat([
        chunk.subarray(0, start),
        chunk.subarray(start + thumbnailLength),
      ]));
    } else if (nakedBufferIndex <= thumbnailStart) { // thumbnail starts in this chunk
      const start = HEADER_LENGTH_BYTES + thumbnailStart - nakedBufferIndex;
      const length = chunk.length - start;
      thumbnailSegments.push({
        index,
        length,
        start,
      });
      jumbfChunks.push(chunk.subarray(0, start));
    } else { // thumbnail ends in this chunk
      const length = thumbnailStart + thumbnailLength - nakedBufferIndex;
      thumbnailSegments.push({
        index,
        length,
        start: HEADER_LENGTH_BYTES,
      });
      jumbfChunks.push(Buffer.concat([
        header,
        chunk.subarray(HEADER_LENGTH_BYTES + length),
      ]));
    }
    nakedBufferIndex += payload.length;
  });

  return {
    jumbfChunks,
    thumbnailSegments,
  };
}

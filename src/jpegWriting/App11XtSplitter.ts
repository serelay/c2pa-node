/**
  * Copyright © 2021 Serelay Ltd. All rights reserved.
  */


const MAX_APPN_SIZE = 2 ** 16 - 1;
const XT_HEADER_LENGTH = 20;
const MAX_XT_CHUNK_SIZE = MAX_APPN_SIZE - XT_HEADER_LENGTH;

export default class App11XtSplitter {
  static split(buf: Buffer, chunkLength = MAX_XT_CHUNK_SIZE): Buffer[] {
    const safeChunkLength = chunkLength < MAX_XT_CHUNK_SIZE ? chunkLength : MAX_XT_CHUNK_SIZE;

    const chunks: Buffer[] = [];
    if (buf.length > safeChunkLength) {
      const commonIdAndBoxInstance = buf.subarray(0, 4); // e.g. 4a500001 for JUMBF
      const lBox = buf.subarray(8, 16);
      const xtHeaderLength = 16;
      const payload = buf.subarray(xtHeaderLength);
      const chunkCount = Math.ceil(payload.length / safeChunkLength);
      for (let i = 0; i < chunkCount; i += 1) {
        const start = i * safeChunkLength;
        const end = start + safeChunkLength;
        const packetSequence = Buffer.from((i + 1).toString(16).padStart(8, '0'), 'hex');
        chunks.push(
          Buffer.concat([
            commonIdAndBoxInstance,
            packetSequence,
            lBox,
            payload.subarray(start, end),
          ]),
        );
      }
    } else {
      chunks.push(buf);
    }
    return chunks;
  }
}

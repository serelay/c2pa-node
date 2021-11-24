/**
  * Copyright © 2021 Serelay Ltd. All rights reserved.
  */


import * as _ from 'lodash';
import * as util from 'util';
import { ExifImage, ExifData } from 'exif';

import JpegSegmentMarker from '../jpeg/JpegSegmentMarker';
import { Nullable } from '../helpers/Nullable';
import JpegSegmentMarkerInfo, { jpegHexMarkerLength } from '../jpeg/JpegSegmentMarkerInfo';
import JpegParsingError from '../errors/JpegParsingError';

type SegmentLocation = {
  tag: JpegSegmentMarker;
  startIndex: number;
  endIndex: number;
};

class JpegDataParser {
  private hex: string;

  private segmentLocations: SegmentLocation[] = [];

  private static HEADER_LENGTH_HEX = 8;

  private constructor(jpg: Buffer) {
    this.hex = jpg.toString('hex');
  }

  public static create(jpg: Buffer): JpegDataParser {
    const parser = new JpegDataParser(jpg);
    parser.parse();
    return parser;
  }

  public async getExifData(): Promise<Nullable<ExifData>> {
    const exif = new ExifImage();
    const readExif = util.promisify(exif.loadImage.bind(exif));
    try {
      return await readExif(Buffer.from(this.hex, 'hex'));
    } catch (e) {
      // no problem - just no exif
      return null;
    }
  }

  /**
   * Get base64 representation of quantisation tables
   */
  public getQuantisationTables(): string[] {
    return this.segmentLocations
      .filter((segment) => segment.tag === JpegSegmentMarker.DQT)
      .map((segment) => {
        const data = this.hex.substring(segment.startIndex + JpegDataParser.HEADER_LENGTH_HEX, segment.endIndex + 1);
        return Buffer.from(data, 'hex').toString('base64');
      });
  }

  private parse(): void {
    let position = 0;

    if (this.hex.substr(0, jpegHexMarkerLength) !== JpegSegmentMarkerInfo.SOI.hex) {
      throw new JpegParsingError('File does not start with SOI');
    }

    while (position < this.hex.length) {
      let hasMatch = false;
      const currentMarker = this.hex.substr(position, jpegHexMarkerLength);

      // It's possible to do this functionally without the unsafe access to `position`, however
      // that makes the intent less clear to those not familiar with FP. For that reason the
      // rule is disabled here.
      //
      // In a nutshell what we're doing here is iterating through each of the possible tags
      // to see if we have a match. If we do, we skip over the appropriate number of bytes. Since
      // we're working in hex, 2 bytes is 4 chars.
      // If there is no marker payload (e.g. SOI) we skip 2 bytes (the size of the marker)
      // If there is a fixed payload (e.g. DRI) we skip 2 bytes + payload bytes
      // If there's a variable payload (e.g. APPn) we skip 2 bytes + prescribed payload size
      // (note here that the payload size descriptor _includes_ itself - i.e. 2 + actual payload size)
      //
      // eslint-disable-next-line no-loop-func
      _.forEach(JpegSegmentMarkerInfo, (marker, key: unknown): boolean => {
        // `key` is actually JpegSegmentMarker, but lodash typings can not infer this
        const tag = key as JpegSegmentMarker;

        if (currentMarker === marker.hex) {
          let skip = 0;
          hasMatch = true;
          switch (marker.type) {
            case 'simple':
              skip = marker.hex.length;
              break;
            case 'variableLength':
              skip += jpegHexMarkerLength + parseInt(this.hex.substr(position + jpegHexMarkerLength, 4), 16) * 2;
              break;
            default:
              break;
          }
          let endIndex;
          const startIndex = position;
          if (tag === JpegSegmentMarker.SOS) {
            endIndex = this.hex.length - jpegHexMarkerLength;
            position = this.hex.length;
          } else {
            endIndex = position + skip - 1;
            position += skip;
          }

          const segment = {
            tag,
            endIndex,
            startIndex,
          };

          this.segmentLocations.push(segment);

          // exit the foreach
          return false;
        }

        // otherwise continue to the next tag
        return true;
      });

      if (!hasMatch) {
        throw new JpegParsingError(`Unknown segment: 0x${currentMarker}`);
      }
    }
    this.segmentLocations.push({
      tag: JpegSegmentMarker.EOI,
      startIndex: this.hex.length - jpegHexMarkerLength + 1,
      endIndex: this.hex.length - 1,
    });
  }

  public getHeaderMarkers(): JpegSegmentMarker[] {
    return this.segmentLocations.map((segment) => segment.tag);
  }

  public getHeaderData(): string {
    const sos = this.segmentLocations.find((tag) => tag.tag === JpegSegmentMarker.SOS);
    if (!sos) throw new JpegParsingError('JPG does not contain an SOS tag');
    const data = this.hex.substr(0, sos.startIndex + JpegSegmentMarkerInfo.SOS.hex.length);
    return Buffer.from(data, 'hex').toString('base64');
  }

  private isExifSegment(segment: SegmentLocation): boolean {
    if (segment.tag === JpegSegmentMarker.APP1) {
      const lengthMarkerSize = 4;
      const offset = JpegSegmentMarkerInfo.APP1.hex.length + lengthMarkerSize;
      const hex = this.hex.substring(segment.startIndex + offset, segment.endIndex - offset + 1);
      return hex.startsWith(Buffer.from('Exif').toString('hex'));
    }
    return false;
  }

  public getDataWithoutXmp(): Buffer {
    const segments = this.segmentLocations
      .map((segment) => this.hex.substring(segment.startIndex, segment.endIndex + 1));
    return Buffer.from(segments.join(''), 'hex');
  }

  public getDataWithoutJumbf(): Buffer {
    const segments = this.segmentLocations
      .map((segment) => this.hex.substring(segment.startIndex, segment.endIndex + 1));
    return Buffer.from(segments.join(''), 'hex');
  }

  public getSosToEndOfFile(): { content: Buffer; startPositionBytes: number; lengthInBytes: number; } {
    const sos = this.segmentLocations.find((segment) => segment.tag === JpegSegmentMarker.SOS);
    if (!sos) throw new JpegParsingError('JPG does not contain an SOS tag');
    const content = Buffer.from(this.hex.substring(sos.startIndex), 'hex');
    return {
      content,
      lengthInBytes: content.length,
      startPositionBytes: sos.startIndex / 2, // this is the byte location - half of the location in hex
    };
  }

  public getExifSegment(): Nullable<{ content: Buffer; startPositionBytes: number; lengthInBytes: number; }> {
    const app1 = this.segmentLocations.find((segment) => this.isExifSegment(segment));
    if (!app1) {
      return null;
    }
    const content = Buffer.from(this.hex.substring(app1.startIndex, app1.endIndex + 1), 'hex');
    return {
      content,
      lengthInBytes: content.length,
      startPositionBytes: app1.startIndex / 2, // this is the byte location - half of the location in hex
    };
  }
}

export default JpegDataParser;

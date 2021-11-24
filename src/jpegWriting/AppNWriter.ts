/**
  * Copyright © 2021 Serelay Ltd. All rights reserved.
  */


import JpegSegmentMarker from '../jpeg/JpegSegmentMarker';
import JpegSegmentMarkerInfo from '../jpeg/JpegSegmentMarkerInfo';

type AppNMarker = JpegSegmentMarker.APP0
| JpegSegmentMarker.APP1
| JpegSegmentMarker.APP2
| JpegSegmentMarker.APP3
| JpegSegmentMarker.APP4
| JpegSegmentMarker.APP5
| JpegSegmentMarker.APP6
| JpegSegmentMarker.APP7
| JpegSegmentMarker.APP8
| JpegSegmentMarker.APP9
| JpegSegmentMarker.APP10
| JpegSegmentMarker.APP11
| JpegSegmentMarker.APP12
| JpegSegmentMarker.APP13
| JpegSegmentMarker.APP14
| JpegSegmentMarker.APP15;

export type AppNSegmentSpec = {
  content: Buffer;
  marker: AppNMarker;
};

class AppNWriter {
  public static getInsertionPoint(image: Buffer, segment: AppNMarker): number {
    const content = image.toString('hex');
    let position = 4; // Skip over 0xFFD8 SOI marker
    const markerLength = 4; // A marker is 4 hex chars
    const segmentContentLength = 4; // Content length is encoded in 4 hex chars

    let currentScannedMarker = content.substr(position, markerLength);

    const markerHex = JpegSegmentMarkerInfo[segment].hex;
    while (
      currentScannedMarker < markerHex
      && currentScannedMarker >= JpegSegmentMarkerInfo[JpegSegmentMarker.APP0].hex
      && currentScannedMarker <= JpegSegmentMarkerInfo[JpegSegmentMarker.APP15].hex
    ) { // string comparison. All APPn markers are 4 chars
      const lengthStart = position + markerLength;
      const segmentLengthBytes = parseInt(content.substr(lengthStart, segmentContentLength), 16);
      const segmentLengthHex = segmentLengthBytes * 2;
      position = position + segmentLengthHex + markerLength;
      currentScannedMarker = content.substr(position, markerLength);
    }
    return position;
  }

  /**
   * Inserts specified APPn segments into a JPG in ascending order. If there is an
   * existing segment in the jpg, the specified segment will be inserted _before_ it.
   *
   * For example, if an image contains Exif (APP1), and we wish to add XMP (also APP1),
   * this method will insert the XMP before the Exif.
   */
  public static insertSegments(image: Buffer, segments: AppNSegmentSpec[]): Buffer {
    if (segments.length === 0) return image;

    const content = image.toString('hex');

    const sortedSegments = [...segments].sort((a, b) => {
      const aMarker = JpegSegmentMarkerInfo[a.marker].hex;
      const bMarker = JpegSegmentMarkerInfo[b.marker].hex;
      return aMarker.localeCompare(bMarker);
    });

    let position = 4; // Skip over 0xFFD8 SOI marker
    const markerLength = 4; // A marker is 4 hex chars
    const segmentContentLength = 4; // Content length is encoded in 4 hex chars

    let updatedContent = content.substr(0, position);

    let currentScannedMarker = content.substr(position, markerLength);

    sortedSegments.forEach((segment) => {
      const markerHex = JpegSegmentMarkerInfo[segment.marker].hex;
      while (
        currentScannedMarker < markerHex
        && currentScannedMarker >= JpegSegmentMarkerInfo[JpegSegmentMarker.APP0].hex
        && currentScannedMarker <= JpegSegmentMarkerInfo[JpegSegmentMarker.APP15].hex
      ) { // string comparison. All APPn markers are 4 chars
        const lengthStart = position + markerLength;
        const segmentLengthBytes = parseInt(content.substr(lengthStart, segmentContentLength), 16);
        const segmentLengthHex = segmentLengthBytes * 2;
        updatedContent += content.substr(position, markerLength + segmentLengthHex);
        position = position + segmentLengthHex + markerLength;
        currentScannedMarker = content.substr(position, markerLength);
      }
      const contentHex = segment.content.toString('hex');
      const contentLength = segment.content.length + 2;
      const paddedContentLength = contentLength.toString(16).padStart(4, '0');
      updatedContent += `${markerHex}${paddedContentLength}${contentHex}`;
    });
    const end = content.substr(position);
    return Buffer.from(`${updatedContent}${end}`, 'hex');
  }
}

export default AppNWriter;

/**
  * Copyright © 2021 Serelay Ltd. All rights reserved.
  */


import JpegSegmentMarker from './JpegSegmentMarker';

type SimpleMarker = {
  hex: string;
  type: 'simple';
};

type VariableLengthMarker = {
  hex: string;
  type: 'variableLength';
};

type Marker = SimpleMarker | VariableLengthMarker;

export const jpegHexMarkerLength = 4;

const JpegSegmentMarkerInfo: Record<JpegSegmentMarker, Marker> = {
  [JpegSegmentMarker.APP0]: {
    hex: 'ffe0',
    type: 'variableLength',
  },
  [JpegSegmentMarker.APP1]: {
    hex: 'ffe1',
    type: 'variableLength',
  },
  [JpegSegmentMarker.APP2]: {
    hex: 'ffe2',
    type: 'variableLength',
  },
  [JpegSegmentMarker.APP3]: {
    hex: 'ffe3',
    type: 'variableLength',
  },
  [JpegSegmentMarker.APP4]: {
    hex: 'ffe4',
    type: 'variableLength',
  },
  [JpegSegmentMarker.APP5]: {
    hex: 'ffe5',
    type: 'variableLength',
  },
  [JpegSegmentMarker.APP6]: {
    hex: 'ffe6',
    type: 'variableLength',
  },
  [JpegSegmentMarker.APP7]: {
    hex: 'ffe7',
    type: 'variableLength',
  },
  [JpegSegmentMarker.APP8]: {
    hex: 'ffe8',
    type: 'variableLength',
  },
  [JpegSegmentMarker.APP9]: {
    hex: 'ffe9',
    type: 'variableLength',
  },
  [JpegSegmentMarker.APP10]: {
    hex: 'ffea',
    type: 'variableLength',
  },
  [JpegSegmentMarker.APP11]: {
    hex: 'ffeb',
    type: 'variableLength',
  },
  [JpegSegmentMarker.APP12]: {
    hex: 'ffec',
    type: 'variableLength',
  },
  [JpegSegmentMarker.APP13]: {
    hex: 'ffed',
    type: 'variableLength',
  },
  [JpegSegmentMarker.APP14]: {
    hex: 'ffee',
    type: 'variableLength',
  },
  [JpegSegmentMarker.APP15]: {
    hex: 'ffef',
    type: 'variableLength',
  },
  [JpegSegmentMarker.COM]: {
    hex: 'fffe',
    type: 'variableLength',
  },
  [JpegSegmentMarker.DAC]: {
    hex: 'ffcc',
    type: 'variableLength',
  },
  [JpegSegmentMarker.DHT]: {
    hex: 'ffc4',
    type: 'variableLength',
  },
  [JpegSegmentMarker.DHP]: {
    hex: 'ffde',
    type: 'variableLength',
  },
  [JpegSegmentMarker.DNL]: {
    hex: 'ffdc',
    type: 'variableLength',
  },
  [JpegSegmentMarker.DQT]: {
    hex: 'ffdb',
    type: 'variableLength',
  },
  [JpegSegmentMarker.DRI]: {
    hex: 'ffdd',
    type: 'variableLength',
  },
  [JpegSegmentMarker.EOI]: {
    hex: 'ffd9',
    type: 'simple',
  },
  [JpegSegmentMarker.EXP]: {
    hex: 'ffdf',
    type: 'variableLength',
  },
  [JpegSegmentMarker.JPG]: {
    hex: 'ffc8',
    type: 'variableLength',
  },
  [JpegSegmentMarker.JPG0]: {
    hex: 'fff0',
    type: 'variableLength',
  },
  [JpegSegmentMarker.JPG1]: {
    hex: 'fff1',
    type: 'variableLength',
  },
  [JpegSegmentMarker.JPG2]: {
    hex: 'fff2',
    type: 'variableLength',
  },
  [JpegSegmentMarker.JPG3]: {
    hex: 'fff3',
    type: 'variableLength',
  },
  [JpegSegmentMarker.JPG4]: {
    hex: 'fff4',
    type: 'variableLength',
  },
  [JpegSegmentMarker.JPG5]: {
    hex: 'fff5',
    type: 'variableLength',
  },
  [JpegSegmentMarker.JPG6]: {
    hex: 'fff6',
    type: 'variableLength',
  },
  [JpegSegmentMarker.JPG7]: {
    hex: 'fff7',
    type: 'variableLength',
  },
  [JpegSegmentMarker.JPG8]: {
    hex: 'fff8',
    type: 'variableLength',
  },
  [JpegSegmentMarker.JPG9]: {
    hex: 'fff9',
    type: 'variableLength',
  },
  [JpegSegmentMarker.JPG10]: {
    hex: 'fffa',
    type: 'variableLength',
  },
  [JpegSegmentMarker.JPG11]: {
    hex: 'fffb',
    type: 'variableLength',
  },
  [JpegSegmentMarker.JPG12]: {
    hex: 'fffc',
    type: 'variableLength',
  },
  [JpegSegmentMarker.JPG13]: {
    hex: 'fffd',
    type: 'variableLength',
  },
  [JpegSegmentMarker.RST0]: {
    hex: 'ffd0',
    type: 'simple',
  },
  [JpegSegmentMarker.RST1]: {
    hex: 'ffd1',
    type: 'simple',
  },
  [JpegSegmentMarker.RST2]: {
    hex: 'ffd2',
    type: 'simple',
  },
  [JpegSegmentMarker.RST3]: {
    hex: 'ffd3',
    type: 'simple',
  },
  [JpegSegmentMarker.RST4]: {
    hex: 'ffd4',
    type: 'simple',
  },
  [JpegSegmentMarker.RST5]: {
    hex: 'ffd5',
    type: 'simple',
  },
  [JpegSegmentMarker.RST6]: {
    hex: 'ffd6',
    type: 'simple',
  },
  [JpegSegmentMarker.RST7]: {
    hex: 'ffd7',
    type: 'simple',
  },
  [JpegSegmentMarker.SOF0]: {
    hex: 'ffc0',
    type: 'variableLength',
  },
  [JpegSegmentMarker.SOF1]: {
    hex: 'ffc1',
    type: 'variableLength',
  },
  [JpegSegmentMarker.SOF2]: {
    hex: 'ffc2',
    type: 'variableLength',
  },
  [JpegSegmentMarker.SOF3]: {
    hex: 'ffc3',
    type: 'variableLength',
  },
  // 0xffc4 is DHT which is is in place of SOF4
  [JpegSegmentMarker.SOF5]: {
    hex: 'ffc5',
    type: 'variableLength',
  },
  [JpegSegmentMarker.SOF6]: {
    hex: 'ffc6',
    type: 'variableLength',
  },
  [JpegSegmentMarker.SOF7]: {
    hex: 'ffc7',
    type: 'variableLength',
  },
  // 0xffc8 is JPG which is in place of SOF8
  [JpegSegmentMarker.SOF9]: {
    hex: 'ffc9',
    type: 'variableLength',
  },
  [JpegSegmentMarker.SOF10]: {
    hex: 'ffca',
    type: 'variableLength',
  },
  [JpegSegmentMarker.SOF11]: {
    hex: 'ffcb',
    type: 'variableLength',
  },
  // 0xffcc is DAC which is in place of SOF12
  [JpegSegmentMarker.SOF13]: {
    hex: 'ffcd',
    type: 'variableLength',
  },
  [JpegSegmentMarker.SOF14]: {
    hex: 'ffce',
    type: 'variableLength',
  },
  [JpegSegmentMarker.SOF15]: {
    hex: 'ffcf',
    type: 'variableLength',
  },
  [JpegSegmentMarker.SOI]: {
    hex: 'ffd8',
    type: 'simple',
  },
  [JpegSegmentMarker.SOS]: {
    hex: 'ffda',
    type: 'variableLength',
  },
};

export default JpegSegmentMarkerInfo;

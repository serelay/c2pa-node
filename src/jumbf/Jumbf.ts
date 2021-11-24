/**
  * Copyright © 2021 Serelay Ltd. All rights reserved.
  */


import * as _ from 'lodash';
import JumbfBoxes from './enums/jumbfBoxes.enum';
import JumbfContentDescription from './interfaces/jumbfContentDescription.interface';
import JumbfTemplate from './interfaces/jumbfTemplate.interface';

export default class Jumbf {
  static createByTemplate(template: JumbfTemplate[], includeXtHeader = true): Buffer {
    const head = includeXtHeader ? Buffer.from('4A50000100000001', 'hex') : Buffer.from('', 'hex');

    return template.reduce((acc, next) => {
      let content: Buffer;
      if ('content' in next) {
        content = Buffer.isBuffer(next.content) ? next.content : Buffer.from(next.content);
      } else {
        content = Jumbf.createByTemplate(next.boxes, false);
      }
      const box = Jumbf.create(
        {
          type: next.type,
          requestable: true,
          label: next.label,
        },
        _.get(next, 'boxType', null),
        content,
      );
      return Buffer.concat([acc, box]);
    }, head);
  }

  static create(
    description: JumbfContentDescription,
    contentBoxType: JumbfBoxes,
    content: Buffer,
  ): Buffer {
    const superbox = Buffer.from(JumbfBoxes.jumb, 'hex');
    const descriptionBox = Jumbf.createDescriptionBox(description);
    const contentBox = Jumbf.createContentBox(contentBoxType, content);
    const size = 4 + superbox.length + descriptionBox.length + contentBox.length;

    return Buffer.concat([
      Jumbf.computeBoxSize(size, superbox),
      descriptionBox,
      contentBox,
    ]);
  }

  static createDescriptionBox(content: JumbfContentDescription): Buffer {
    const boxType = Buffer.from(JumbfBoxes.jumd, 'hex');
    const toggles = Jumbf.createDescriptionToggles(content);
    const uuid = Buffer.from(content.type, 'hex');
    let label = Buffer.from('');
    if (content.label) {
      label = Buffer.concat([Buffer.from(content.label), Buffer.from('00', 'hex')]);
    }
    let signature = Buffer.from('');
    if (content.signature) {
      signature = Buffer.concat([Buffer.from(content.signature), Buffer.from('00', 'hex')]);
    }
    let id = Buffer.from('');
    if (content.id) {
      id = Buffer.concat([Buffer.from(content.id), Buffer.from('00', 'hex')]);
    }

    const size = 4 + boxType.length + uuid.length
      + toggles.length + label.length + id.length + signature.length;

    return Buffer.concat([
      Jumbf.computeBoxSize(size, boxType),
      uuid,
      toggles,
      label,
      id,
      signature,
    ]);
  }

  static createDescriptionToggles(content: Omit<JumbfContentDescription, 'type'>): Buffer {
    if (content.requestable && !content.label) {
      throw Error('If JUMBF is requestable it MUST include a label.');
    }

    const binaryArray = [
      '0000', // reserved for future use
      content.signature ? '1' : '0',
      content.id ? '1' : '0',
      content.label ? '1' : '0',
      content.requestable ? '1' : '0',
    ];

    let hex = parseInt(binaryArray.join(''), 2).toString(16);
    hex = hex.padStart(2, '0');
    return Buffer.from(hex, 'hex');
  }

  static createContentBox(type: JumbfBoxes | null, data: Buffer): Buffer {
    if (!type) return data;
    const boxType = Buffer.from(type, 'hex');
    const size = 4 + boxType.length + data.length;

    return Buffer.concat([
      Jumbf.computeBoxSize(size, boxType),
      data,
    ]);
  }

  static computeBoxSize(size: number, type: Buffer): Buffer {
    const MAX_SMALLBOX_SIZE = 2 ** 32 - 1;

    if (size <= MAX_SMALLBOX_SIZE) {
      return Buffer.concat([
        Buffer.from(size.toString(16).padStart(8, '0'), 'hex'),
        type,
      ]);
    }

    const xlBoxByteLength = 8;
    return Buffer.concat([
      Buffer.from('00000001', 'hex'),
      type,
      Buffer.from((size + xlBoxByteLength).toString(16).padStart(16, '0'), 'hex'),
    ]);
  }
}

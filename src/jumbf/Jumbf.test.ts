/**
  * Copyright © 2021 Serelay Ltd. All rights reserved.
  */


import * as chai from 'chai';
import Jumbf from './Jumbf';
import JumbfBoxes from './enums/jumbfBoxes.enum';
import JumbfContentType from './enums/jumbfContentType.enum';
import JumbfContentDescription from './interfaces/jumbfContentDescription.interface';
import JumbfTemplate from './interfaces/jumbfTemplate.interface';

const { expect } = chai;

describe('JUMBF service', () => {
  it('should exist', () => {
    expect(Jumbf).to.exist;
  });

  it('should have a static "createByTemplate()" method', () => {
    expect(Jumbf).to.have.property('createByTemplate');
  });

  it('should have a static "create()" method', () => {
    expect(Jumbf).to.have.property('create');
  });

  it('should have a static "createDescriptionBox()" method', () => {
    expect(Jumbf).to.have.property('createDescriptionBox');
  });

  it('should have a static "createDescriptionToggles()" method', () => {
    expect(Jumbf).to.have.property('createDescriptionToggles');
  });

  it('should have a static "createContentBox()" method', () => {
    expect(Jumbf).to.have.property('createContentBox');
  });

  it('should have a static "computeBoxSize()" method', () => {
    expect(Jumbf).to.have.property('computeBoxSize');
  });

  describe('Jumbf.createByTemplate()', () => {
    it('should return expected output buffer', () => {
      const template: JumbfTemplate[] = [{
        "type": "6361636200110010800000AA00389B71",
        "label": "cai",
        "boxes": [{
          "type": "6361737400110010800000AA00389B71",
          "label": "cb.serelay_1",
          "boxes": [{
            "type": "6361617300110010800000AA00389B71",
            "label": "cai.assertions",
            "boxType": JumbfBoxes.json,
            "content": JSON.stringify({
              "cai.claim.date?hl=1337abc": {
                  "date": "2020-09-29T12:00:00Z"
              }
            })
          }, {
            "type": "6361636C00110010800000AA00389B71",
            "label": "cai.claim",
            "boxType": JumbfBoxes.json,
            "content": JSON.stringify({
              "json": "someJson"
            })
          }]
        }]
      }];

      const out = Jumbf.createByTemplate(template);
      const expected = Buffer.from(
        `4A500001000000010000010e6a756d620000001d6a756d646361636200110010800000aa00389b710363616900000000e96a756d62000000266a756d646361737400110010800000aa00389b710363622e736572656c61795f3100000000756a756d62000000286a756d646361617300110010800000aa00389b71036361692e617373657274696f6e7300000000456a736f6e7b226361692e636c61696d2e646174653f686c3d31333337616263223a7b2264617465223a22323032302d30392d32395431323a30303a30305a227d7d000000466a756d62000000236a756d646361636c00110010800000aa00389b71036361692e636c61696d000000001b6a736f6e7b226a736f6e223a22736f6d654a736f6e227d`,
        'hex',
      );
      expect(Buffer.isBuffer(out)).to.be.true;
      expect(Buffer.compare(out, expected)).to.eq(0);
    });
  });

  describe('Jumbf.create()', () => {
    it('should return a buffer', () => {
      const jumbf = Jumbf.create(
        {
          type: JumbfContentType.JSON,
          requestable: false,
        },
        JumbfBoxes.json,
        Buffer.from(''),
      );
      expect(Buffer.isBuffer(jumbf)).to.be.true;
    });


    describe('JUMBF buffer', () => {
      it('must contain "jumb" superbox', () => {
        const jumbf = Jumbf.create(
          {
            type: JumbfContentType.JSON,
            requestable: false,
          },
          JumbfBoxes.json,
          Buffer.from(''),
        );
        const superbox = Buffer.from(JumbfBoxes.jumb, 'hex');
        expect(jumbf.includes(superbox)).to.be.true;
      });

      it('must contain "jumd" box', () => {
        const jumbf = Jumbf.create(
          {
            type: JumbfContentType.JSON,
            requestable: false,
          },
          JumbfBoxes.json,
          Buffer.from(''),
        );
        const descBox = Buffer.from(JumbfBoxes.jumd, 'hex');
        expect(jumbf.includes(descBox)).to.be.true;
      });

      it('must return expected output for provided input', () => {
        const expected = Buffer.from(
          '0000005D6A756D620000002C6A756D646A736F6E00110010800000AA00389B71036361692E6C6F636174696F6E2E62726F616400000000296A736F6E7B20226C6F636174696F6E223A20224D61726761746520436974792C204E4A227D',
          'hex',
        );

        const jumbf = Jumbf.create(
          {
            type: JumbfContentType.JSON,
            requestable: true,
            label: 'cai.location.broad',
          },
          JumbfBoxes.json,
          Buffer.from('{ "location": "Margate City, NJ"}'),
        );

        expect(Buffer.compare(jumbf, expected)).to.eq(0);
      });
    });
  });

  describe('Jumbf.createDescriptionBox()', () => {
    it('should return a buffer', () => {
      const out = Jumbf.createDescriptionBox({
        type: JumbfContentType.JSON,
        requestable: false,
      });
      expect(Buffer.isBuffer(out)).to.be.true;
    });

    it('must contain "jumd" box type', () => {
      const jumd = Jumbf.createDescriptionBox({
        type: JumbfContentType.JSON,
        requestable: true,
        label: '123',
      });
      const descBox = Buffer.from(JumbfBoxes.jumd, 'hex');
      expect(jumd.includes(descBox)).to.be.true;
    });

    it('must correctly build the box for supplied JSON meta', () => {
      const label = 'sample-label';
      const jumd = Jumbf.createDescriptionBox({
        type: JumbfContentType.JSON,
        requestable: true,
        label,
      });
      const descBox = Buffer.from(JumbfBoxes.jumd, 'hex');
      expect(jumd).to.have.lengthOf(
        // box size + box type + uuid + toggles + label + null byte
        4 + 4 + 16 + 1 + label.length + 1
      );
      expect(jumd.includes(descBox)).to.be.true;
      expect(jumd.includes(Buffer.from(JumbfContentType.JSON, 'hex'))).to.be.true;
      expect(jumd.includes(Buffer.from(label))).to.be.true;
    });
  });

  describe('Jumbf.createDescriptionToggles()', () => {
    it('should return a 1-byte buffer', () => {
      const out = Jumbf.createDescriptionToggles({
        requestable: false,
      });
      expect(Buffer.isBuffer(out)).to.be.true;
      expect(out).to.have.lengthOf(1);
    });

    it('should return correct byte for common inputs', () => {
      const input: Record<string, Omit<JumbfContentDescription, 'type'>> = {
        '03': { requestable: true, label: '1' },
        '00': { requestable: false },
        '02': { requestable: false, label: '1' },
        '04': { requestable: false, id: '1'},
        '0b': { requestable: true, signature: '1', label: '1' },
      };

      Object.entries(input).forEach(([out, inp]) => {
        const output = Jumbf.createDescriptionToggles(inp);
        const expectedOutput = Buffer.from(out, 'hex');
        expect(Buffer.compare(output, expectedOutput)).to.eq(0);
      });
    });

    it('should throw if requestable = true, but no label is provided', () => {
      const f = () => Jumbf.createDescriptionToggles({ requestable: true });
      expect(f).to.throw;
    });
  });

  describe('Jumbf.createContentBox()', () => {
    it('should return a buffer', () => {
      const out = Jumbf.createContentBox(JumbfBoxes.json, Buffer.from(''));
      expect(Buffer.isBuffer(out)).to.be.true;
    });

    it('must contain "json" content box type', () => {
      const out = Jumbf.createContentBox(JumbfBoxes.json, Buffer.from(''));
      const content = Buffer.from(JumbfBoxes.json, 'hex');
      expect(out.includes(content)).to.be.true;
    });

    it('returns a buffer of correct length and with correct size bytes', () => {
      const content = Buffer.from('123');
      const out = Jumbf.createContentBox(JumbfBoxes.json, content);
      // box size, box content type + content length;
      const size = 4 + 4 + content.length;
      expect(out).to.have.lengthOf(size);

      const hexSize = out.slice(0, 4).toString('hex').padStart(8, '0');
      expect(hexSize).to.eq(size.toString(16).padStart(8, '0'));
    });
  });

  describe('Jumbf.computeBoxSize()', () => {
    it('returns expected buffer for LBox size', () => {
      const type = Buffer.from('test');
      const size = Jumbf.computeBoxSize(2**16 - 1, type);
      const expected = Buffer.from('0000ffff74657374', 'hex');

      expect(Buffer.compare(size, expected)).to.eq(0);
    });

    it('returns expected buffer for XLBox size', () => {
      const type = Buffer.from('test');
      const size = Jumbf.computeBoxSize(2**32, type);
      const expected = Buffer.from('00000001746573740000000100000008', 'hex');

      expect(Buffer.compare(size, expected)).to.eq(0);
    });
  });
});

/**
  * Copyright © 2021 Serelay Ltd. All rights reserved.
  */


import { expect } from 'chai';

import XmpBuilder from './XmpBuilder';

describe('XmpBuilder', () => {
  describe('build', () => {
    it('should build expected XMP document', () => {
      const namespaces = [
        { xmlns: 'test', url: 'http://www.example.com' },
      ];
      const values = [
        { key: 'test:hello', value: 'hi' },
      ];
      const xmp = XmpBuilder.build(namespaces, values);

      expect(xmp).to.equal('http://ns.adobe.com/xap/1.0/ <?xpacket begin=\'\' id=\'W5M0MpCehiHzreSzNTczkc9d\'?><?xml version="1.0"?><x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="Adobe XMP Core 5.1.0-jc003"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description rdf:about="" xmlns:test="http://www.example.com" test:hello="hi"/></rdf:RDF></x:xmpmeta><?xpacket end=\'r\'?>')
    });
  });
})

/**
  * Copyright © 2021 Serelay Ltd. All rights reserved.
  */


import { create } from 'xmlbuilder';

export default class XmpBuilder {
  public static build(namespaces: {xmlns: string; url: string}[], values: { key: string; value: string}[]): string {
    const xmpXml = create('x:xmpmeta')
      .att('xmlns:x', 'adobe:ns:meta/')
      .att('x:xmptk', 'Adobe XMP Core 5.1.0-jc003')
      .ele('rdf:RDF')
      .att('xmlns:rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
      .ele('rdf:Description')
      .att('rdf:about', '');

    namespaces.forEach((namespace) => {
      xmpXml.att(`xmlns:${namespace.xmlns}`, namespace.url);
    });

    values.forEach((value) => {
      xmpXml.att(value.key, value.value);
    });

    const xmpStart = 'http://ns.adobe.com/xap/1.0/ <?xpacket begin=\'\' id=\'W5M0MpCehiHzreSzNTczkc9d\'?>';
    const xmpContent = xmpXml.end();
    const xmpEnd = '<?xpacket end=\'r\'?>';

    return `${xmpStart}${xmpContent}${xmpEnd}`;
  }
}

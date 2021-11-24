/**
  * Copyright © 2021 Serelay Ltd. All rights reserved.
  */


import * as uuid from 'uuid';
import XmpBuilder from '../../xmp/XmpBuilder';
import C2PAService, { AssertionBoxSpec } from '../services/C2PAService';
import Jumbf from '../../jumbf/Jumbf';
import C2PAContentType from '../enums/c2paContentType.enum';
import C2PALabel from '../enums/c2paLabel.enum';
import JumbfBoxes from '../../jumbf/enums/jumbfBoxes.enum';
import ProvenanceSigningService, { SigningServiceConfig } from '../../services/ProvenanceSigningService';
import HashingToolkit from '../../hashing/HashingToolkit';
import C2PAImageHasher from '../services/C2PAImageHasher';
import AppNWriter from '../../jpegWriting/AppNWriter';
import JpegSegmentMarker from '../../jpeg/JpegSegmentMarker';
import C2PAAssetHash from '../models/C2PAAssetHash';
import { Nullable } from '../../helpers/Nullable';
import createC2PAThumbnail from '../../helpers/createProvenanceThumbnail';
import App11XtSplitter from '../../jpegWriting/App11XtSplitter';
import { ThumbnailType } from '../../interfaces/ProvenanceThumbnail.type';
import { ProvenanceClaimDetails } from '../../interfaces/ProvenanceClaimDetails.interface';

type ResponseDto = {
  jumbfs: string[];
  xmp: string;
};

type Config = {
  file: Buffer;
  companyName: string;
  details: ProvenanceClaimDetails;
  signingServiceConfig: SigningServiceConfig;
  additionalAssertions?: Record<string, AssertionBoxSpec>;
};

const handler = async (
  config: Config,
  log = ((msg: string) => {}),
): Promise<ResponseDto | void> => {
  const { file, companyName, details } = config;
  try {
    log('C2PA: Acquisition started');

    const manifestUuid = uuid.v4();
    const manifestIdentifier = `${companyName}:urn:uuid:${manifestUuid}`;
    const xmpDocumentId = uuid.v4();

    // In the first pass:
    // 1. we create the XMP document with a link to the claim
    // 2. we create media hashes (visual hash, exif, etc. hash is likely right, but location is wrong)
    // 3. create JUMBF with these values
    const xmp = XmpBuilder.build([
      { xmlns: 'dcterms', url: 'http://purl.org/dc/terms/' },
      { xmlns: 'xmp', url: 'http://ns.adobe.com/xap/1.0' },
      { xmlns: 'xmpmm', url: 'http://ns.adobe.com/xap/1.0/mm/' },
    ], [
      { key: 'xmpMM:DocumentId', value: xmpDocumentId },
      { key: 'xmpMM:InstanceId', value: xmpDocumentId },
      { key: 'dcterms:provenance', value: `self#jumbf=c2pa/${manifestIdentifier}` },
      { key: 'xmp:CreateDate', value: new Date().toISOString() },
    ]);

    log('C2PA: XMP generated successfully');

    const firstPassHasher = new C2PAImageHasher(file);
    const firstPassHashes = [
      firstPassHasher.contentHash(),
    ];

    log('C2PA: First pass hashes generated successfully');

    const thumbnail = await createC2PAThumbnail(file);

    const firstPassJumbfTemplate = await createJumbfTemplate(
      firstPassHashes,
      thumbnail,
      manifestIdentifier,
      details,
      config.signingServiceConfig,
      config.additionalAssertions,
    );
    const firstPassJumbf = Jumbf.createByTemplate(firstPassJumbfTemplate.template);
    log('C2PA: First pass jumbf generated successfully');

    // Second pass:
    // 1. We insert the XMP and first pass JUMBF into the image.
    // 2. Now we can get correct hashes of the media
    // 3. We use these hashes to generate the final JUMBF
    const firstPassImage = AppNWriter.insertSegments(file, [
      { marker: JpegSegmentMarker.APP1, content: Buffer.from(xmp) },
      ...App11XtSplitter.split(firstPassJumbf).map(
        (chunk): { marker: JpegSegmentMarker.APP11, content: Buffer } => (
          { marker: JpegSegmentMarker.APP11, content: chunk }
        ),
      ),
    ]);
    const secondPassHasher = new C2PAImageHasher(firstPassImage);
    const hardBindingHashes = secondPassHasher.contentHash();
    hardBindingHashes.exclusions = [
      {
        start: AppNWriter.getInsertionPoint(file, JpegSegmentMarker.APP11),
        length: firstPassJumbf.length,
      },
    ];

    const secondPassHashes = [
      hardBindingHashes,
    ];

    const secondPassJumbfTemplate = await createJumbfTemplate(
      secondPassHashes,
      thumbnail,
      manifestIdentifier,
      details,
      config.signingServiceConfig,
      config.additionalAssertions,
    );
    log('C2PA: Second pass successful. Asset acquired.');

    const secondPassJumbf = Jumbf.createByTemplate(secondPassJumbfTemplate.template);
    const secondPassJumbfChunks = App11XtSplitter.split(secondPassJumbf);

    return {
      xmp: Buffer.from(xmp).toString('base64'),
      jumbfs: secondPassJumbfChunks.map((chunk) => chunk.toString('base64')),
    };
  } catch (e) {
    // Normally, per error instance hanndling would be done here
    throw e;
  }
};

async function createJumbfTemplate(
  hashes: Nullable<C2PAAssetHash>[],
  thumbnail: Buffer,
  manifestIdentifier: string,
  details: ProvenanceClaimDetails,
  signingServiceConfig: SigningServiceConfig,
  additionalAssertions: Record<string, AssertionBoxSpec> = {},
) {
  const { assertions, claim } = C2PAService.generateC2PAData(
    hashes.filter((h): h is C2PAAssetHash => !!h),
    { type: ThumbnailType.Server, buffer: thumbnail },
    manifestIdentifier,
    details,
  );

  const claimBox = {
    type: C2PAContentType.c2cl,
    label: C2PALabel.c2paClaim,
    boxType: JumbfBoxes.cbor,
    content: claim,
  };

  const assertionStoreBox = {
    type: C2PAContentType.c2as,
    label: C2PALabel.c2paAssertions,
    boxes: Object.entries({ ...assertions, ...additionalAssertions }).map(([label, assertion]) => ({
      type: assertion.contentType,
      content: assertion.content,
      label,
      boxType: assertion.boxType,
    })),
  };

  const signature = await ProvenanceSigningService.sign(
    claim,
    signingServiceConfig,
  );

  // This was required in CAI (but we were not convinced it was correct). Unsure about C2PA
  // const uuidHeader = Buffer.from('6361736700110010800000AA00389B71', 'hex');

  const signatureBox = {
    type: C2PAContentType.c2cs,
    label: C2PALabel.c2paSignature,
    boxType: JumbfBoxes.uuid,
    // content: Buffer.concat([uuidHeader, signature]),
    content: Buffer.concat([signature]),
  };

  const template = [{
    type: C2PAContentType.c2pa,
    label: C2PALabel.c2pa,
    boxes: [{
      type: C2PAContentType.c2ma,
      label: manifestIdentifier,
      boxes: [
        assertionStoreBox,
        claimBox,
        signatureBox,
      ],
    }],
  }];
  return {
    template,
    claimHashHex: HashingToolkit.sha256Hash(claim),
  };
}

export default handler;

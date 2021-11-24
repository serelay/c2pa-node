/**
  * Copyright © 2021 Serelay Ltd. All rights reserved.
  */


import * as uuid from 'uuid';
import XmpBuilder from '../../xmp/XmpBuilder';
import C2PAService, { AssertionBoxSpec } from '../services/C2PAService';
import { ThumbnailType } from '../../interfaces/ProvenanceThumbnail.type';
import Jumbf from '../../jumbf/Jumbf';
import C2PAContentType from '../enums/c2paContentType.enum';
import C2PALabel from '../enums/c2paLabel.enum';
import JumbfBoxes from '../../jumbf/enums/jumbfBoxes.enum';
import SigningService, { SigningServiceConfig } from '../../services/ProvenanceSigningService';
import HashingToolkit from '../../hashing/HashingToolkit';
import C2PAAssetHash from '../models/C2PAAssetHash';
import { Nullable } from '../../helpers/Nullable';
import App11XtSplitter from '../../jpegWriting/App11XtSplitter';
import processThumbnailChunks from '../../helpers/processThumbnailChunks';
import { ProvenanceClaimDetails } from '../../interfaces/ProvenanceClaimDetails.interface';

type C2PAResultDto = {
  jumbfs: string[];
  xmp: string;
  thumbnailSegments: {
    index: number;
    start: number;
    length: number;
  }[];
};

interface Config {
  c2paImageMeta: {
    thumbnailAssertionLength: number;
    thumbnailHash: string;
    jumbfInsertionPoint: number;
    xmpInsertionPoint: number;
  }
  companyName: string;
  contentHash: string;
  details: ProvenanceClaimDetails;
  signingServiceConfig: SigningServiceConfig;
  additionalAssertions?: Record<string, AssertionBoxSpec>;
}

const handler = async (
  config: Config,
  log = ((msg: string) => {}),
): Promise<C2PAResultDto | void> => {
  const { companyName, contentHash, details } = config;
  try {
    log('(v2) C2PA: Acquisition started');

    const manifestUuid = uuid.v4();
    const manifestIdentifier = `${companyName}:urn:uuid:${manifestUuid}`;

    const xmpDocumentId = uuid.v4();

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

    const {
      thumbnailAssertionLength,
      thumbnailHash,
      jumbfInsertionPoint,
      xmpInsertionPoint,
    } = config.c2paImageMeta;

    // used as a marker so that we can find and extract the thumbnail
    const placeholder = `PLACEHOLDER${contentHash}PLACEHOLDER`;
    const placeholderThumbnail = Buffer.concat([
      Buffer.from(placeholder),
      Buffer.from('00'.repeat(thumbnailAssertionLength - placeholder.length), 'hex'),
    ]);

    const firstPassHardBinding: C2PAAssetHash = {
      alg: 'sha256',
      exclusions: [
        {
          start: xmpInsertionPoint,
          length: xmp.length,
        },
        {
          start: jumbfInsertionPoint,
          length: 0,
        },
      ],
      pad: '',
      hash: contentHash,
      name: 'JPEG Content',
    };

    // create a jumbf which has the correct length so that we can adjust the hashes
    const firstPassJumbfTemplate = await createJumbfTemplate(
      [firstPassHardBinding],
      thumbnailHash,
      placeholderThumbnail,
      manifestIdentifier,
      details,
      config.signingServiceConfig,
      config.additionalAssertions,
    );

    log('(V2) C2PA: First pass successful');

    const firstPassJumbf = Jumbf.createByTemplate(firstPassJumbfTemplate.template);
    const firstPassJumbfChunks = App11XtSplitter.split(firstPassJumbf);

    const appxHeaderLength = 4;
    const xmpLength = xmp.length + appxHeaderLength;
    const allChunksLength = firstPassJumbfChunks.reduce((sum, c) => sum + c.length, 0);
    const jumbfLength = appxHeaderLength * firstPassJumbfChunks.length + allChunksLength;

    const secondPassHardBinding: C2PAAssetHash = {
      alg: 'sha256',
      pad: '',
      exclusions: [
        {
          start: xmpInsertionPoint,
          length: xmpLength,
        },
        {
          start: jumbfInsertionPoint,
          length: jumbfLength,
        },
      ],
      hash: contentHash,
      name: 'JPEG Content',
    };

    // now we can create a jumbf with asset hashes adjusted by the correct amount
    const secondPassJumbfTemplate = await createJumbfTemplate(
      [secondPassHardBinding],
      thumbnailHash,
      placeholderThumbnail,
      manifestIdentifier,
      details,
      config.signingServiceConfig,
      config.additionalAssertions,
    );

    const secondPassJumbf = Jumbf.createByTemplate(secondPassJumbfTemplate.template);

    const thumbnailStartIndex = secondPassJumbf.indexOf(placeholder);

    const jumbfChunks = App11XtSplitter.split(secondPassJumbf);

    const jumbfs = processThumbnailChunks(
      jumbfChunks,
      thumbnailStartIndex,
      thumbnailAssertionLength,
    );

    log('(V2) C2PA: Second pass and chunking successful. Asset acquired.');

    return {
      xmp: Buffer.from(xmp).toString('base64'),
      jumbfs: jumbfs.jumbfChunks.map((chunk) => chunk.toString('base64')),
      thumbnailSegments: jumbfs.thumbnailSegments,
    };
  } catch (e) {
    // Normally, per error instance hanndling would be done here
    throw e;
  }
};

async function createJumbfTemplate(
  hashes: Nullable<C2PAAssetHash>[],
  thumbnailHash: string,
  thumnbnailPlaceholder: Buffer,
  manifestIdentifier: string,
  details: ProvenanceClaimDetails,
  signingServiceConfig: SigningServiceConfig,
  additionalAssertions: Record<string, AssertionBoxSpec> = {},
) {
  const { assertions, claim } = C2PAService.generateC2PAData(
    hashes.filter((h): h is C2PAAssetHash => !!h),
    { type: ThumbnailType.OnDevice, hash: thumbnailHash, placeholder: thumnbnailPlaceholder },
    manifestIdentifier,
    details,
  );

  const claimBox = {
    type: C2PAContentType.c2cl,
    label: C2PALabel.c2paClaim,
    boxType: JumbfBoxes.json,
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

  const signature = await SigningService.sign(claim, signingServiceConfig);

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

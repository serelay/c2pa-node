/**
  * Copyright © 2021 Serelay Ltd. All rights reserved.
  */


import C2PAAssertion from '../models/C2PAAssertion';
import AssetHash from '../models/C2PAAssetHash';
import C2PAClaimBuilder from '../models/C2PAClaim';
import { ProvenanceThumbnail, ThumbnailType } from '../../interfaces/ProvenanceThumbnail.type';
import C2PALabel from '../enums/c2paLabel.enum';
import JumbfContentType from '../../jumbf/enums/jumbfContentType.enum';
import JumbfBoxes from '../../jumbf/enums/jumbfBoxes.enum';
import { ProvenanceClaimDetails } from '../../interfaces/ProvenanceClaimDetails.interface';

type EmbeddedFileSpec = {
  content: Buffer;
  contentType: JumbfContentType.EMBEDDED_FILE;
  boxType: JumbfBoxes.bfdb;
};

type CborSpec = {
  content: Buffer;
  contentType: JumbfContentType.CBOR;
  boxType: JumbfBoxes.cbor;
};

type JsonSpec = {
  content: Buffer;
  contentType: JumbfContentType.JSON;
  boxType: JumbfBoxes.json;
};

export type AssertionBoxSpec = EmbeddedFileSpec | CborSpec | JsonSpec;

class C2PAService {
  public static generateC2PAData(
    assetHashes: AssetHash[],
    thumbnail: ProvenanceThumbnail,
    manifestIdentifier: string,
    details: ProvenanceClaimDetails,
  ): { claim: Buffer; assertions: Record<string, AssertionBoxSpec> } {
    const claim = new C2PAClaimBuilder(details.recorder, manifestIdentifier);

    const assertions: Record<string, AssertionBoxSpec> = {};

    const claimDateAssertion = new C2PAAssertion(
      'c2pa.claim.date',
      { date: new Date().toISOString() },
      manifestIdentifier,
    );
    assertions[claimDateAssertion.label] = {
      content: claimDateAssertion.value,
      boxType: JumbfBoxes.cbor,
      contentType: JumbfContentType.CBOR,
    };

    claim.addAssertion(claimDateAssertion);

    const locationAssertion = new C2PAAssertion(
      'c2pa.location.precise',
      {
        'exif:GPSLatitude': details.location?.gpsLatitude ?? 'missing',
        'exif:GPSLongitude': details.location?.gpsLongitude ?? 'missing',
      },
      manifestIdentifier,
    );
    assertions[locationAssertion.label] = {
      content: locationAssertion.value,
      boxType: JumbfBoxes.cbor,
      contentType: JumbfContentType.CBOR,
    };

    claim.addAssertion(locationAssertion);

    const timeAssertion = new C2PAAssertion(
      'c2pa.time',
      {
        'xmp:CreateDate': details.time,
      },
      manifestIdentifier,
    );
    claim.addAssertion(timeAssertion);
    assertions[timeAssertion.label] = {
      content: timeAssertion.value,
      boxType: JumbfBoxes.cbor,
      contentType: JumbfContentType.CBOR,
    };


    // const locationReviewAssertion = new C2PAAssertion(
    //   'stds.schema-org.ClaimReview_1',
    //   (new SDOClaimReview({
    //     claimReviewed: 'The location metadata is accurate',
    //     ratingExplanation: 'some explanation',
    //     ratingValue: 3,
    //     url: locationAssertion.uri,
    //   })).toJSONStringBuffer(),
    //   manifestIdentifier,
    // );
    // claim.addAssertion(locationReviewAssertion);
    // assertions[locationReviewAssertion.label] = {
    //   content: locationReviewAssertion.value,
    //   boxType: JumbfBoxes.json,
    //   contentType: JumbfContentType.JSON,
    // };

    // const timeReviewAssertion = new C2PAAssertion(
    //   'stds.schema-org.ClaimReview_2',
    //   (new SDOClaimReview({
    //     claimReviewed: 'The time metadata is accurate',
    //     ratingExplanation: details.timeRating.description,
    //     ratingValue: details.timeRating.score,
    //     url: timeAssertion.uri,
    //   })).toJSONStringBuffer(),
    //   manifestIdentifier,
    // );
    // claim.addAssertion(timeReviewAssertion);
    // assertions[timeReviewAssertion.label] = {
    //   content: timeReviewAssertion.value,
    //   boxType: JumbfBoxes.json,
    //   contentType: JumbfContentType.JSON,
    // };


    const hashes = assetHashes.map((hash) => ({
      name: hash.name,
      hash: hash.hash,
      alg: hash.alg,
      pad: '',
      exclusions: hash.exclusions,
    }));

    const hardBindingAssertion = new C2PAAssertion(
      'c2pa.hash.data',
      hashes,
      manifestIdentifier,
    );
    claim.addAssertion(hardBindingAssertion);
    assertions[hardBindingAssertion.label] = {
      content: hardBindingAssertion.value,
      boxType: JumbfBoxes.cbor,
      contentType: JumbfContentType.CBOR,
    };

    const thumbnailAssertion = C2PAService.generateThumbnailAssertion(thumbnail, manifestIdentifier);
    claim.addAssertion(thumbnailAssertion);
    assertions[thumbnailAssertion.label] = {
      content: thumbnailAssertion.value,
      boxType: JumbfBoxes.bfdb,
      contentType: JumbfContentType.EMBEDDED_FILE,
    };

    return {
      claim: claim.build(),
      assertions,
    };
  }

  private static generateThumbnailAssertion(thumbnail: ProvenanceThumbnail, manifestIdentifier: string): C2PAAssertion {
    if (thumbnail.type === ThumbnailType.OnDevice) {
      return new C2PAAssertion(
        C2PALabel.c2paClaimThumbnail,
        thumbnail.placeholder,
        manifestIdentifier,
        thumbnail.hash,
      );
    }
    return new C2PAAssertion(
      C2PALabel.c2paClaimThumbnail,
      thumbnail.buffer,
      manifestIdentifier,
    );
  }
}

export default C2PAService;

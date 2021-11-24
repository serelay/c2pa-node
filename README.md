
# C2PA Node Package

## ⚠️ This project is intended to be forked and will not be maintained here. ⚠️

Bootstrap for server-side asset creation or facilitating client-side asset creation for the Coalition for Content Provenance and
Authenticity ([C2PA](https://c2pa.org)) standard.
​
**This was created targeting C2PA Draft Specification v0.7 (C2PA PUBLIC DRAFT, 2021-08-31)**
​

### C2PA Assertions

As a minimum the package creates the asset hash assertion (Content Binding). If available the other assertions for Location and time will be created.
A sample means of adding a ClaimReview assertion is also provided. Others should be possible to add.
​

### Certificates

For C2PA creation and validation a full certificate chain is preferred. Meaning the Certificate Authority, Intermediate, and Leaf certificates. These are combined within the signature portion of C2PA information.
​
These need to be provided to the package in DER format. That is raw files, not with a Base64 payload between a header and footer (PEM). These can be transformed between one another using something similar to:
​

```typescript

import * as path from 'path';
import * as fs from 'fs';
​
function pemToDer(filename: string): Buffer {
  var inputFile = path.resolve(__dirname, `./${filename}`)
  var leaf = fs.readFileSync(inputFile);
  var leafstr = leaf.toString('utf-8')
  leaf = Buffer.from(leafstr.slice(`-----BEGIN CERTIFICATE-----\n`.length, leafstr.length - `-----END CERTIFICATE-----\n`.length), 'base64');
  return leaf
}

```

​
It is recommended to begin with DER encoded certificates to begin with for better performance.
​
## Usage Guide
### Setup
#### Pre-requisites

* Certificate chain - order matters. Should be [leaf, intermediate, root], DER encoded.
* Leaf certificate private key.
​

### Local thumbnail C2PA

Generate the C2PA content including the thumbnail based on the file that we have access to. Resulting in the insertion data, not a full file.
Here the original file is not accessed, so there is some trust in the client's information.
This data is the size of the provenance data + the thumbnail.

The following `Config` is provided argument to `untrustedClient.ts` `handler()`.
​

```typescript

type Config = {
  file: Buffer;
  companyName: string;
  details: ProvenanceClaimDetails;
  signingServiceConfig: SigningServiceConfig;
  additionalAssertions?: Record<string, AssertionBoxSpec>
};
​
//...
​
interface SigningServiceConfig {
  privateKey: Buffer;
  chain: Buffer[];
}
​
// Used to auto-generate location and time assertions
type ProvenanceClaimDetails = {
  location?: {
    gpsLatitude: string;
    gpsLongitude: string;
  };
  time: string;
  recorder?: string;
};

```
​
### Remote thumbnail C2PA

Generate the C2PA content, with thumbnail insertion instructions based on received thumbnail data. These form XMP, and JUMBF segments. The JUMBF segements are then augmented with the contents of the thumbnail.
This approach relies on client-trust. The thumbnail and associated information is assumed to match the content that it is inserted into. At a minimum the content would be cryptographically bound to the content if the information provided is correct. If the information differs to the file that the provenance content is added to then the cryptographic binding is broken.
This data is the size of the provenance data + thumbnail instruction sizes. This is significantly smaller in size than the Local Thumbnail approach.
​
The following `Config` is provided argument to `trustedClient.ts` `handler()`.
​

```typescript

interface Config {
  // Provided by client
  c2paImageMeta: {
    thumbnailAssertionLength: number;
    thumbnailHash: string;
    jumbfInsertionPoint: number;
    xmpInsertionPoint: number;
  }
  // Will be included within C2PA assertions
  companyName: string;
  contentHash: string;
  details: ProvenanceClaimDetails;
  signingServiceConfig: SigningServiceConfig;
  additionalAssertions?: Record<string, AssertionBoxSpec>
}
​
//...
​
interface SigningServiceConfig {
  privateKey: Buffer;
  chain: Buffer[];
}
​
// Used to auto-generate location and time assertions
type ProvenanceClaimDetails = {
  location?: {
    gpsLatitude: string;
    gpsLongitude: string;
  };
  time: string;
  recorder?: string;
};

```

## Mechanism

The file is passed over twice, once to prepare the hash regions, and learn of the offsets for the asset hashes, and another to populate the asset hash.
​
Assertions are added during the first pass, but with hashes zeroed for the content binding hash. This is so that the hash exclusion ranges can be calculated to ensure the content binding hash is correct.

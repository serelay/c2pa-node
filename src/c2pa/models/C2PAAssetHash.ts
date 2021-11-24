/**
  * Copyright © 2021 Serelay Ltd. All rights reserved.
  */


type C2PAHashExclusion = {
  start: number;
  length: number;
};

type C2PAAssetHash = {
  name: string;
  hash: string;
  alg: 'sha256';
  pad: '';
  exclusions: C2PAHashExclusion[];
};

export default C2PAAssetHash;

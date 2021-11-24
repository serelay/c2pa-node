/**
  * Copyright © 2021 Serelay Ltd. All rights reserved.
  */


type SignSHA256 = {
  algorithm: 'SHA256',
  privateKey: Buffer,
};

type SignCOSE = {
  algorithm: 'COSE',
  chain: Buffer[],
  privateKey: Buffer,
};

type SigningAlgorithm = SignSHA256 | SignCOSE;

export default SigningAlgorithm;

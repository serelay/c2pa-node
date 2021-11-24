/**
  * Copyright © 2021 Serelay Ltd. All rights reserved.
  */


enum C2PAContentType {
  c2pa = '6332706100110010800000AA00389B71', // c2pa superbox
  c2ma = '63326D6100110010800000AA00389B71', // c2pa manifest
  c2as = '6332617300110010800000AA00389B71', // c2pa assertion store
  c2cl = '6332636C00110010800000AA00389B71', // c2pa Claim
  c2cs = '6332637300110010800000AA00389B71', // c2pa Claim Signature
}

export default C2PAContentType;

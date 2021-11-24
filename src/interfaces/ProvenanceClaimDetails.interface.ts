/**
  * Copyright © 2021 Serelay Ltd. All rights reserved.
  */


export type ProvenanceClaimDetails = {
  location?: {
    gpsLatitude: string;
    gpsLongitude: string;
  };
  time: string;
  recorder?: string;
};

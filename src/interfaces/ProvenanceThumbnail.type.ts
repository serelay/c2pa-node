/**
  * Copyright © 2021 Serelay Ltd. All rights reserved.
  */


export enum ThumbnailType {
  Server,
  OnDevice,
}

type ServerThumbnail = {
  type: ThumbnailType.Server;
  buffer: Buffer;
};

type OnDeviceThumbnail = {
  type: ThumbnailType.OnDevice;
  placeholder: Buffer;
  hash: string;
};

export type ProvenanceThumbnail = ServerThumbnail | OnDeviceThumbnail;

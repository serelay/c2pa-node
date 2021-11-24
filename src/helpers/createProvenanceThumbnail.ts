/**
  * Copyright © 2021 Serelay Ltd. All rights reserved.
  */


import * as sharp from 'sharp';
import ProvenanceThumbnailOptions from '../interfaces/ProvenanceThumbnailOptions.interface';

const DEFAULT_OPTIONS = (): Required<ProvenanceThumbnailOptions> => ({
  height: Number(process.env.THUMBNAIL_MAX_HEIGHT),
  width: Number(process.env.THUMBNAIL_MAX_WIDTH),
  preserveAspectRatio: true,
  withoutEnlargement: true,
});

export default async function createProvenanceThumbnail(
  source: Buffer,
  options: ProvenanceThumbnailOptions = {},
): Promise<Buffer> {
  const config = { ...DEFAULT_OPTIONS(), ...options };
  const fit = config.preserveAspectRatio ? 'inside' : 'fill';
  return sharp(source)
    .rotate()
    .resize({
      fit,
      height: config.height,
      width: config.width,
      withoutEnlargement: config.withoutEnlargement,
    })
    .toBuffer();
}

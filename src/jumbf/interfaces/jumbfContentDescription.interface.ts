/**
  * Copyright © 2021 Serelay Ltd. All rights reserved.
  */


import JumbfContentType from '../enums/jumbfContentType.enum';

export default interface JumbfContentDescription {
  type: JumbfContentType | string;
  requestable: boolean;
  label?: string;
  id?: string;
  signature?: string;
}

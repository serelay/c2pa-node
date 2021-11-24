/**
  * Copyright © 2021 Serelay Ltd. All rights reserved.
  */


enum JumbfContentType {
  CBOR = '63626F7200110010800000AA00389B71', // TODO: This will be in an upcoming update to ISO-19566 (JUMBF)
  CODESTREAM = '6579D6FBDBA2446BB2AC1B82FEEB89D1',
  EMBEDDED_FILE = '40CB0C32BB8A489DA70B2AD6F47F4369',
  JSON = '6A736F6E00110010800000AA00389B71',
  XML = '786D6C2000110010800000AA00389B71',
  UUID = '7575696400110010800000AA00389B71',
}

export default JumbfContentType;

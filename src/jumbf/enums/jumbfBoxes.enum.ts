/**
  * Copyright © 2021 Serelay Ltd. All rights reserved.
  */


enum JumbfBoxes {
  cbor = '63626F72', // TODO: This will be in an upcoming update to ISO-19566 (JUMBF)
  bfdb = '62666462', // embedded file
  jp2c = '6A703263', // image codestreams
  jumb = '6A756D62', // superbox
  json = '6A736F6E',
  jumd = '6A756D64', // description box
  uuid = '75756964',
  xml = '786D6C20', // xml 
}

export default JumbfBoxes;

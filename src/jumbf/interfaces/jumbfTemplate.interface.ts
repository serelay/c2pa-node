/**
  * Copyright © 2021 Serelay Ltd. All rights reserved.
  */


import JumbfBoxes from '../enums/jumbfBoxes.enum';

interface JumbfBase {
  type: string;
  label: string;
}

interface JumbfTemplateWithContent extends JumbfBase {
  content: string | Buffer;
  boxType: JumbfBoxes;
}

interface JumbfTemplateWithBoxes extends JumbfBase {
  boxes: JumbfTemplate[];
}

type JumbfTemplate = JumbfTemplateWithBoxes | JumbfTemplateWithContent;

export default JumbfTemplate;

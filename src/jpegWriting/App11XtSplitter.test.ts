/**
  * Copyright © 2021 Serelay Ltd. All rights reserved.
  */


import { expect } from 'chai';
import App11XtSplitter from './App11XtSplitter';

const header = Buffer.from('4A500001000000010000010e6a756d62', 'hex');

describe('App11XtSplitter', () => {
  it('should put everything into a single chunk if it fits', () => {
    const payload = Buffer.from('hello');

    const segment = Buffer.concat([header, payload]);

    const result = App11XtSplitter.split(segment, segment.length + 1);

    expect(result).to.have.length(1);

    expect(segment.compare(result[0])).to.equal(0);
  });

  it('should split data into chunks of specified size', () => {
    const payload = Buffer.from('hello'.repeat(2));

    const segment = Buffer.concat([header, payload]);

    const result = App11XtSplitter.split(segment, 5);

    expect(result).to.have.length(2);
  });

  it('should include the XT header with increasing packet numbers for each segment', () => {
    const payload = Buffer.from('zyx');
    const segment = Buffer.concat([header, payload]);
    const result = App11XtSplitter.split(segment, 1);
    result.forEach((data, index) => {
      const packet = index + 1;
      expect(Buffer.from(`4A5000010000000${packet}0000010e6a756d62`, 'hex').compare(data.subarray(0, 16))).to.equal(0);
    });
  });
});

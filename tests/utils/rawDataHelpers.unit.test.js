/* global describe test expect jest */
/* eslint no-undef: "error" */

const rawDataHelpers = require('../../app/utils/rawDataHelpers.js');
import Papa from '../../app/vendor/papaparse.4.1.2';
import Baby from 'babyparse';

describe('rawDataHelpers.parseRawData', () => {
  const rawData = 'Year,Make,Model\r\n1997,Ford,E350\r\n2000,Mercury,Cougar';
  const parsedData = [{ Make: 'Ford', Model: 'E350', Year: '1997' }, { Make: 'Mercury', Model: 'Cougar', Year: '2000' }];
  const fields = ['Year', 'Make', 'Model'];
  const RawDataBad = '"This, Is going, "to work\r\n1,2,3';

  test('papa', () => {
    const parsed = rawDataHelpers.parseRawData(Papa, rawData);
    expect(parsed[0]).toEqual(parsedData);
    expect(parsed[1]).toEqual(fields);
    expect(parsed[2]).toEqual([]);
  });
  test('papa bad', () => {
    const parsed = rawDataHelpers.parseRawData(Papa, RawDataBad);
    expect(parsed[2][0]).toEqual('Quoted field unterminated at row 0');
  });
  test('baby', () => {
    const parsed = rawDataHelpers.parseRawData(Baby, rawData);
    expect(parsed[0]).toEqual(parsedData);
    expect(parsed[1]).toEqual(fields);
    expect(parsed[2]).toEqual([]);
  });
  test('baby bad', () => {
    const parsed = rawDataHelpers.parseRawData(Baby, RawDataBad);
    expect(parsed[2][0]).toEqual('Quoted field unterminated at row 0');
  });
});

describe('rawDataHelpers.transformParsedData', () => {
  const parsedData = [{ Make: 'Ford', Model: 'E350', Year: '1997' }, { Make: 'Mercury', Model: 'Cougar', Year: '2000' }];
  const fields = ['Year', 'Make', 'Model'];
  test('basic transformParsedData test', () => {
    const transformedData = rawDataHelpers.transformParsedData(parsedData, fields); // eslint-disable-line max-len
    expect(transformedData).toBeDefined();
    expect(transformedData.nvd3SingleSeries).toBe(false);
    expect(transformedData.nvd3MultiSeries).toBeTruthy();
    expect(transformedData.nvd3MultiSeries[0].key).toEqual('Make');
    expect(transformedData.nvd3MultiSeries[1].key).toEqual('Model');
  });
});
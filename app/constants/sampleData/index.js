import singleSeries from 'raw!./singleSeries.csv';
import countriesByYear from 'raw!./countriesByYear.csv';
import emissionsPerCountry from 'raw!./emissionsPerCountry.csv';
import stockMarkets from 'raw!./stockMarkets.csv';

export const sampleData = [
  {
    label: 'Single Data Series',
    data: singleSeries,
  },
  {
    label: 'Countries By Year (multiple series)',
    data: countriesByYear,
  },
  {
    label: 'CO2 Emissions by Country (multiple series)',
    data: emissionsPerCountry,
  },
  {
    label: 'Stock market indices, November 2016',
    data: stockMarkets,
  },
];

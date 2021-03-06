import getSumDomain from '../../utils/dataFormats/getSumDomain';

export const config = {
  type: 'stackedAreaChart',
  label: 'Stacked Area Chart',
  dataFormat: 'nvd3MultiSeries',
  componentName: 'NVD3Adapter',
  modules: {
    settings: ['XAxis', 'YAxis', 'Legend', 'Metadata', 'ColorPalette'],
  },
  getNiceDomain: getSumDomain,
};

export const defaultOpts = {
  showLegend: true,
  showControls: false,
  legend: {
    updateState: false,
  },
};

export default {
  config,
  defaultOpts,
};

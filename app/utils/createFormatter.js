import { format, formatLocale } from 'd3-format';
import update from 'immutability-helper';
import { locales, defaultLocaleIndex } from '../constants/d3Locales';

function getLocaleSettings(idx) {
  let localeData;
  if (isNaN(idx) || !locales[idx]) {
    localeData = locales[defaultLocaleIndex];
  }
  localeData = locales[idx];

  // Return only the elements of the locale that D3 cares about
  // e.g. not the flag emoji
  return update({}, { $set: {
    decimal: localeData.decimal,
    thousands: localeData.thousands,
    grouping: localeData.grouping,
    currency: localeData.currency,
  } });
}

/**
 * Build specifier string per https://github.com/d3/d3-format#locale_format
 */
function buildD3FormatSpecifier(settings) {
  let parts = '';
  if (settings.showCurrencySymbol) {
    parts += '$';
  }
  if (settings.groupThousands) {
    parts += ',';
  }
  parts += `.${settings.decimalPlaces}`;
  parts += settings.usePercent ? '%' : 'f';
  return parts;
}

function buildD3Format(settings) {
  const locale = formatLocale(
    getLocaleSettings(parseInt(settings.locale, 10))
  );
  return locale.format(buildD3FormatSpecifier(settings));
}

/**
 * Create formatting function from components. More info about locales here:
 * https://github.com/d3/d3-format/tree/master/locale
 * @param object settings
 *    @param int|string locale Refers to the d3Locales array, may be integer or numeric string
 *    @param bool showCurrencySymbol Use currency symbol from locale?
 *    @param bool groupThousands Use thousands grouping from locale?
 *    @param string prepend Leading text before the data output
 *    @param string append Trailing text after the data output
 *    @param int|string decimalPlaces Number of decimal places, may be be numberic string
 *    @param num|string multiplier Factor to apply to the data, may be numeric string
 *    @param bool usePercent Display as percentage
 * @return function Formatting function
 */
export default function createFormatter(settings) {
  let formatter;
  try {
    formatter = (value) => [
      settings.prepend,
      buildD3Format(settings)(value * settings.multiplier),
      settings.append,
    ].join('');
  } catch (err) {
    // Default D3 formatting if settings is misconfigured
    formatter = (value) => format(',.2f')(value);
  }

  // Check if value is a number before applying formatter
  // Helpful for labels on nvd3BarMultiSeries chart types
  return (value) => {
    if (isNaN(value)) {
      return value;
    }
    return formatter(value);
  };
}

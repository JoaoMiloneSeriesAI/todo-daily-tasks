import axios, { AxiosInstance } from 'axios';
import log from 'electron-log';

interface HolidayAPIResponse {
  id: string;
  startDate: string;
  endDate: string;
  type: string;
  name: Array<{ language: string; text: string }>;
  nationwide: boolean;
}

interface CountryAPIResponse {
  isoCode: string;
  name: Array<{ language: string; text: string }>;
  officialLanguages: string[];
}

interface Holiday {
  id: string;
  name: string;
  date: string;
  isRecurring: boolean;
  source: 'api' | 'custom';
}

interface Country {
  code: string;
  name: string;
  languages: string[];
}

export class HolidayService {
  private client: AxiosInstance;
  private baseURL = 'https://openholidaysapi.org';

  constructor() {
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 15000,
      headers: {
        'Accept': 'application/json',
      },
    });
  }

  /// <summary>
  /// Fetches public holidays from OpenHolidaysAPI for a given country and year.
  /// Includes fallback logic: if the requested year returns 0 results,
  /// retries without the languageIsoCode parameter in case it filters results.
  /// </summary>
  async fetchHolidays(params: {
    countryCode: string;
    year: number;
    languageCode?: string;
  }): Promise<Holiday[]> {
    const startDate = `${params.year}-01-01`;
    const endDate = `${params.year}-12-31`;
    const languageCode = params.languageCode || 'EN';

    // First attempt: with language code
    let holidays = await this._fetchHolidaysRaw(
      params.countryCode, startDate, endDate, languageCode
    );

    // Fallback: if 0 results, retry WITHOUT languageIsoCode
    if (holidays.length === 0) {
      holidays = await this._fetchHolidaysRaw(
        params.countryCode, startDate, endDate, undefined
      );
    }

    // Second fallback: if still 0 and year is current year, try previous year
    if (holidays.length === 0) {
      const currentYear = new Date().getFullYear();
      if (params.year === currentYear) {
        const prevStart = `${params.year - 1}-01-01`;
        const prevEnd = `${params.year - 1}-12-31`;
        holidays = await this._fetchHolidaysRaw(
          params.countryCode, prevStart, prevEnd, undefined
        );
        if (holidays.length > 0) {
          // Shift dates from previous year to current year, with new unique IDs
          holidays = holidays.map((h) => ({
            ...h,
            id: `${h.id}-shifted-${params.year}`,
            date: h.date.replace(`${params.year - 1}`, `${params.year}`),
          }));
        }
      }
    }

    return holidays;
  }

  /// <summary>
  /// Raw API call with detailed diagnostic logging.
  /// </summary>
  private async _fetchHolidaysRaw(
    countryCode: string,
    validFrom: string,
    validTo: string,
    languageIsoCode: string | undefined
  ): Promise<Holiday[]> {
    try {
      const queryParams: Record<string, string> = {
        countryIsoCode: countryCode,
        validFrom,
        validTo,
      };
      if (languageIsoCode) {
        queryParams.languageIsoCode = languageIsoCode;
      }

      const response = await this.client.get<HolidayAPIResponse[]>('/PublicHolidays', {
        params: queryParams,
      });

      if (!Array.isArray(response.data)) {
        log.error(`[HolidayService] Unexpected response type:`, typeof response.data);
        return [];
      }

      return response.data.map((holiday) => {
        // Try to find name in requested language, fall back to first available
        const nameInLang = languageIsoCode
          ? holiday.name.find((n) => n.language === languageIsoCode)?.text
          : undefined;
        const name = nameInLang || holiday.name[0]?.text || 'Holiday';

        return {
          id: holiday.id,
          name,
          date: holiday.startDate,
          isRecurring: false,
          source: 'api' as const,
        };
      });
    } catch (error) {
      log.error('[HolidayService] Fetch error:', error);
      if (axios.isAxiosError(error)) {
        log.error(`[HolidayService] HTTP ${error.response?.status}:`, error.response?.data);
        if (error.response?.status === 404) {
          return [];
        }
        if (error.code === 'ECONNABORTED') {
          log.error('[HolidayService] Request timed out');
          return [];
        }
      }
      return [];
    }
  }

  async fetchCountries(): Promise<Country[]> {
    try {
      const response = await this.client.get<CountryAPIResponse[]>('/Countries');

      return response.data.map((country) => ({
        code: country.isoCode,
        name: country.name.find((n) => n.language === 'EN')?.text || country.name[0]?.text || country.isoCode,
        languages: country.officialLanguages || [],
      }));
    } catch (error) {
      log.error('Error fetching countries:', error);
      throw new Error('Failed to fetch countries from API');
    }
  }
}

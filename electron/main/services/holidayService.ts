import axios, { AxiosInstance } from 'axios';

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
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
      },
    });
  }

  async fetchHolidays(params: {
    countryCode: string;
    year: number;
    languageCode?: string;
  }): Promise<Holiday[]> {
    try {
      const startDate = `${params.year}-01-01`;
      const endDate = `${params.year}-12-31`;
      const languageCode = params.languageCode || 'EN';

      const response = await this.client.get<HolidayAPIResponse[]>('/PublicHolidays', {
        params: {
          countryIsoCode: params.countryCode,
          languageIsoCode: languageCode,
          validFrom: startDate,
          validTo: endDate,
        },
      });

      return response.data.map((holiday) => ({
        id: holiday.id,
        name: holiday.name.find((n) => n.language === languageCode)?.text || holiday.name[0]?.text || 'Holiday',
        date: holiday.startDate,
        isRecurring: false,
        source: 'api' as const,
      }));
    } catch (error) {
      console.error('Error fetching holidays:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          console.log('No holidays found for this country/year');
          return [];
        }
        if (error.code === 'ECONNABORTED') {
          throw new Error('Request timeout - please check your internet connection');
        }
      }
      throw new Error('Failed to fetch holidays from API');
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
      console.error('Error fetching countries:', error);
      throw new Error('Failed to fetch countries from API');
    }
  }
}

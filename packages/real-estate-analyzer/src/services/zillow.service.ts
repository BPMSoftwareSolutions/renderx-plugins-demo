/**
 * Zillow API Service
 * Fetches property data from Zillow RapidAPI endpoint
 */

export interface PropertyData {
  zpid: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  yearBuilt: number;
  propertyType: string;
  zestimate?: number;
  priceHistory?: Array<{ date: string; price: number }>;
  taxHistory?: Array<{ year: number; taxAmount: number }>;
  url: string;
}

export interface SearchResult {
  properties: PropertyData[];
  totalResults: number;
  error?: string;
}

const ZILLOW_API_HOST = 'zillow-com1.p.rapidapi.com';
const ZILLOW_API_KEY = process.env.VITE_ZILLOW_API_KEY || '';

export class ZillowService {
  /**
   * Fetch property 3D tour data
   */
  static async getProperty3DTour(propertyUrl: string): Promise<any> {
    if (!ZILLOW_API_KEY) {
      throw new Error('Zillow API key not configured');
    }

    try {
      const response = await fetch(
        `https://${ZILLOW_API_HOST}/property3dtour?property_url=${encodeURIComponent(propertyUrl)}`,
        {
          method: 'GET',
          headers: {
            'x-rapidapi-host': ZILLOW_API_HOST,
            'x-rapidapi-key': ZILLOW_API_KEY,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching 3D tour:', error);
      throw error;
    }
  }

  /**
   * Search for properties by location
   */
  static async searchProperties(_location: string): Promise<SearchResult> {
    // This would integrate with Zillow search API
    // For now, returning mock data structure
    return {
      properties: [],
      totalResults: 0,
    };
  }

  /**
   * Get property details by ZPID
   */
  static async getPropertyDetails(_zpid: string): Promise<PropertyData | null> {
    // This would fetch detailed property information
    return null;
  }
}


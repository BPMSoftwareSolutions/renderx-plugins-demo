import { describe, it, expect } from 'vitest';
import { AnalysisEngine } from '../src/services/analysis.engine';
import type { PropertyData } from '../src/services/zillow.service';

describe('AnalysisEngine', () => {
  const mockProperty: PropertyData = {
    zpid: '12345',
    address: '123 Main St, Springfield, IL',
    price: 200000,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 2000,
    yearBuilt: 1990,
    propertyType: 'Single Family',
    zestimate: 250000,
    priceHistory: [
      { date: '2023-01-01', price: 180000 },
      { date: '2023-06-01', price: 190000 },
      { date: '2024-01-01', price: 200000 },
    ],
    url: 'https://www.zillow.com/homedetails/123-Main-St',
  };

  it('should analyze a property and return opportunity score', () => {
    const opportunity = AnalysisEngine.analyzeProperty(mockProperty);

    expect(opportunity).toBeDefined();
    expect(opportunity.score.overall).toBeGreaterThanOrEqual(0);
    expect(opportunity.score.overall).toBeLessThanOrEqual(100);
    expect(opportunity.estimatedProfit).toBeGreaterThan(0);
  });

  it('should calculate ROI potential based on zestimate', () => {
    const opportunity = AnalysisEngine.analyzeProperty(mockProperty);
    expect(opportunity.score.roiPotential).toBeGreaterThan(0);
  });

  it('should assess risk level based on profit margin', () => {
    const opportunity = AnalysisEngine.analyzeProperty(mockProperty);
    expect(['low', 'medium', 'high']).toContain(opportunity.riskLevel);
  });

  it('should generate recommendations', () => {
    const opportunity = AnalysisEngine.analyzeProperty(mockProperty);
    expect(opportunity.score.recommendations.length).toBeGreaterThan(0);
    expect(opportunity.score.recommendations[0]).toBeTypeOf('string');
  });

  it('should estimate repair costs based on property age', () => {
    const opportunity = AnalysisEngine.analyzeProperty(mockProperty);
    expect(opportunity.estimatedRepairCost).toBeGreaterThan(0);
  });

  it('should calculate profit margin correctly', () => {
    const opportunity = AnalysisEngine.analyzeProperty(mockProperty);
    const expectedMargin =
      (opportunity.estimatedProfit / (mockProperty.price + opportunity.estimatedRepairCost)) *
      100;
    expect(opportunity.profitMargin).toBeCloseTo(expectedMargin, 1);
  });
});


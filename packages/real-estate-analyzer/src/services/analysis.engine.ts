/**
 * Real Estate Opportunity Analysis Engine
 * Analyzes properties for flipping potential
 */

import type { PropertyData } from './zillow.service';

export interface OpportunityScore {
  overall: number; // 0-100
  roiPotential: number;
  marketTrend: number;
  conditionScore: number;
  locationScore: number;
  recommendations: string[];
}

export interface FlippingOpportunity {
  property: PropertyData;
  score: OpportunityScore;
  estimatedRepairCost: number;
  estimatedAfterRepairValue: number;
  estimatedProfit: number;
  profitMargin: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export class AnalysisEngine {
  /**
   * Analyze a property for flipping potential
   */
  static analyzeProperty(property: PropertyData): FlippingOpportunity {
    const roiPotential = this.calculateROIPotential(property);
    const marketTrend = this.calculateMarketTrend(property);
    const conditionScore = this.estimateCondition(property);
  const locationScore = this.evaluateLocation();

    const overall = Math.round(
      (roiPotential * 0.4 + marketTrend * 0.25 + conditionScore * 0.2 + locationScore * 0.15)
    );

    const estimatedRepairCost = this.estimateRepairCost(property, conditionScore);
    const estimatedAfterRepairValue = this.estimateARV(property, marketTrend);
    const estimatedProfit = estimatedAfterRepairValue - property.price - estimatedRepairCost;
    const profitMargin = (estimatedProfit / (property.price + estimatedRepairCost)) * 100;

    return {
      property,
      score: {
        overall,
        roiPotential,
        marketTrend,
        conditionScore,
        locationScore,
        recommendations: this.generateRecommendations(
          property,
          overall,
          estimatedProfit,
          profitMargin
        ),
      },
      estimatedRepairCost,
      estimatedAfterRepairValue,
      estimatedProfit,
      profitMargin,
      riskLevel: this.assessRiskLevel(profitMargin, conditionScore),
    };
  }

  private static calculateROIPotential(property: PropertyData): number {
    // ROI based on price vs zestimate
    if (!property.zestimate) return 50;
    const roi = ((property.zestimate - property.price) / property.price) * 100;
    return Math.min(100, Math.max(0, roi * 2 + 50));
  }

  private static calculateMarketTrend(property: PropertyData): number {
    // Analyze price history for market trends
    if (!property.priceHistory || property.priceHistory.length === 0) return 50;
    const trend = property.priceHistory.reduce((acc, curr, idx, arr) => {
      if (idx === 0) return 0;
      return acc + ((curr.price - arr[idx - 1].price) / arr[idx - 1].price) * 100;
    }, 0);
    return Math.min(100, Math.max(0, trend + 50));
  }

  private static estimateCondition(property: PropertyData): number {
    // Estimate condition based on year built and other factors
    const age = new Date().getFullYear() - property.yearBuilt;
    if (age < 10) return 80;
    if (age < 30) return 60;
    if (age < 50) return 40;
    return 20;
  }

  private static evaluateLocation(): number {
    // Location scoring based on address patterns
    // This would integrate with real location data APIs
    return 60;
  }

  private static estimateRepairCost(property: PropertyData, conditionScore: number): number {
    // Estimate repair costs based on condition
    const baseRepairCost = property.sqft * 50; // $50 per sqft baseline
    const conditionMultiplier = (100 - conditionScore) / 100;
    return baseRepairCost * (1 + conditionMultiplier * 2);
  }

  private static estimateARV(property: PropertyData, marketTrend: number): number {
    // Estimate After Repair Value
    if (property.zestimate) {
      const trendMultiplier = 1 + (marketTrend - 50) / 500;
      return property.zestimate * trendMultiplier;
    }
    return property.price * 1.15;
  }

  private static assessRiskLevel(
    profitMargin: number,
    conditionScore: number
  ): 'low' | 'medium' | 'high' {
    if (profitMargin < 10 || conditionScore < 30) return 'high';
    if (profitMargin < 20 || conditionScore < 50) return 'medium';
    return 'low';
  }

  private static generateRecommendations(
    _property: PropertyData,
    score: number,
    profit: number,
    margin: number
  ): string[] {
    const recommendations: string[] = [];

    if (score > 75) recommendations.push('Excellent flipping opportunity');
    if (score > 60) recommendations.push('Good potential with proper planning');
    if (score < 40) recommendations.push('Consider market conditions before proceeding');

    if (margin > 30) recommendations.push('Strong profit potential');
    if (margin < 15) recommendations.push('Tight margins - monitor costs carefully');

    if (profit > 100000) recommendations.push('High-value project');
    if (profit < 20000) recommendations.push('Small-scale project - verify feasibility');

    return recommendations;
  }
}


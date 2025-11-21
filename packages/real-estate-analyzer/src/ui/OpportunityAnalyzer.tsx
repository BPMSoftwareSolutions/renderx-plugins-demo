/**
 * Real Estate Opportunity Analyzer UI Component
 */

import React, { useState } from 'react';
import { useConductor, resolveInteraction } from '@renderx-plugins/host-sdk';
import type { FlippingOpportunity } from '../services/analysis.engine';
import './OpportunityAnalyzer.css';

export function OpportunityAnalyzer() {
  const conductor = useConductor();
  const [propertyUrl, setPropertyUrl] = useState('');
  const [opportunities, setOpportunities] = useState<FlippingOpportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyUrl.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const route = resolveInteraction('real.estate.analyzer.search');
      if (!route?.pluginId || !route?.sequenceId) {
        throw new Error("Unknown interaction 'real.estate.analyzer.search'");
      }
      const result = await conductor.play(route.pluginId, route.sequenceId, { propertyUrl });

      if (result.error) {
        setError(result.error);
      } else {
        setOpportunities(result.opportunities || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="opportunity-analyzer">
      <h2>Real Estate Opportunity Analyzer</h2>

      <form onSubmit={handleSearch} className="search-form">
        <input
          type="url"
          placeholder="Enter Zillow property URL..."
          value={propertyUrl}
          onChange={(e) => setPropertyUrl(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Analyzing...' : 'Analyze Property'}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      <div className="opportunities-list">
        {opportunities.map((opp, idx) => (
          <OpportunityCard key={idx} opportunity={opp} />
        ))}
      </div>
    </div>
  );
}

function OpportunityCard({ opportunity }: { opportunity: FlippingOpportunity }) {
  const { property, score, estimatedProfit, profitMargin, riskLevel } = opportunity;

  return (
    <div className={`opportunity-card risk-${riskLevel}`}>
      <div className="card-header">
        <h3>{property.address}</h3>
        <span className={`score-badge score-${score.overall}`}>{score.overall}/100</span>
      </div>

      <div className="card-body">
        <div className="property-info">
          <p>
            <strong>Price:</strong> ${property.price.toLocaleString()}
          </p>
          <p>
            <strong>Beds/Baths:</strong> {property.bedrooms}/{property.bathrooms}
          </p>
          <p>
            <strong>Sqft:</strong> {property.sqft.toLocaleString()}
          </p>
        </div>

        <div className="analysis-metrics">
          <div className="metric">
            <label>Estimated Profit</label>
            <span className="value">${estimatedProfit.toLocaleString()}</span>
          </div>
          <div className="metric">
            <label>Profit Margin</label>
            <span className="value">{profitMargin.toFixed(1)}%</span>
          </div>
          <div className="metric">
            <label>Risk Level</label>
            <span className={`risk-badge risk-${riskLevel}`}>{riskLevel.toUpperCase()}</span>
          </div>
        </div>

        <div className="recommendations">
          <h4>Recommendations:</h4>
          <ul>
            {score.recommendations.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}


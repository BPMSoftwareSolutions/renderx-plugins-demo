/**
 * Operational Filter for Telemetry Timeline
 * Allows filtering timeline events by multiple strategies
 */

import React, { useState, useMemo } from 'react';
import { TimelineEvent } from './TimelineFlowVisualization';
import './operation-filter.css';

export interface FilterStrategy {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface OperationFilter {
  strategyId: string;
  query: string;
  minDuration?: number;
  maxDuration?: number;
  eventTypes?: string[];
}

export const FILTER_STRATEGIES: FilterStrategy[] = [
  {
    id: 'all',
    name: 'All Events',
    description: 'Show all events (no filtering)',
    icon: '📊',
  },
  {
    id: 'category',
    name: 'By Category',
    description: 'Filter by event type (plugins, sequences, topics, gaps)',
    icon: '🏷️',
  },
  {
    id: 'search',
    name: 'Search',
    description: 'Find events by name pattern or regex',
    icon: '🔍',
  },
  {
    id: 'timewindow',
    name: 'Time Window',
    description: 'Isolate specific time period',
    icon: '⏱️',
  },
  {
    id: 'performance',
    name: 'Performance',
    description: 'Find slow or long-running operations',
    icon: '⚡',
  },
];

export const SMART_PRESETS = [
  {
    id: 'critical-path',
    name: '🔴 Critical Path',
    description: 'Find major bottlenecks (gaps > 2s)',
    filter: {
      strategyId: 'performance',
      query: '',
      minDuration: 2000,
    },
  },
  {
    id: 'plugin-health',
    name: '🔧 Plugin Health',
    description: 'Show all plugin mount events',
    filter: {
      strategyId: 'category',
      query: 'plugin',
      eventTypes: ['plugin'],
    },
  },
  {
    id: 'user-interactions',
    name: '👆 User Interactions',
    description: 'Track user actions and responses',
    filter: {
      strategyId: 'category',
      query: 'interaction',
      eventTypes: ['interaction', 'ui'],
    },
  },
  {
    id: 'render-operations',
    name: '🎨 Render Operations',
    description: 'Focus on React render events',
    filter: {
      strategyId: 'category',
      query: 'render',
      eventTypes: ['render', 'blocked'],
    },
  },
  {
    id: 'initialization',
    name: '🚀 Initialization',
    description: 'Analyze system startup phase',
    filter: {
      strategyId: 'timewindow',
      query: '0-3000',
    },
  },
  {
    id: 'dead-time',
    name: '💀 Dead Time',
    description: 'Find all performance gaps',
    filter: {
      strategyId: 'category',
      query: 'gap',
      eventTypes: ['gap', 'blocked'],
    },
  },
];

/**
 * Apply filter to events based on strategy
 */
export function applyEventFilter(
  events: TimelineEvent[],
  filter: OperationFilter
): TimelineEvent[] {
  if (!filter || filter.strategyId === 'all') {
    return events;
  }

  switch (filter.strategyId) {
    case 'category':
      if (filter.eventTypes && filter.eventTypes.length > 0) {
        return events.filter(e => filter.eventTypes!.includes(e.type));
      }
      if (filter.query) {
        return events.filter(e => e.name.toLowerCase().includes(filter.query.toLowerCase()));
      }
      return events;

    case 'search': {
      try {
        const regex = new RegExp(filter.query, 'i');
        return events.filter(e => regex.test(e.name));
      } catch {
        return events.filter(e => e.name.toLowerCase().includes(filter.query.toLowerCase()));
      }
    }

    case 'timewindow': {
      const parts = filter.query.split('-');
      if (parts.length === 2) {
        const minTime = parseInt(parts[0], 10);
        const maxTime = parseInt(parts[1], 10);
        return events.filter(e => e.time >= minTime && e.time <= maxTime);
      }
      return events;
    }

    case 'performance': {
      const minDuration = filter.minDuration || 1000;
      const maxDuration = filter.maxDuration || Infinity;
      return events.filter(
        e => e.duration >= minDuration && e.duration <= maxDuration
      );
    }

    default:
      return events;
  }
}

interface OperationFilterPanelProps {
  events: TimelineEvent[];
  onFilterChange: (filter: OperationFilter) => void;
  onPressetSelect: (preset: typeof SMART_PRESETS[0]) => void;
}

export function OperationFilterPanel({
  events,
  onFilterChange,
  onPressetSelect,
}: OperationFilterPanelProps) {
  const [activeStrategy, setActiveStrategy] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [minDuration, setMinDuration] = useState<number>(0);
  const [maxDuration, setMaxDuration] = useState<number>(30000);

  const eventTypes = useMemo(() => {
    const types = new Set<string>();
    events.forEach(e => types.add(e.type));
    return Array.from(types).sort();
  }, [events]);

  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());

  const handleStrategyChange = (strategyId: string) => {
    setActiveStrategy(strategyId);

    const filter: OperationFilter = {
      strategyId,
      query: searchQuery,
      minDuration,
      maxDuration,
      eventTypes: Array.from(selectedTypes),
    };

    onFilterChange(filter);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);

    const filter: OperationFilter = {
      strategyId: activeStrategy,
      query,
      minDuration,
      maxDuration,
      eventTypes: Array.from(selectedTypes),
    };

    onFilterChange(filter);
  };

  const handleTypeToggle = (type: string) => {
    const newTypes = new Set(selectedTypes);
    if (newTypes.has(type)) {
      newTypes.delete(type);
    } else {
      newTypes.add(type);
    }
    setSelectedTypes(newTypes);

    const filter: OperationFilter = {
      strategyId: activeStrategy,
      query: searchQuery,
      minDuration,
      maxDuration,
      eventTypes: Array.from(newTypes),
    };

    onFilterChange(filter);
  };

  const handleDurationChange = (min: number, max: number) => {
    setMinDuration(min);
    setMaxDuration(max);

    const filter: OperationFilter = {
      strategyId: activeStrategy,
      query: searchQuery,
      minDuration: min,
      maxDuration: max,
      eventTypes: Array.from(selectedTypes),
    };

    onFilterChange(filter);
  };

  return (
    <div className="telemetry-filter-panel">
      {/* Smart Presets */}
      <div className="telemetry-filter-section">
        <h3 className="telemetry-filter-title">Quick Analysis</h3>
        <div className="telemetry-preset-grid">
          {SMART_PRESETS.map(preset => (
            <button
              key={preset.id}
              onClick={() => {
                setActiveStrategy(preset.filter.strategyId);
                setSearchQuery(preset.filter.query);
                if (preset.filter.eventTypes) {
                  setSelectedTypes(new Set(preset.filter.eventTypes));
                }
                if (preset.filter.minDuration) {
                  setMinDuration(preset.filter.minDuration);
                }
                onPressetSelect(preset);
              }}
              className="telemetry-preset-button"
              title={preset.description}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Strategy Selection */}
      <div className="telemetry-filter-section">
        <h3 className="telemetry-filter-title">Filter Strategy</h3>
        <div className="telemetry-strategy-grid">
          {FILTER_STRATEGIES.map(strategy => (
            <button
              key={strategy.id}
              onClick={() => handleStrategyChange(strategy.id)}
              className={`telemetry-strategy-button ${activeStrategy === strategy.id ? 'active' : ''}`}
              title={strategy.description}
            >
              <div className="telemetry-strategy-icon">{strategy.icon}</div>
              <div className="telemetry-strategy-label">{strategy.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Strategy-Specific Controls */}
      {activeStrategy === 'search' && (
        <div className="telemetry-filter-section">
          <label className="telemetry-filter-label">Search Pattern:</label>
          <input
            type="text"
            placeholder="e.g., plugin or regex: ^Header.*"
            value={searchQuery}
            onChange={e => handleSearchChange(e.target.value)}
            className="telemetry-filter-input"
          />
        </div>
      )}

      {activeStrategy === 'category' && (
        <div className="telemetry-filter-section">
          <label className="telemetry-filter-label">Event Types:</label>
          <div className="telemetry-type-flex">
            {eventTypes.map(type => (
              <button
                key={type}
                onClick={() => handleTypeToggle(type)}
                className={`telemetry-type-button ${selectedTypes.has(type) ? 'selected' : ''}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      )}

      {activeStrategy === 'performance' && (
        <div className="telemetry-filter-section">
          <label className="telemetry-filter-label">
            Duration Range (ms): {minDuration}ms - {maxDuration}ms
          </label>
          <div className="telemetry-range-grid">
            <input
              type="range"
              min="0"
              max="30000"
              step="100"
              value={minDuration}
              onChange={e => handleDurationChange(parseInt(e.target.value, 10), maxDuration)}
              className="telemetry-range-input"
            />
            <input
              type="range"
              min="0"
              max="30000"
              step="100"
              value={maxDuration}
              onChange={e => handleDurationChange(minDuration, parseInt(e.target.value, 10))}
              className="telemetry-range-input"
            />
          </div>
        </div>
      )}

      {activeStrategy === 'timewindow' && (
        <div className="telemetry-filter-section">
          <label className="telemetry-filter-label">Time Window (format: start-end in ms):</label>
          <input
            type="text"
            placeholder="e.g., 0-5000"
            value={searchQuery}
            onChange={e => handleSearchChange(e.target.value)}
            className="telemetry-filter-input"
          />
        </div>
      )}
    </div>
  );
}

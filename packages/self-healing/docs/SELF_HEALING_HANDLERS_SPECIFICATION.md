# 🤖 Self-Healing System - Handler Specifications

## Overview

This document defines all handlers for the self-healing system, organized by sequence and movement.

## 1. Telemetry Parsing Handlers

### parseTelemetryRequested
**Type**: Pure  
**Input**: `{ requestId: string }`  
**Output**: `{ requestId: string, status: 'started' }`  
**Description**: Validates telemetry parsing request and initializes parsing process

### loadLogFiles
**Type**: Stage-Crew (Async)  
**Input**: `{ logsDirectory: string }`  
**Output**: `{ files: LogFile[], count: number, totalSize: number }`  
**Description**: Load all production log files from .logs directory

### extractTelemetryEvents
**Type**: Stage-Crew (Async)  
**Input**: `{ files: LogFile[] }`  
**Output**: `{ events: TelemetryEvent[], eventCount: number }`  
**Description**: Extract beat-started, beat-completed, and error events from logs

### normalizeTelemetryData
**Type**: Pure  
**Input**: `{ events: TelemetryEvent[] }`  
**Output**: `{ normalizedEvents: NormalizedEvent[] }`  
**Description**: Normalize timestamps, handler names, and event types

### aggregateTelemetryMetrics
**Type**: Pure  
**Input**: `{ normalizedEvents: NormalizedEvent[] }`  
**Output**: `{ metrics: TelemetryMetrics }`  
**Description**: Aggregate timing, frequency, and error metrics

### storeTelemetryDatabase
**Type**: Stage-Crew (Async)  
**Input**: `{ metrics: TelemetryMetrics }`  
**Output**: `{ stored: boolean, recordId: string }`  
**Description**: Store parsed telemetry in database

### parseTelemetryCompleted
**Type**: Pure  
**Input**: `{ recordId: string }`  
**Output**: `{ status: 'completed', recordId: string }`  
**Description**: Notify completion of telemetry parsing

## 2. Anomaly Detection Handlers

### detectAnomaliesRequested
**Type**: Pure  
**Input**: `{ requestId: string }`  
**Output**: `{ requestId: string, status: 'started' }`  
**Description**: Validates anomaly detection request

### loadTelemetryData
**Type**: Stage-Crew (Async)  
**Input**: `{ recordId: string }`  
**Output**: `{ metrics: TelemetryMetrics }`  
**Description**: Load telemetry data from database

### detectPerformanceAnomalies
**Type**: Pure  
**Input**: `{ metrics: TelemetryMetrics }`  
**Output**: `{ anomalies: PerformanceAnomaly[] }`  
**Description**: Detect handlers exceeding performance thresholds (50% over expected)

### detectBehavioralAnomalies
**Type**: Pure  
**Input**: `{ metrics: TelemetryMetrics }`  
**Output**: `{ anomalies: BehavioralAnomaly[] }`  
**Description**: Detect sequence execution order anomalies

### detectCoverageGaps
**Type**: Pure  
**Input**: `{ metrics: TelemetryMetrics }`  
**Output**: `{ anomalies: CoverageAnomaly[] }`  
**Description**: Detect handlers without test coverage

### detectErrorPatterns
**Type**: Pure  
**Input**: `{ metrics: TelemetryMetrics }`  
**Output**: `{ anomalies: ErrorAnomaly[] }`  
**Description**: Detect error patterns and failure modes

### aggregateAnomalyResults
**Type**: Pure  
**Input**: `{ performanceAnomalies: [], behavioralAnomalies: [], coverageAnomalies: [], errorAnomalies: [] }`  
**Output**: `{ allAnomalies: Anomaly[], totalCount: number }`  
**Description**: Aggregate all detected anomalies

### storeAnomalyResults
**Type**: Stage-Crew (Async)  
**Input**: `{ allAnomalies: Anomaly[] }`  
**Output**: `{ stored: boolean, recordId: string }`  
**Description**: Store detected anomalies in database

### detectAnomaliesCompleted
**Type**: Pure  
**Input**: `{ recordId: string }`  
**Output**: `{ status: 'completed', recordId: string }`  
**Description**: Notify completion of anomaly detection

## 3. Diagnosis Handlers

### analyzeRequested
**Type**: Pure  
**Input**: `{ requestId: string }`  
**Output**: `{ requestId: string, status: 'started' }`  
**Description**: Validates analysis request

### loadAnomalies
**Type**: Stage-Crew (Async)  
**Input**: `{ recordId: string }`  
**Output**: `{ anomalies: Anomaly[] }`  
**Description**: Load detected anomalies from database

### loadCodebaseInfo
**Type**: Stage-Crew (Async)  
**Input**: `{}`  
**Output**: `{ handlers: Handler[], sequences: Sequence[], tests: Test[] }`  
**Description**: Load codebase information

### analyzePerformanceIssues
**Type**: Pure  
**Input**: `{ anomalies: PerformanceAnomaly[], handlers: Handler[] }`  
**Output**: `{ diagnosis: PerformanceDiagnosis[] }`  
**Description**: Analyze root causes of performance anomalies

### analyzeBehavioralIssues
**Type**: Pure  
**Input**: `{ anomalies: BehavioralAnomaly[], sequences: Sequence[] }`  
**Output**: `{ diagnosis: BehavioralDiagnosis[] }`  
**Description**: Analyze root causes of behavioral anomalies

### analyzeCoverageIssues
**Type**: Pure  
**Input**: `{ anomalies: CoverageAnomaly[], handlers: Handler[], tests: Test[] }`  
**Output**: `{ diagnosis: CoverageDiagnosis[] }`  
**Description**: Analyze root causes of coverage gaps

### analyzeErrorIssues
**Type**: Pure  
**Input**: `{ anomalies: ErrorAnomaly[], handlers: Handler[] }`  
**Output**: `{ diagnosis: ErrorDiagnosis[] }`  
**Description**: Analyze root causes of error patterns

### assessImpact
**Type**: Pure  
**Input**: `{ diagnosis: Diagnosis[] }`  
**Output**: `{ assessedDiagnosis: AssessedDiagnosis[] }`  
**Description**: Assess impact and severity of issues

### recommendFixes
**Type**: Pure  
**Input**: `{ assessedDiagnosis: AssessedDiagnosis[] }`  
**Output**: `{ recommendations: FixRecommendation[] }`  
**Description**: Recommend fixes for each issue

### storeDiagnosis
**Type**: Stage-Crew (Async)  
**Input**: `{ recommendations: FixRecommendation[] }`  
**Output**: `{ stored: boolean, recordId: string }`  
**Description**: Store diagnosis results in database

### analyzeCompleted
**Type**: Pure  
**Input**: `{ recordId: string }`  
**Output**: `{ status: 'completed', recordId: string }`  
**Description**: Notify completion of analysis

---

**Continue in next section for Fix Generation, Validation, Deployment, and Learning handlers...**


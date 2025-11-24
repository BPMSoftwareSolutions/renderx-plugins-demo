# 🎼 Unified MusicalSequence Interface

**Generated from:** `orchestration-domains.json`
**Last Generated:** 2025-11-24T15:53:48.457Z
**DO NOT EDIT — GENERATED**

## Interface Definition

**Name:** `MusicalSequence`

**Source:** `packages/musical-conductor/modules/communication/sequences/SequenceTypes.ts`

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| (No fields defined) | | | |

---

## Categories

### Plugin Sequences

**ID:** `plugin`

Feature-level sequences

### Orchestration Domains

**ID:** `orchestration`

System-level sequences

---

## Dynamics (Priority Levels)

- **pp** (Pianissimo): Very soft
- **p** (Piano): Soft
- **mp** (Mezzo-piano): Medium soft
- **mf** (Mezzo-forte): Medium loud
- **f** (Forte): Loud
- **ff** (Fortissimo): Very loud

---

## Timing Options

- **immediate**: Execute immediately
- **deferred**: Execute after current phase
- **async**: Execute asynchronously

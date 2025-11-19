#!/usr/bin/env python3
"""
Generate Improvement Plan Sequences

Creates a musical sequence JSON that guides TDD/BDD implementation of optimizations.
Each improvement becomes a sequence with movements (phases) and beats (test cases).
"""

import json
from pathlib import Path
from typing import List, Dict, Any
from datetime import datetime

def create_beat(beat_num: int, event: str, description: str, test_case: str = None) -> Dict[str, Any]:
    """Create a single beat (test case)"""
    return {
        "beat": beat_num,
        "event": event,
        "title": description,
        "description": test_case or description,
        "dynamics": "mf",
        "timing": "immediate",
        "errorHandling": "abort-sequence"
    }

def create_movement(mov_id: str, name: str, beats: List[Dict]) -> Dict[str, Any]:
    """Create a movement (phase)"""
    return {
        "id": mov_id,
        "name": name,
        "description": f"{name} phase of improvement",
        "beats": beats
    }

def create_improvement_sequence(
    seq_id: str,
    name: str,
    description: str,
    target_function: str,
    current_calls: int,
    target_calls: int,
    improvements: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """Create a complete improvement sequence"""
    
    movements = []
    
    # Movement 1: Analysis & Baseline
    movements.append(create_movement(
        "mov_1_analysis",
        "Analysis & Baseline",
        [
            create_beat(1, "test:baseline", "Measure current performance", 
                       f"Assert {target_function} makes {current_calls} calls"),
            create_beat(2, "test:profile", "Profile execution time",
                       f"Assert execution time < 1000ms"),
            create_beat(3, "test:coverage", "Verify test coverage",
                       f"Assert coverage > 80%"),
        ]
    ))
    
    # Movement 2: Refactoring (one per improvement)
    refactor_beats = []
    for idx, improvement in enumerate(improvements, 1):
        refactor_beats.append(create_beat(
            idx,
            f"refactor:{improvement['type']}",
            improvement['title'],
            improvement['description']
        ))
    
    movements.append(create_movement(
        "mov_2_refactoring",
        "Refactoring",
        refactor_beats
    ))
    
    # Movement 3: Validation
    movements.append(create_movement(
        "mov_3_validation",
        "Validation & Verification",
        [
            create_beat(1, "test:calls", "Verify call reduction",
                       f"Assert {target_function} makes <= {target_calls} calls"),
            create_beat(2, "test:performance", "Verify performance improvement",
                       f"Assert execution time improved by >= 20%"),
            create_beat(3, "test:regression", "Run regression tests",
                       f"Assert all existing tests pass"),
            create_beat(4, "test:integration", "Integration testing",
                       f"Assert component works in full system"),
        ]
    ))
    
    # Movement 4: Deployment
    movements.append(create_movement(
        "mov_4_deployment",
        "Deployment & Monitoring",
        [
            create_beat(1, "deploy:staging", "Deploy to staging",
                       "Verify staging deployment successful"),
            create_beat(2, "monitor:metrics", "Monitor metrics",
                       "Verify performance metrics in staging"),
            create_beat(3, "deploy:production", "Deploy to production",
                       "Verify production deployment successful"),
            create_beat(4, "monitor:production", "Monitor production",
                       "Verify metrics in production"),
        ]
    ))
    
    return {
        "id": seq_id,
        "name": name,
        "description": description,
        "category": "improvement",
        "key": "C Major",
        "tempo": 120,
        "timeSignature": "4/4",
        "metadata": {
            "targetFunction": target_function,
            "currentCalls": current_calls,
            "targetCalls": target_calls,
            "estimatedImprovement": f"{((current_calls - target_calls) / current_calls * 100):.1f}%",
            "created": datetime.now().isoformat(),
            "version": "1.0.0"
        },
        "movements": movements
    }

def main():
    print("\n🎵 Generating Improvement Plan Sequences\n")
    print("=" * 80)
    
    # Load current sequences for context
    sequences_path = Path('.ographx/artifacts/renderx-web/sequences/sequences.json')
    with open(sequences_path, 'r') as f:
        data = json.load(f)
    sequences = data.get('sequences', [])
    
    # Find top bottlenecks
    top_sequences = sorted(
        [(s['name'], s.get('callCount', 0)) for s in sequences],
        key=lambda x: x[1],
        reverse=True
    )[:5]
    
    print(f"📊 Found {len(sequences)} sequences")
    print(f"🎯 Targeting top 5 bottlenecks for improvement\n")
    
    improvement_sequences = []
    
    # Create improvement plan for extractPatterns
    improvement_sequences.append(create_improvement_sequence(
        "imp_extractPatterns",
        "Refactor extractPatterns - Reduce Complexity",
        "Break down extractPatterns from 101 calls to 50 calls using function extraction",
        "extractPatterns",
        101,
        50,
        [
            {
                "type": "extract_pattern_detection",
                "title": "Extract pattern detection logic",
                "description": "Move pattern detection to separate function"
            },
            {
                "type": "extract_validation",
                "title": "Extract validation logic",
                "description": "Move validation to separate function"
            },
            {
                "type": "extract_transformation",
                "title": "Extract transformation logic",
                "description": "Move transformation to separate function"
            },
            {
                "type": "add_caching",
                "title": "Add result caching",
                "description": "Cache pattern detection results"
            },
        ]
    ))
    
    # Create improvement plan for updateSize
    improvement_sequences.append(create_improvement_sequence(
        "imp_updateSize",
        "Optimize updateSize - Reduce Complexity",
        "Break down updateSize from 63 calls to 30 calls using lazy evaluation",
        "updateSize",
        63,
        30,
        [
            {
                "type": "lazy_evaluation",
                "title": "Implement lazy evaluation",
                "description": "Only compute sizes when needed"
            },
            {
                "type": "extract_calculation",
                "title": "Extract size calculation",
                "description": "Move calculation to separate function"
            },
            {
                "type": "memoization",
                "title": "Add memoization",
                "description": "Cache size calculations"
            },
        ]
    ))
    
    # Create improvement plan for ChatWindow
    improvement_sequences.append(create_improvement_sequence(
        "imp_ChatWindow",
        "Refactor ChatWindow - Reduce Complexity",
        "Break down ChatWindow from 62 calls to 35 calls using component extraction",
        "ChatWindow",
        62,
        35,
        [
            {
                "type": "extract_header",
                "title": "Extract header component",
                "description": "Move header rendering to separate component"
            },
            {
                "type": "extract_messages",
                "title": "Extract messages component",
                "description": "Move message rendering to separate component"
            },
            {
                "type": "extract_input",
                "title": "Extract input component",
                "description": "Move input handling to separate component"
            },
        ]
    ))
    
    # Create master improvement plan
    master_sequence = {
        "id": "imp_master_plan",
        "name": "Master Improvement Plan - Q1 2025",
        "description": "Comprehensive plan to reduce complexity in top 5 bottleneck functions",
        "category": "improvement",
        "key": "C Major",
        "tempo": 100,
        "timeSignature": "4/4",
        "metadata": {
            "totalFunctions": 5,
            "totalCurrentCalls": sum(c for _, c in top_sequences),
            "totalTargetCalls": sum(c for _, c in top_sequences) - 150,
            "estimatedImprovement": "~30%",
            "created": datetime.now().isoformat(),
            "version": "1.0.0"
        },
        "movements": [
            {
                "id": "mov_1_planning",
                "name": "Planning & Analysis",
                "beats": [
                    create_beat(1, "plan:analyze", "Analyze bottlenecks",
                               "Identify top 5 functions by call count"),
                    create_beat(2, "plan:estimate", "Estimate improvements",
                               "Calculate potential time savings"),
                    create_beat(3, "plan:prioritize", "Prioritize improvements",
                               "Order by impact and effort"),
                ]
            },
            {
                "id": "mov_2_implementation",
                "name": "Implementation",
                "beats": [
                    create_beat(1, "impl:extractPatterns", "Refactor extractPatterns",
                               "Reduce from 101 to 50 calls"),
                    create_beat(2, "impl:updateSize", "Optimize updateSize",
                               "Reduce from 63 to 30 calls"),
                    create_beat(3, "impl:ChatWindow", "Refactor ChatWindow",
                               "Reduce from 62 to 35 calls"),
                    create_beat(4, "impl:recomputeLineSvg", "Optimize recomputeLineSvg",
                               "Reduce from 61 to 35 calls"),
                    create_beat(5, "impl:generatePresentationJS", "Refactor generatePresentationJS",
                               "Reduce from 56 to 30 calls"),
                ]
            },
            {
                "id": "mov_3_validation",
                "name": "Validation & Testing",
                "beats": [
                    create_beat(1, "test:unit", "Run unit tests",
                               "Assert all tests pass"),
                    create_beat(2, "test:integration", "Run integration tests",
                               "Assert system works end-to-end"),
                    create_beat(3, "test:performance", "Performance testing",
                               "Verify 20%+ improvement"),
                ]
            },
            {
                "id": "mov_4_deployment",
                "name": "Deployment",
                "beats": [
                    create_beat(1, "deploy:staging", "Deploy to staging",
                               "Verify staging deployment"),
                    create_beat(2, "deploy:production", "Deploy to production",
                               "Verify production deployment"),
                ]
            },
        ]
    }
    
    improvement_sequences.insert(0, master_sequence)
    
    # Save improvement plan
    output_path = Path('.ographx/artifacts/renderx-web/improvement-plans/improvement-sequences.json')
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    output_data = {
        "version": "1.0.0",
        "generated": datetime.now().isoformat(),
        "description": "TDD/BDD improvement plan sequences for renderx-web",
        "sequences": improvement_sequences
    }
    
    with open(output_path, 'w') as f:
        json.dump(output_data, f, indent=2)
    
    print(f"✅ Generated {len(improvement_sequences)} improvement sequences")
    print(f"📁 Saved to: {output_path}\n")
    
    # Print summary
    print("=" * 80)
    print("\n📋 IMPROVEMENT PLAN SUMMARY\n")
    
    for seq in improvement_sequences[1:]:  # Skip master plan
        meta = seq['metadata']
        print(f"🎯 {seq['name']}")
        print(f"   Target: {meta['targetFunction']}")
        print(f"   Current: {meta['currentCalls']} calls → Target: {meta['targetCalls']} calls")
        print(f"   Improvement: {meta['estimatedImprovement']}")
        print(f"   Movements: {len(seq['movements'])}")
        print()
    
    print("=" * 80)
    print("\n✨ Improvement plan sequences ready for TDD/BDD implementation!\n")

if __name__ == '__main__':
    main()


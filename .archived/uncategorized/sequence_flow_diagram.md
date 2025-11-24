graph TD
    Root["🎼 OgraphX Sequence Flows"]

    Seq0["analyze_ir Flow<br/>Key: C Major<br/>Tempo: 100"]
    Root --> Seq0
    Mov0_0["Movement: calls<br/>13 beats"]
    Seq0 --> Mov0_0
    Beat0_0_0["Beat 1: analyze_ir<br/>immediate | mf"]
    Mov0_0 --> Beat0_0_0
    Beat0_0_1["Beat 2: load<br/>immediate | mf"]
    Mov0_0 --> Beat0_0_1
    Beat0_0_2["Beat 3: get<br/>immediate | mf"]
    Mov0_0 --> Beat0_0_2
    Beat0_0_3["Beat 4: get<br/>immediate | mf"]
    Mov0_0 --> Beat0_0_3
    Beat0_0_4["Beat 5: get<br/>immediate | mf"]
    Mov0_0 --> Beat0_0_4
    Beat0_0_5["Beat 6: get<br/>immediate | mf"]
    Mov0_0 --> Beat0_0_5
    Beat0_0_6["Beat 7: get<br/>immediate | mf"]
    Mov0_0 --> Beat0_0_6
    Beat0_0_7["Beat 8: get<br/>immediate | mf"]
    Mov0_0 --> Beat0_0_7
    Beat0_0_8["Beat 9: values<br/>immediate | mf"]
    Mov0_0 --> Beat0_0_8
    Beat0_0_9["Beat 10: sum<br/>immediate | mf"]
    Mov0_0 --> Beat0_0_9
    Beat0_0_10["Beat 11: max<br/>immediate | mf"]
    Mov0_0 --> Beat0_0_10
    Beat0_0_11["Beat 12: min<br/>immediate | mf"]
    Mov0_0 --> Beat0_0_11
    Beat0_0_12["Beat 13: analyze_architecture_ir<br/>immediate | mf"]
    Mov0_0 --> Beat0_0_12
    Seq1["_build_arch_graph Flow<br/>Key: C Major<br/>Tempo: 100"]
    Root --> Seq1
    Mov1_0["Movement: calls<br/>12 beats"]
    Seq1 --> Mov1_0
    Beat1_0_0["Beat 1: _build_arch_graph<br/>immediate | mf"]
    Mov1_0 --> Beat1_0_0
    Beat1_0_1["Beat 2: get<br/>immediate | mf"]
    Mov1_0 --> Beat1_0_1
    Beat1_0_2["Beat 3: get<br/>immediate | mf"]
    Mov1_0 --> Beat1_0_2
    Beat1_0_3["Beat 4: append<br/>immediate | mf"]
    Mov1_0 --> Beat1_0_3
    Beat1_0_4["Beat 5: add<br/>immediate | mf"]
    Mov1_0 --> Beat1_0_4
    Beat1_0_5["Beat 6: get<br/>immediate | mf"]
    Mov1_0 --> Beat1_0_5
    Beat1_0_6["Beat 7: get<br/>immediate | mf"]
    Mov1_0 --> Beat1_0_6
    Beat1_0_7["Beat 8: get<br/>immediate | mf"]
    Mov1_0 --> Beat1_0_7
    Beat1_0_8["Beat 9: get<br/>immediate | mf"]
    Mov1_0 --> Beat1_0_8
    Beat1_0_9["Beat 10: append<br/>immediate | mf"]
    Mov1_0 --> Beat1_0_9
    Beat1_0_10["Beat 11: append<br/>immediate | mf"]
    Mov1_0 --> Beat1_0_10
    Beat1_0_11["Beat 12: append<br/>immediate | mf"]
    Mov1_0 --> Beat1_0_11
    Seq2["_tarjan_scc Flow<br/>Key: C Major<br/>Tempo: 100"]
    Root --> Seq2
    Mov2_0["Movement: calls<br/>1 beats"]
    Seq2 --> Mov2_0
    Beat2_0_0["Beat 1: _tarjan_scc<br/>immediate | mf"]
    Mov2_0 --> Beat2_0_0

    style Root fill:#4CAF50,stroke:#2E7D32,color:#fff,font-weight:bold
    classDef sequence fill:#9C27B0,stroke:#6A1B9A,color:#fff
    classDef movement fill:#FF9800,stroke:#E65100,color:#fff
    classDef beat fill:#F44336,stroke:#C62828,color:#fff
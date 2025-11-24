graph TD
    Root["🧘 OgraphX Self-Orchestration"]

    Cat0["ANALYSIS<br/>533 sequences"]
    Root --> Cat0

    Seq0["analyze_ir<br/>Flow<br/>Tempo: 100"]
    Cat0 --> Seq0
    Mov0_0["Movement: calls<br/>13 beats"]
    Seq0 --> Mov0_0
    Beat0_0_0["Beat 1: analyze_ir<br/>mf"]
    Mov0_0 --> Beat0_0_0
    Beat0_0_1["Beat 2: load<br/>mf"]
    Mov0_0 --> Beat0_0_1
    Beat0_0_2["Beat 3: get<br/>mf"]
    Mov0_0 --> Beat0_0_2
    Ellipsis0_0["... +10 more beats"]
    Mov0_0 --> Ellipsis0_0
    Seq1["_build_arch_graph<br/>Flow<br/>Tempo: 100"]
    Cat0 --> Seq1
    Mov1_0["Movement: calls<br/>12 beats"]
    Seq1 --> Mov1_0
    Beat1_0_0["Beat 1: _build_arch_graph<br/>mf"]
    Mov1_0 --> Beat1_0_0
    Beat1_0_1["Beat 2: get<br/>mf"]
    Mov1_0 --> Beat1_0_1
    Beat1_0_2["Beat 3: get<br/>mf"]
    Mov1_0 --> Beat1_0_2
    Ellipsis1_0["... +9 more beats"]
    Mov1_0 --> Ellipsis1_0
    Seq2["_tarjan_scc<br/>Flow<br/>Tempo: 100"]
    Cat0 --> Seq2
    Mov2_0["Movement: calls<br/>1 beats"]
    Seq2 --> Mov2_0
    Beat2_0_0["Beat 1: _tarjan_scc<br/>mf"]
    Mov2_0 --> Beat2_0_0
    Seq3["strongconnect<br/>Flow<br/>Tempo: 100"]
    Cat0 --> Seq3
    Mov3_0["Movement: calls<br/>9 beats"]
    Seq3 --> Mov3_0
    Beat3_0_0["Beat 1: strongconnect<br/>mf"]
    Mov3_0 --> Beat3_0_0
    Beat3_0_1["Beat 2: append<br/>mf"]
    Mov3_0 --> Beat3_0_1
    Beat3_0_2["Beat 3: strongconnect<br/>mf"]
    Mov3_0 --> Beat3_0_2
    Ellipsis3_0["... +6 more beats"]
    Mov3_0 --> Ellipsis3_0
    Seq4["_compute_coupling<br/>Flow<br/>Tempo: 100"]
    Cat0 --> Seq4
    Mov4_0["Movement: calls<br/>2 beats"]
    Seq4 --> Mov4_0
    Beat4_0_0["Beat 1: _compute_coupling<br/>mf"]
    Mov4_0 --> Beat4_0_0
    Beat4_0_1["Beat 2: append<br/>mf"]
    Mov4_0 --> Beat4_0_1
    NoteCat0["... +528 more sequences"]
    Cat0 --> NoteCat0

    style Root fill:#4CAF50,stroke:#2E7D32,color:#fff,font-weight:bold
    classDef category fill:#2196F3,stroke:#1565C0,color:#fff
    classDef sequence fill:#9C27B0,stroke:#6A1B9A,color:#fff
    classDef movement fill:#FF9800,stroke:#E65100,color:#fff
    classDef beat fill:#F44336,stroke:#C62828,color:#fff
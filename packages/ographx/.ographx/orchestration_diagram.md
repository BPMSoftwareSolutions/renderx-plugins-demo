graph TD
    Root["🧘 OgraphX Self-Orchestration"]

    Cat0["ANALYSIS<br/>31 sequences"]
    Root --> Cat0

    Seq0["Symbol<br/>Flow<br/>Tempo: 100"]
    Cat0 --> Seq0
    Mov0_0["Movement: calls<br/>1 beats"]
    Seq0 --> Mov0_0
    Beat0_0_0["Beat 1: noop<br/>pp"]
    Mov0_0 --> Beat0_0_0
    Seq1["CallEdge<br/>Flow<br/>Tempo: 100"]
    Cat0 --> Seq1
    Mov1_0["Movement: calls<br/>1 beats"]
    Seq1 --> Mov1_0
    Beat1_0_0["Beat 1: noop<br/>pp"]
    Mov1_0 --> Beat1_0_0
    Seq2["Contract<br/>Flow<br/>Tempo: 100"]
    Cat0 --> Seq2
    Mov2_0["Movement: calls<br/>1 beats"]
    Seq2 --> Mov2_0
    Beat2_0_0["Beat 1: noop<br/>pp"]
    Mov2_0 --> Beat2_0_0
    Seq3["IR<br/>Flow<br/>Tempo: 100"]
    Cat0 --> Seq3
    Mov3_0["Movement: calls<br/>1 beats"]
    Seq3 --> Mov3_0
    Beat3_0_0["Beat 1: noop<br/>pp"]
    Mov3_0 --> Beat3_0_0
    Seq4["normalize_type<br/>Flow<br/>Tempo: 100"]
    Cat0 --> Seq4
    Mov4_0["Movement: calls<br/>3 beats"]
    Seq4 --> Mov4_0
    Beat4_0_0["Beat 1: normalize_type<br/>mf"]
    Mov4_0 --> Beat4_0_0
    Beat4_0_1["Beat 2: sub<br/>mf"]
    Mov4_0 --> Beat4_0_1
    Beat4_0_2["Beat 3: strip<br/>mf"]
    Mov4_0 --> Beat4_0_2
    NoteCat0["... +26 more sequences"]
    Cat0 --> NoteCat0

    style Root fill:#4CAF50,stroke:#2E7D32,color:#fff,font-weight:bold
    classDef category fill:#2196F3,stroke:#1565C0,color:#fff
    classDef sequence fill:#9C27B0,stroke:#6A1B9A,color:#fff
    classDef movement fill:#FF9800,stroke:#E65100,color:#fff
    classDef beat fill:#F44336,stroke:#C62828,color:#fff
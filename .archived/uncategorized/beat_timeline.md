graph LR
    Start["🎵 analyze_ir Flow"]
    B0["analyze_ir<br/>mf"]
    Start --> B0
    B1["load<br/>mf"]
    B0 --> B1
    B2["get<br/>mf"]
    B1 --> B2
    B3["get<br/>mf"]
    B2 --> B3
    B4["get<br/>mf"]
    B3 --> B4
    B5["get<br/>mf"]
    B4 --> B5
    B6["get<br/>mf"]
    B5 --> B6
    B7["get<br/>mf"]
    B6 --> B7
    B8["values<br/>mf"]
    B7 --> B8
    B9["sum<br/>mf"]
    B8 --> B9
    B10["max<br/>mf"]
    B9 --> B10
    B11["min<br/>mf"]
    B10 --> B11
    B12["analyze_architecture_ir<br/>mf"]
    B11 --> B12
    B12 --> End["✓ Complete"]

    style Start fill:#4CAF50,stroke:#2E7D32,color:#fff,font-weight:bold
    style End fill:#4CAF50,stroke:#2E7D32,color:#fff,font-weight:bold
    classDef beat fill:#F44336,stroke:#C62828,color:#fff
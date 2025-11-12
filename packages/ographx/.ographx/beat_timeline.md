graph LR
    Start["🎵 extract_symbols_and_calls Flow"]
    B0["extract_symbols_and_calls<br/>mf"]
    Start --> B0
    B1["extract_imports<br/>mf"]
    B0 --> B1
    B2["extract_imports<br/>mf"]
    B1 --> B2
    B3["splitlines<br/>mf"]
    B2 --> B3
    B4["match<br/>mf"]
    B3 --> B4
    B5["strip<br/>mf"]
    B4 --> B5
    B6["group<br/>mf"]
    B5 --> B6
    B7["splitlines<br/>mf"]
    B6 --> B7
    B8["strip<br/>mf"]
    B7 --> B8
    B9["startswith<br/>mf"]
    B8 --> B9
    B10["match<br/>mf"]
    B9 --> B10
    B11["group<br/>mf"]
    B10 --> B11
    B12["basename<br/>mf"]
    B11 --> B12
    B13["append<br/>mf"]
    B12 --> B13
    B14["Symbol<br/>mf"]
    B13 --> B14
    B15["match<br/>mf"]
    B14 --> B15
    B16["group<br/>mf"]
    B15 --> B16
    B17["group<br/>mf"]
    B16 --> B17
    B18["basename<br/>mf"]
    B17 --> B18
    B19["split<br/>mf"]
    B18 --> B19
    B20["strip<br/>mf"]
    B19 --> B20
    B21["split<br/>mf"]
    B20 --> B21
    B22["append<br/>mf"]
    B21 --> B22
    B23["strip<br/>mf"]
    B22 --> B23
    B24["normalize_type<br/>mf"]
    B23 --> B24
    B25["normalize_type<br/>mf"]
    B24 --> B25
    B26["sub<br/>mf"]
    B25 --> B26
    B27["strip<br/>mf"]
    B26 --> B27
    B28["append<br/>mf"]
    B27 --> B28
    B29["append<br/>mf"]
    B28 --> B29
    B30["Contract<br/>mf"]
    B29 --> B30
    B31["append<br/>mf"]
    B30 --> B31
    B32["Symbol<br/>mf"]
    B31 --> B32
    B33["match<br/>mf"]
    B32 --> B33
    B34["group<br/>mf"]
    B33 --> B34
    B35["group<br/>mf"]
    B34 --> B35
    B36["basename<br/>mf"]
    B35 --> B36
    B37["split<br/>mf"]
    B36 --> B37
    B38["strip<br/>mf"]
    B37 --> B38
    B39["split<br/>mf"]
    B38 --> B39
    B40["append<br/>mf"]
    B39 --> B40
    B41["strip<br/>mf"]
    B40 --> B41
    B42["normalize_type<br/>mf"]
    B41 --> B42
    B43["append<br/>mf"]
    B42 --> B43
    B44["append<br/>mf"]
    B43 --> B44
    B45["Contract<br/>mf"]
    B44 --> B45
    B46["append<br/>mf"]
    B45 --> B46
    B47["Symbol<br/>mf"]
    B46 --> B47
    B48["startswith<br/>mf"]
    B47 --> B48
    B49["finditer<br/>mf"]
    B48 --> B49
    B50["group<br/>mf"]
    B49 --> B50
    B51["append<br/>mf"]
    B50 --> B51
    B52["CallEdge<br/>mf"]
    B51 --> B52
    B52 --> End["✓ Complete"]

    style Start fill:#4CAF50,stroke:#2E7D32,color:#fff,font-weight:bold
    style End fill:#4CAF50,stroke:#2E7D32,color:#fff,font-weight:bold
    classDef beat fill:#F44336,stroke:#C62828,color:#fff
graph TD
    Root["🎼 OgraphX Sequence Flows"]

    Seq0["normalize_type Flow<br/>Key: C Major<br/>Tempo: 100"]
    Root --> Seq0
    Mov0_0["Movement: calls<br/>3 beats"]
    Seq0 --> Mov0_0
    Beat0_0_0["Beat 1: normalize_type<br/>immediate | mf"]
    Mov0_0 --> Beat0_0_0
    Beat0_0_1["Beat 2: sub<br/>immediate | mf"]
    Mov0_0 --> Beat0_0_1
    Beat0_0_2["Beat 3: strip<br/>immediate | mf"]
    Mov0_0 --> Beat0_0_2
    Seq1["extract_imports Flow<br/>Key: C Major<br/>Tempo: 100"]
    Root --> Seq1
    Mov1_0["Movement: calls<br/>5 beats"]
    Seq1 --> Mov1_0
    Beat1_0_0["Beat 1: extract_imports<br/>immediate | mf"]
    Mov1_0 --> Beat1_0_0
    Beat1_0_1["Beat 2: splitlines<br/>immediate | mf"]
    Mov1_0 --> Beat1_0_1
    Beat1_0_2["Beat 3: match<br/>immediate | mf"]
    Mov1_0 --> Beat1_0_2
    Beat1_0_3["Beat 4: strip<br/>immediate | mf"]
    Mov1_0 --> Beat1_0_3
    Beat1_0_4["Beat 5: group<br/>immediate | mf"]
    Mov1_0 --> Beat1_0_4
    Seq2["extract_symbols_and_calls Flow<br/>Key: C Major<br/>Tempo: 100"]
    Root --> Seq2
    Mov2_0["Movement: calls<br/>53 beats"]
    Seq2 --> Mov2_0
    Beat2_0_0["Beat 1: extract_symbols_and_calls<br/>immediate | mf"]
    Mov2_0 --> Beat2_0_0
    Beat2_0_1["Beat 2: extract_imports<br/>immediate | mf"]
    Mov2_0 --> Beat2_0_1
    Beat2_0_2["Beat 3: extract_imports<br/>immediate | mf"]
    Mov2_0 --> Beat2_0_2
    Beat2_0_3["Beat 4: splitlines<br/>immediate | mf"]
    Mov2_0 --> Beat2_0_3
    Beat2_0_4["Beat 5: match<br/>immediate | mf"]
    Mov2_0 --> Beat2_0_4
    Beat2_0_5["Beat 6: strip<br/>immediate | mf"]
    Mov2_0 --> Beat2_0_5
    Beat2_0_6["Beat 7: group<br/>immediate | mf"]
    Mov2_0 --> Beat2_0_6
    Beat2_0_7["Beat 8: splitlines<br/>immediate | mf"]
    Mov2_0 --> Beat2_0_7
    Beat2_0_8["Beat 9: strip<br/>immediate | mf"]
    Mov2_0 --> Beat2_0_8
    Beat2_0_9["Beat 10: startswith<br/>immediate | mf"]
    Mov2_0 --> Beat2_0_9
    Beat2_0_10["Beat 11: match<br/>immediate | mf"]
    Mov2_0 --> Beat2_0_10
    Beat2_0_11["Beat 12: group<br/>immediate | mf"]
    Mov2_0 --> Beat2_0_11
    Beat2_0_12["Beat 13: basename<br/>immediate | mf"]
    Mov2_0 --> Beat2_0_12
    Beat2_0_13["Beat 14: append<br/>immediate | mf"]
    Mov2_0 --> Beat2_0_13
    Beat2_0_14["Beat 15: Symbol<br/>immediate | mf"]
    Mov2_0 --> Beat2_0_14
    Beat2_0_15["Beat 16: match<br/>immediate | mf"]
    Mov2_0 --> Beat2_0_15
    Beat2_0_16["Beat 17: group<br/>immediate | mf"]
    Mov2_0 --> Beat2_0_16
    Beat2_0_17["Beat 18: group<br/>immediate | mf"]
    Mov2_0 --> Beat2_0_17
    Beat2_0_18["Beat 19: basename<br/>immediate | mf"]
    Mov2_0 --> Beat2_0_18
    Beat2_0_19["Beat 20: split<br/>immediate | mf"]
    Mov2_0 --> Beat2_0_19
    Beat2_0_20["Beat 21: strip<br/>immediate | mf"]
    Mov2_0 --> Beat2_0_20
    Beat2_0_21["Beat 22: split<br/>immediate | mf"]
    Mov2_0 --> Beat2_0_21
    Beat2_0_22["Beat 23: append<br/>immediate | mf"]
    Mov2_0 --> Beat2_0_22
    Beat2_0_23["Beat 24: strip<br/>immediate | mf"]
    Mov2_0 --> Beat2_0_23
    Beat2_0_24["Beat 25: normalize_type<br/>immediate | mf"]
    Mov2_0 --> Beat2_0_24
    Beat2_0_25["Beat 26: normalize_type<br/>immediate | mf"]
    Mov2_0 --> Beat2_0_25
    Beat2_0_26["Beat 27: sub<br/>immediate | mf"]
    Mov2_0 --> Beat2_0_26
    Beat2_0_27["Beat 28: strip<br/>immediate | mf"]
    Mov2_0 --> Beat2_0_27
    Beat2_0_28["Beat 29: append<br/>immediate | mf"]
    Mov2_0 --> Beat2_0_28
    Beat2_0_29["Beat 30: append<br/>immediate | mf"]
    Mov2_0 --> Beat2_0_29
    Beat2_0_30["Beat 31: Contract<br/>immediate | mf"]
    Mov2_0 --> Beat2_0_30
    Beat2_0_31["Beat 32: append<br/>immediate | mf"]
    Mov2_0 --> Beat2_0_31
    Beat2_0_32["Beat 33: Symbol<br/>immediate | mf"]
    Mov2_0 --> Beat2_0_32
    Beat2_0_33["Beat 34: match<br/>immediate | mf"]
    Mov2_0 --> Beat2_0_33
    Beat2_0_34["Beat 35: group<br/>immediate | mf"]
    Mov2_0 --> Beat2_0_34
    Beat2_0_35["Beat 36: group<br/>immediate | mf"]
    Mov2_0 --> Beat2_0_35
    Beat2_0_36["Beat 37: basename<br/>immediate | mf"]
    Mov2_0 --> Beat2_0_36
    Beat2_0_37["Beat 38: split<br/>immediate | mf"]
    Mov2_0 --> Beat2_0_37
    Beat2_0_38["Beat 39: strip<br/>immediate | mf"]
    Mov2_0 --> Beat2_0_38
    Beat2_0_39["Beat 40: split<br/>immediate | mf"]
    Mov2_0 --> Beat2_0_39
    Beat2_0_40["Beat 41: append<br/>immediate | mf"]
    Mov2_0 --> Beat2_0_40
    Beat2_0_41["Beat 42: strip<br/>immediate | mf"]
    Mov2_0 --> Beat2_0_41
    Beat2_0_42["Beat 43: normalize_type<br/>immediate | mf"]
    Mov2_0 --> Beat2_0_42
    Beat2_0_43["Beat 44: append<br/>immediate | mf"]
    Mov2_0 --> Beat2_0_43
    Beat2_0_44["Beat 45: append<br/>immediate | mf"]
    Mov2_0 --> Beat2_0_44
    Beat2_0_45["Beat 46: Contract<br/>immediate | mf"]
    Mov2_0 --> Beat2_0_45
    Beat2_0_46["Beat 47: append<br/>immediate | mf"]
    Mov2_0 --> Beat2_0_46
    Beat2_0_47["Beat 48: Symbol<br/>immediate | mf"]
    Mov2_0 --> Beat2_0_47
    Beat2_0_48["Beat 49: startswith<br/>immediate | mf"]
    Mov2_0 --> Beat2_0_48
    Beat2_0_49["Beat 50: finditer<br/>immediate | mf"]
    Mov2_0 --> Beat2_0_49
    Beat2_0_50["Beat 51: group<br/>immediate | mf"]
    Mov2_0 --> Beat2_0_50
    Beat2_0_51["Beat 52: append<br/>immediate | mf"]
    Mov2_0 --> Beat2_0_51
    Beat2_0_52["Beat 53: CallEdge<br/>immediate | mf"]
    Mov2_0 --> Beat2_0_52

    style Root fill:#4CAF50,stroke:#2E7D32,color:#fff,font-weight:bold
    classDef sequence fill:#9C27B0,stroke:#6A1B9A,color:#fff
    classDef movement fill:#FF9800,stroke:#E65100,color:#fff
    classDef beat fill:#F44336,stroke:#C62828,color:#fff
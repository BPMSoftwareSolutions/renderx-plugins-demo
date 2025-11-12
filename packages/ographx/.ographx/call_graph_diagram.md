graph LR
    Root["🧘 OgraphX Call Graph"]

    ographx_py_py_Symbol["📦 Symbol"]
    ographx_py_py_CallEdge["📦 CallEdge"]
    ographx_py_py_Contract["📦 Contract"]
    ographx_py_py_IR["📦 IR"]
    ographx_py_py_normalize_type["⚙️ normalize_type"]
    ographx_py_py_extract_imports["⚙️ extract_imports"]
    ographx_py_py_extract_symbols_and_calls["⚙️ extract_symbols_and_calls"]
    ographx_py_py_walk_py_files["⚙️ walk_py_files"]
    ographx_py_py_build_ir["⚙️ build_ir"]
    ographx_py_py_emit_ir["⚙️ emit_ir"]
    ographx_py_py_main["⚙️ main"]
    ographx_ts_py_ContractProp["📦 ContractProp"]
    ographx_ts_py_Contract["📦 Contract"]
    ographx_ts_py_Symbol["📦 Symbol"]
    ographx_ts_py_CallEdge["📦 CallEdge"]
    ographx_ts_py_IR["📦 IR"]
    ographx_ts_py_ImportInfo["📦 ImportInfo"]
    ographx_ts_py_normalize_contract_id["⚙️ normalize_contract_id"]
    ographx_ts_py_normalize_type["⚙️ normalize_type"]
    ographx_ts_py_parse_params["⚙️ parse_params"]

    ographx_py_py_extract_symbols_and_calls -->|extract_imports| ographx_py_py_extract_imports
    ographx_py_py_extract_symbols_and_calls -->|Symbol| ographx_py_py_Symbol
    ographx_py_py_extract_symbols_and_calls -->|normalize_type| ographx_py_py_normalize_type

    style Root fill:#4CAF50,stroke:#2E7D32,color:#fff,font-weight:bold
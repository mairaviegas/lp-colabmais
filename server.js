{
  "api_config": "/workspace/data/colab-plus-server/.pipedrive_config.json",

  "pipelines": {
    "leads":     { "id": 1, "stage_id": 1,  "stage_name": "Prospect" },
    "contratos": { "id": 5, "stage_id": 26, "stage_name": "Em indicação" }
  },

  "deal_fields": {
    "cnpj":                  { "key": "07044af5a7ffb5eb8c71a2cf42d62bf61a209e65", "type": "varchar" },
    "tipo_cobranca":         { "key": "adfed197d67c47750b0a54f0659d741f271738b4", "type": "enum",     "value": 344  },
    "classificacao_cliente": { "key": "41a95421210bd59f19d08773335941f388ac727d", "type": "enum",     "value": 396  },
    "tipo_negociacao":       { "key": "564184abe9cb5af6012a7a7ae55550d7adb90626", "type": "enum",     "value": 503  },
    "time_responsavel":      { "key": "fae17b3c332164f2d93ae015f886f9466cfe7b6c", "type": "enum",     "value": 284  },
    "status":                { "key": "374e2cbb5f94957a170630f4c4d6abf17596c62a", "type": "set",      "value": [212] },
    "substatus":             { "key": "4ba92a21aa5972911627b440e681af11c991f699", "type": "enum",     "value": 221  },
    "data_contratacao":      { "key": "a2f3648918f1862a28fff3d5ba1f1c70a08c995a", "type": "date"  },
    "parceiros":             { "key": "af829b25a9cec25adb5afee0ce106e612c6b44f5", "type": "set",
      "options_by_plan": {
        "Inicial":   [456, 453],
        "Completo":  [456, 453, 452, 459],
        "Super":     [456, 453, 452, 459, 455]
      },
      "labels": { "452": "Wellhub", "453": "Starbem_Padrão", "455": "Dasa", "456": "Avus", "459": "Dependentes_Wellhub" }
    },
    "quantidade_vidas":      { "key": "b713a0edfd9c49c2440ea615edd2032d775a77b1", "type": "double"   },
    "valor_total_plano":     { "key": "fc21e331d5b99c1952320c85dad8400eb0a3e0aa", "type": "monetary" },
    "faixa":                 { "key": "52ac2ce9f45a342bb52032ec299839ffffa21b32", "type": "varchar"  },
    "utm_source":            { "key": "6aa16ea459b5ef1e553eab4cdd7aba090efe6b3c", "type": "varchar"  },
    "utm_campaign":          { "key": "70ce43970fe06dd7e70665eea1755192c23e807d", "type": "varchar"  }
  },

  "price_table": {
    "Inicial":  { "10-30": 259.90, "31-50": 429.90, "51-70": 599.90, "71-100": 849.90 },
    "Completo": { "10-30": 389.90, "31-50": 649.90, "51-70": 909.90, "71-100": 1299.90 },
    "Super":    { "10-30": 529.90, "31-50": 879.90, "51-70": 1229.90, "71-100": 1749.90 }
  },

  "faixa_map": {
    "10-30":  "10 a 30 colaboradores",
    "31-50":  "31 a 50 colaboradores",
    "51-70":  "51 a 70 colaboradores",
    "71-100": "71 a 100 colaboradores"
  }
}

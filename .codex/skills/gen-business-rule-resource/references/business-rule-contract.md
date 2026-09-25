# Business Rule projection contract

- Include every BR from the frozen UC in source order.
- Preserve OCL expression and authoritative natural-language text exactly.
- Do not translate, paraphrase, merge, split, select or add a rule.
- Classification must not change rule meaning.
- Unsupported context is `unresolved`, not inferred.
- The resource and baseline must have identical ordered BR IDs.

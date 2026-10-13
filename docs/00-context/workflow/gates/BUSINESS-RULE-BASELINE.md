# Business Rule baseline input contract

The prepared baseline records the frozen UC path, raw-byte checksum, complete ordered BR IDs and timestamp. Its inventory must match the referenced frozen UC exactly.

This contract validates identity, order and immutability only. It does not select, interpret or score requirements. A discrepancy blocks the consuming operation and must be corrected in the prepared inputs outside that operation.

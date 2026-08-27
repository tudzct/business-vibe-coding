# TypeORM 0.3 and MySQL rules

## Entity and repository

- Register every entity through the existing Nest/TypeORM configuration and give every entity a primary column.
- Model nullability, uniqueness, precision/scale, length and relation ownership explicitly. Do not enable cascade broadly; choose `onDelete` deliberately.
- Inject the entity repository using established Nest patterns. Use repository/find options or QueryBuilder parameters, never SQL string interpolation.
- Map DTO fields explicitly. Do not pass untrusted request objects directly into `save`/`update`.
- Scope owned-resource queries by both resource identifier and authenticated owner identifier where possible.
- Select only required columns and constrain pagination, sort columns and relation loading.

## Transactions and concurrency

- Use a transaction when one business operation performs multiple dependent writes or financial state changes.
- Inside a TypeORM transaction use only the provided transactional entity manager/repositories, never the global manager/repository.
- Choose isolation/locking/idempotency from explicit business/security requirements. Handle duplicate/deadlock outcomes without exposing database errors.
- Do not use `synchronize: true` in production. Schema change requires an explicit migration and user-approved scope.

## MySQL

- Use appropriate fixed precision for money; never persist financial amounts as floating-point values.
- Back uniqueness/foreign-key/business invariants with constraints where approved.
- Add indexes for demonstrated query/filter/order and ownership patterns, but avoid speculative indexes because each index adds write/storage cost.
- Keep timestamps/timezone semantics explicit and consistent with the API contract.

Official basis:

- https://typeorm.io/docs/entity/entities/
- https://typeorm.io/docs/relations/relations/
- https://typeorm.io/docs/transactions/
- https://typeorm.io/docs/working-with-entity-manager/repository-api/
- https://dev.mysql.com/doc/refman/8.4/en/optimization-indexes.html
- https://dev.mysql.com/doc/refman/8.4/en/innodb-storage-engine.html


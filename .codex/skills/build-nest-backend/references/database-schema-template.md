# Existing database mapping reference

Follow `docs/00-context/engineering/DATABASE-SCHEMA.md` and the owning operation's explicit read boundaries. Use only database structure information supplied by implementation inputs that operation authorizes.

Map required TypeScript properties compatibly with the current application source and authorized implementation inputs. Keep ownership, sensitive-field selection and API exposure explicit.

Use `synchronize: false` and application `migrationsRun: false` under the [shared operational constitution](../../../../AGENTS.md#shared-operational-constitution). Report incompatible requirements with the most precise available location without opening a source prohibited by the owning operation.

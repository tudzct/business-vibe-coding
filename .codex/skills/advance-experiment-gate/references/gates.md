# Experiment gate transitions

| Pending gate | Researcher confirmation | Internal action | Next gate |
|---|---|---|---|
| configuration | confirms displayed `.env` projection | freeze schema-2.2 configuration with BR/flow paths and Figma version/checksum | prompt generation |
| prompt | approves Draft | persist approval and close prompt telemetry | run activation/source generation |
| source | confirms first-pass evidence | close source telemetry | first-pass audit |
| first-pass audit | confirms audit execution | run non-test checks, BR audit and flow audit; preserve initial evidence | repair decision |
| repair decision | authorize or skip | persist exact decision/turn; no source work | repair or final audit |
| repair | confirms completed repair evidence | close repair telemetry | final audit |
| final audit | confirms audit execution | run final BR/flow/runtime audit and freeze final source hash | final metrics |
| final metrics | confirms terminal summary | finalize workflow telemetry and refresh report | complete |

Every transition stores `status`, confirmation turn ID and timestamp under canonical run `gates`. A close turn never begins work belonging to the next row. Schema/public API/ownership/destructive ambiguities create a separate decision gate and do not count as confirmation of the pending gate.

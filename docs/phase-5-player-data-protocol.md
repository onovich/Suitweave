# Phase 5 player-data protocol

Store no player data in the repository. A moderator may provide an offline JSON array to the validator only after consent and anonymization.

Allowed fields: anonymous `participantId` (`p-...`), `source: "real-player"`, task version, completed boards, crown trigger, rounds, minutes, and optional non-identifying notes. Names, email, phone, address, IP, account ids, unknown fields, invalid bounds, synthetic labels, and duplicate ids are rejected.

Synthetic fixtures may test the validator but are never real-player evidence and are never combined with simulation results.

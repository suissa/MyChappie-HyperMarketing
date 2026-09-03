# Marketing.selectNextBestOffer

Selects the next action only from candidates that already passed deterministic eligibility. Uses conservative contextual bandit scoring with a baseline safety guard. `no_action` is a first-class candidate. A discount is an arm, never an automatic consequence of rejection.

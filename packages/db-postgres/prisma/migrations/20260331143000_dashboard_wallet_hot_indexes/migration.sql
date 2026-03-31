CREATE INDEX "p2p_transfers_senderId_recipientId_createdAt_idx"
ON "p2p_transfers" ("senderId", "recipientId", "createdAt" DESC);

CREATE INDEX "p2p_transfers_recipientId_senderId_createdAt_idx"
ON "p2p_transfers" ("recipientId", "senderId", "createdAt" DESC);

CREATE INDEX "payment_requests_requesterId_createdAt_idx"
ON "payment_requests" ("requesterId", "createdAt" DESC);

CREATE INDEX "payment_requests_requestedFromId_createdAt_idx"
ON "payment_requests" ("requestedFromId", "createdAt" DESC);

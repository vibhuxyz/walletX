let’s say a bank service webhook fails during a wallet top-up. How would you design a retry or fallback mechanism to ensure the transaction eventually completes reliably?

In your wallet app, how did you ensure idempotency in P2P transfers? If the same transaction request came twice, what mechanism prevented double-spending?

introduce distributed databases or sharding.

In your wallet system,

how exactly did you implement distributed locking to prevent double spending?

Explain:

Why locking was needed

Where you placed it

How Redis was used

What happens if Redis crashes


Elasticsearch, Logstash, Kibana
integrating a tool like Sentry 


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


if account is suspend deleted then he cant rest password to create pin

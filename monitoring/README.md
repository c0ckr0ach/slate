# Local monitoring

The backend exposes `/health/live` for process liveness and `/health/ready` for a PostgreSQL-backed readiness check. Docker Compose uses readiness as its backend health check. Metrics collection and alerting are intentionally left for the later infrastructure phase.

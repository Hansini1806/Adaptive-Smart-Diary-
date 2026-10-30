# FastAPI emotion API

See [`../ml/README.md`](../ml/README.md) for Windows setup, training and
evaluation, environment configuration, authenticated API usage, and tests.

This API only loads trained model artifacts. It returns HTTP 503 when the
artifacts are absent instead of returning a fake prediction. Supabase bearer
tokens are verified with Supabase Auth. Analysis records are written only when
the request includes a diary entry ID, using the same user token so database
row-level security remains active.

# packages/python

Shared Python packages, one folder per package (`auth/`, `mail/`, `ai/`, ...).
Managed with uv workspaces.

## Adding the first package

```sh
uv init --lib packages/python/auth
```

Then create a root `pyproject.toml`:

```toml
[project]
name = "workspace"
version = "0.0.0"
requires-python = ">=3.12"

[tool.uv.workspace]
members = ["packages/python/*", "services/api-py"]
```

`just setup` and `just check` pick up Python automatically once that file exists.
Suggested libs: FastAPI (built-in OpenAPI), psycopg, pyjwt, ruff.

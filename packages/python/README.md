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

`mise run setup` and `mise run check` do not cover Python yet. Once that file exists, add
the Python steps (`uv sync`, `ruff`) to the root `package.json` scripts the mise tasks call.
Suggested libs: FastAPI (built-in OpenAPI), psycopg, pyjwt, ruff.

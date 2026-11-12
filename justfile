# One entry point for every language in the repo.
# Run `just` to list recipes. TS work is delegated to pnpm/turbo.
# When you add Rust, Go or Python packages, add their commands to the
# matching recipes below (see packages/<lang>/README.md).

set dotenv-load

default:
    @just --list

# Install all dependencies
setup:
    pnpm install
    @if [ -f Cargo.toml ]; then cargo fetch; fi
    @if [ -f go.work ]; then go work sync; fi
    @if [ -f pyproject.toml ]; then uv sync; fi

# Start Postgres (Docker)
db-up:
    docker compose -f infra/docker-compose.yml up -d

# Stop Postgres
db-down:
    docker compose -f infra/docker-compose.yml down

# Apply SQL migrations in db/migrations (in filename order)
db-migrate:
    ./db/migrate.sh

# Run everything in dev mode
dev:
    pnpm dev

# Regenerate contracts/openapi.json and every generated client
contract:
    pnpm contract

# Typecheck / test every language
check:
    pnpm typecheck
    pnpm lint
    @if [ -f Cargo.toml ]; then cargo check --workspace; fi
    @if [ -f go.work ]; then go vet ./...; fi
    @if [ -f pyproject.toml ]; then uv run ruff check .; fi

build:
    pnpm build
    @if [ -f Cargo.toml ]; then cargo build --workspace --release; fi

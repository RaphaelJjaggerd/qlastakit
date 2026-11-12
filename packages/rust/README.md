# packages/rust

Shared Rust crates, one folder per crate (`auth/`, `mail/`, `payments/`, `db/`).

## Adding the first crate

```sh
cargo new --lib packages/rust/auth
```

Then create a root `Cargo.toml`:

```toml
[workspace]
resolver = "2"
members = ["packages/rust/*", "services/api-rs"]
```

`just setup` and `just check` pick up Rust automatically once that file exists.
Suggested crates: axum or rocket, sqlx (Postgres), jsonwebtoken, utoipa (OpenAPI).

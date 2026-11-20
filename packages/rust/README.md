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

`mise run setup` and `mise run check` do not cover Rust yet. Once that file exists, add
the Rust steps (`cargo fetch`, `cargo check`) to the root `package.json` scripts the mise tasks call.
Suggested crates: axum or rocket, sqlx (Postgres), jsonwebtoken, utoipa (OpenAPI).

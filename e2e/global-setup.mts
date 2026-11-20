// The smoke test's only pre-step: create the test database if missing and migrate it.
// Same code the API tests use, so there is one way to prepare the test database.
import setup from "../services/api/test/global-setup.ts";

export default setup;

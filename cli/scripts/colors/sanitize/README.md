## sanitize/

Currently there is a single sanitize implementation: `default-adapter`.

If a consumer wants to customize it, they can modify `default-adapter` via `yarn patch`.

> Policy: the CLI never runs `pip install` automatically. If dependencies are missing, it only prints a warning and shows the install command.

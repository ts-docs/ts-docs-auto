# ts-docs-auto

An app which listens for changes in the npm registry and automatically generates documentation for typescript packages! In order for this app to detect your package and generate the documentation, it must:

- Have `typescript` as a dev dependency.
- Have a **github** repository which is not private. GitBucket and other hosts don't work as of right now.
- Have only one entry point, which is either `src/index` or `lib/index`.

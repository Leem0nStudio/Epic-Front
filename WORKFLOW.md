# Git Workflow Strategy

This repository follows a structured branch strategy to maintain stability in `main` while allowing rapid iteration in `experimental`.

## Branches

1.  **`main`**: The stable production branch. This branch should always be deployable and contain only tested, approved features.
2.  **`experimental`**: The primary development branch. All new features, bug fixes, and experiments are committed here first.

## How to Work

-   **Development**: All agent tasks and manual contributions should be targeted at the `experimental` branch.
-   **Submissions**: When using the `submit` tool, I will always target `experimental` from now on.

## Promoting to Main

To move changes from `experimental` to `main`, follow these steps:

1.  Ensure `experimental` is stable and all tests pass.
2.  Merge `experimental` into `main` (standard Git merge flow).
3.  Go back to `experimental` to continue work.

## Administration Tips

-   Keep `main` locked if using GitHub/GitLab to prevent accidental direct pushes.
-   Use Pull Requests to review changes from `experimental` to `main` for a better audit trail.

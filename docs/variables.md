# Variables (Personal + Project)

Variables are key/value pairs that can be referenced across workflows.

## Scopes

- **Personal**: owned by the current user.
- **Project**: tied to a project; only project admins can create/update/delete.
- Project members can list and use project variables in nodes (read-only access).

## UI

- Personal: `Settings → Variables`
- Project: `Project → Variables`

## API

- `GET /api/v1/variables?scope=personal`
- `GET /api/v1/variables?scope=project&projectId=<projectId>`
- `POST /api/v1/variables`
- `PUT /api/v1/variables/:id`
- `DELETE /api/v1/variables/:id`


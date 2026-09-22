# Rainscare — Project Notes for Claude

This repo (`product-rs`) is the **Rainscare** app (backend / client / admin + Firebase).

## AWS Rules (READ BEFORE ANY AWS ACTION)

All AWS work for Rainscare follows these rules — **no exceptions**:

- **Same credentials / same account.** Use the existing `rnsbrains-new` AWS CLI profile → account `744488454775` (IAM user `Claude`). We do **NOT** create a separate AWS account for Rainscare.

- **NEVER touch RNS Brains anything.** RNS Brains lives in the **same** AWS account. Do not modify, delete, overwrite, or reconfigure any RNS Brains resource. RNS Brains resources are recognizable by the **`crmapp-*`** naming (e.g. `crmapp-media-staging-744488454775`, `crmapp-media-uploads`). When in doubt, assume a resource is RNS Brains and leave it alone.

- **Namespace every Rainscare resource** with a **`rainscare-*`** name prefix (S3 buckets, DynamoDB tables, Lambda functions, IAM users, etc.) so it never collides with `crmapp-*`.

- **Tag every Rainscare resource** with **`Project=Rainscare`**. This is how we track cost and group resources per project (Cost Allocation Tags, Resource Groups, and scoped IAM later).

### Why
Rainscare and RNS Brains must stay clearly separate for tracking/cost, but we decided **against** a separate AWS account. AWS has no "project" container like GCP — the account is the real boundary — so within one shared account, **naming prefixes + tags** are the separation mechanism.

### Checklist for any AWS operation
- **Creating?** → use `--profile rnsbrains-new`, `rainscare-` name prefix, and tag `Project=Rainscare`.
- **Modifying / deleting?** → first confirm the target is a `rainscare-*` / `Project=Rainscare` resource. If it's `crmapp-*` or unclear → **STOP and ask.**

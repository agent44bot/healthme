---
name: healthme-ios-build
description: "Build the HealthMe Capacitor iOS app for simulator or device. Syncs web assets, resolves Swift packages, and compiles via xcodebuild."
version: 1.0.0
metadata:
  openclaw:
    requires:
      bins:
        - xcodebuild
        - npx
        - node
    primaryEnv: HEALTHME_APP_PATH
---

# HealthMe iOS Build Skill

Builds the HealthMe Capacitor iOS app from the command line.

## When to use

Use this skill when the user asks to:
- Build the HealthMe iOS app
- Sync Capacitor and compile for iOS
- Build for simulator or device
- Check if the iOS build is passing
- Deploy a new build to a simulator

## Parameters

The user can specify:
- **target**: `simulator` (default) or `device`
- **configuration**: `Debug` (default) or `Release`
- **clean**: whether to clean before building (default: no)
- **sync-only**: just run `npx cap sync ios` without compiling

## Steps

1. Run `scripts/build.sh` with the appropriate arguments
2. Report build success/failure and any errors back to the user
3. If simulator build succeeds, optionally install and launch on simulator

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `HEALTHME_APP_PATH` | No | `/Users/agent44/apps/healthme` | Path to the HealthMe project |

## Examples

```
User: "build the iOS app"
→ runs: scripts/build.sh --target simulator --config Debug

User: "build HealthMe for device"
→ runs: scripts/build.sh --target device --config Release

User: "just sync capacitor"
→ runs: scripts/build.sh --sync-only

User: "clean build the iOS app"
→ runs: scripts/build.sh --target simulator --config Debug --clean
```

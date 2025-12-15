# Project installation
## Required resources
- Git (https://git-scm.com)
- nvm (https://github.com/nvm-sh/nvm)
- Node.js (the project Node version is specified in `.nvmrc`)

## Procedure to set up the project locally
- Clone the repository
```bash
git clone git@github.com:metro-connexion/feedback.git
cd feedback
```
- Install and use the Node version declared in the project
```bash
# Install the version from .nvmrc (if not yet installed)
nvm install
# Use the project Node version
nvm use
```
If `nvm` is not available in your shell session, load it first:
```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
```

- Run the configuration script
```bash
npm run configure
```

Optional: run the script directly (make it executable first)
```bash
chmod +x ./scripts/configure.sh
./scripts/configure.sh
```

Troubleshooting
- If `npm` is not found, ensure Node.js is installed via `nvm install` and that `nvm use` completed successfully.
- If the configure script fails, check the output for an error line and consult the script in `scripts/configure.sh` for the step that failed.

## Start development
Goto app and run npm run dev, for example:
```shell
cd api
npm run dev
```
You can also start app from project root:
```shell
npm run dev:api
```
or start all project apps with:
```shell
npm run dev
```

# GitHub Flow

![GitHub Flow](48032310-63842400-e114-11e8-8db0-06dc0504dcb5.png)

## What is GitHub Flow?
GitHub Flow is a lightweight, branch-based workflow that supports teams and projects where deployments are made regularly. It is a great workflow for teams that deploy to production frequently. It is also a great workflow for open source projects.

## How does it work?
GitHub Flow is based on the following principles:

- **Main branch**: The `main` branch is always deployable. It is the branch that is used for production deployments.
- **Branches**: All changes are made in branches. Branches are used to isolate changes and make sure they do not affect the `main` branch until they are ready to be deployed.
- **Pull requests**: Pull requests are used to review and discuss changes before they are merged into the `main` branch.
- **Deployments**: Deployments are made from the `main` branch. When a pull request is merged into the `main` branch, it is deployed to production.

## How to use GitHub Flow?

### 1. Create a branch
Create a branch from the `main` branch for each feature or bug fix. The branch name should be descriptive of the feature or bug fix. For example, if you are working on a feature to add a new page to the client application, you can name the branch `add-new-page`.

### 2. Commit changes
Commit changes to the branch you created in the previous step. Make sure to write descriptive commit messages that explain the changes you made.

### 3. Open a pull request
Open a pull request to merge your branch into the `main` branch. Make sure to add a descriptive title and description for the pull request. You can also add screenshots or GIFs to better explain the changes you made.

### 4. Review and merge
Once you open a pull request, other team members can review your changes and provide feedback. Once the pull request is approved, you can merge it into the `main` branch.

### 5. Delete the branch
After merging the pull request, you can delete the branch you created in the first step. This will keep the repository clean and make it easier to manage branches.




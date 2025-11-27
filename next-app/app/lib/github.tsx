import fs from "fs";
import path from "path";
import { simpleGit } from "simple-git";

export async function githubCommitAndPush(
  githubRepo: string,
  githubUser: string,
  githubToken: string
) {

  const extractedPath = path.join(process.cwd(), "temp", "Wiki");
  const commitMessage = "OutlineSync";
  const git = simpleGit();
  const tempRepoPath = path.join(process.cwd(), "repo");

  if (fs.existsSync(tempRepoPath)) {
    fs.rmSync(tempRepoPath, { recursive: true, force: true });
  }

  const authenticatedUrl = githubRepo.replace(
    "https://",
    `https://${githubUser}:${githubToken}@`
  );

  await git.clone(authenticatedUrl, tempRepoPath);

  const repoGit = simpleGit(tempRepoPath);

  const extractedFiles = fs.readdirSync(extractedPath);
  for (const file of extractedFiles) {
    const srcPath = path.join(extractedPath, file);
    const destPath = path.join(tempRepoPath, file);

    if (fs.statSync(srcPath).isDirectory()) {
      fs.cpSync(srcPath, destPath, { recursive: true });
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }

  await repoGit.add(".");
  await repoGit.commit(commitMessage);
  await repoGit.push("origin", "main");

  fs.rmSync(tempRepoPath, { recursive: true, force: true });

  return { success: true, message: "Successfully pushed to GitHub" };
}

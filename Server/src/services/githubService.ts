// Fetches raw file content from a public GitHub repo
export const fetchGitHubFileContent = async (githubUrl: string): Promise<string> => {
  // Accept either a raw.githubusercontent.com URL directly,
  // or a normal github.com/user/repo/blob/branch/path URL and convert it
  let rawUrl = githubUrl;

  if (githubUrl.includes("github.com") && githubUrl.includes("/blob/")) {
    rawUrl = githubUrl
      .replace("github.com", "raw.githubusercontent.com")
      .replace("/blob/", "/");
  }

  const response = await fetch(rawUrl);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch file from GitHub (status ${response.status}). Check the URL is correct and the repo is public.`
    );
  }

  const content = await response.text();

  if (!content || content.trim().length === 0) {
    throw new Error("Fetched file is empty.");
  }

  return content;
};
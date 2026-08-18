const username = "HardenMYG";
const year = document.querySelector("#year");
const avatar = document.querySelector("#avatar");
const profileName = document.querySelector("#profileName");
const profileBio = document.querySelector("#profileBio");
const repoCount = document.querySelector("#repoCount");
const followers = document.querySelector("#followers");
const joined = document.querySelector("#joined");
const repoGrid = document.querySelector("#repoGrid");

year.textContent = new Date().getFullYear();

const formatDate = (value) =>
  new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(new Date(value));

const repoCard = (repo) => {
  const article = document.createElement("article");
  article.className = "repo-card";

  const content = document.createElement("div");
  const title = document.createElement("h3");
  const link = document.createElement("a");
  link.href = repo.html_url;
  link.target = "_blank";
  link.rel = "noreferrer";
  link.textContent = repo.name;
  title.append(link);

  const description = document.createElement("p");
  description.textContent = repo.description || "A public GitHub project from HardenMYG.";
  content.append(title, description);

  const meta = document.createElement("div");
  meta.className = "repo-meta";
  const language = document.createElement("span");
  language.textContent = repo.language || "Code";
  const stars = document.createElement("span");
  stars.textContent = `${repo.stargazers_count} stars`;
  const updated = document.createElement("span");
  updated.textContent = `Updated ${formatDate(repo.updated_at)}`;
  meta.append(language, stars, updated);

  article.append(content, meta);
  return article;
};

const showFallbackRepos = () => {
  repoGrid.replaceChildren(
    repoCard({
      name: "HardenMYG",
      html_url: `https://github.com/${username}`,
      description: "Open GitHub to see the latest repositories and activity.",
      language: "GitHub",
      stargazers_count: 0,
      updated_at: new Date().toISOString(),
    }),
  );
};

async function loadGitHubProfile() {
  try {
    const [profileResponse, reposResponse] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`),
      fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=9`),
    ]);

    if (!profileResponse.ok || !reposResponse.ok) {
      throw new Error("GitHub API request failed");
    }

    const profile = await profileResponse.json();
    const repos = await reposResponse.json();

    document.title = `${profile.name || username} | GitHub Portfolio`;
    avatar.src = profile.avatar_url;
    profileName.textContent = profile.name || username;
    profileBio.textContent =
      profile.bio || "Developer on GitHub. Projects, experiments, and practical code live here.";
    repoCount.textContent = profile.public_repos;
    followers.textContent = profile.followers;
    joined.textContent = formatDate(profile.created_at);

    const visibleRepos = repos
      .filter((repo) => !repo.fork)
      .sort((a, b) => b.stargazers_count - a.stargazers_count || new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 6);

    if (visibleRepos.length === 0) {
      showFallbackRepos();
      return;
    }

    repoGrid.replaceChildren(...visibleRepos.map(repoCard));
  } catch (error) {
    profileBio.textContent = "GitHub profile is linked below. Live stats will appear when the API is available.";
    showFallbackRepos();
  }
}

loadGitHubProfile();

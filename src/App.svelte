<script>
  import { onMount } from "svelte";
  import { authStore } from "./stores/authStore.js";
  import { currentRoute } from "./stores/routeStore.js";
  import { syncState } from "./stores/syncStateStore.js";
  import {
    flushRepoCommitQueue,
    hasPendingRepoCommits,
  } from "./stores/repoStore.js";

  import {
    loadStoredToken,
    validateToken,
    saveToken,
  } from "./services/githubToken.js";

  import {
    checkSkyGitRepoExists,
    createSkyGitRepo,
  } from "./services/githubApi.js";

  import { discoverAllRepos } from "./services/githubRepoDiscovery.js";
  import { initializeStartupState } from "./services/startupService.js";
  import {
    flushConversationCommitQueue,
    hasPendingConversationCommits,
  } from "./services/conversationCommitQueue.js";

  import LoginWithPAT from "./components/LoginWithPAT.svelte";
  import RepoConsent from "./components/RepoConsent.svelte";
  import Home from "./routes/Home.svelte";
  import Settings from "./routes/Settings.svelte";
  import Chats from "./routes/Chats.svelte";
  import Repos from "./routes/Repos.svelte";

  let token = null;
  let user = null;
  let loginError = "";

  // Handle logout redirect
  authStore.subscribe((auth) => {
    if (!auth.isLoggedIn) {
      currentRoute.set("login");
      token = null;
      user = null;
    }
  });

  // Restore session from localStorage if available
  onMount(() => {
    const stored = loadStoredToken();
    if (stored) loginWithToken(stored);
    else currentRoute.set("login");
  });

  async function loginWithToken(t) {
    loginError = "";

    const validatedUser = await validateToken(t);
    if (!validatedUser) {
      localStorage.removeItem("skygit_token");
      loginError = "Invalid token. Please check your PAT and try again.";
      currentRoute.set("login");
      return;
    }

    token = t;
    user = validatedUser;
    saveToken(t);
    authStore.set({ isLoggedIn: true, token, user });

    const hasRepo = await checkSkyGitRepoExists(token, user.login);
    if (hasRepo) {
      currentRoute.set("home");
      await initializeRepoState();
    } else {
      currentRoute.set("consent");
    }
  }

  async function approveRepo() {
    await createSkyGitRepo(token);
    currentRoute.set("home");
    await initializeRepoState();
  }

  function rejectRepo() {
    localStorage.removeItem("skygit_token");
    currentRoute.set("login");
  }

  async function initializeRepoState() {
    try {
      console.log("[SkyGit] Initializing app state...");
      await initializeStartupState(token);
    } catch (e) {
      console.warn("[SkyGit] Failed to initialize startup state:", e);
    }
  }

  // 🔁 Background GitHub repo discovery
  $: if (
    $currentRoute === "home" &&
    $syncState.phase === "idle" &&
    !$syncState.paused
  ) {
    try {
      discoverAllRepos(token);
    } catch (e) {
      console.warn("[SkyGit] Repo discovery failed:", e);
    }
  }

  window.addEventListener('beforeunload', (e) => {
  const hasPending = hasPendingConversationCommits() || hasPendingRepoCommits();
  if (hasPending) {
    flushConversationCommitQueue();
    flushRepoCommitQueue();

    // ✅ Required to trigger the dialog
    e.preventDefault();
    e.returnValue = ''; // empty string still triggers the native dialog
  }
});
</script>

{#if $currentRoute === "loading"}
  <p class="text-center mt-20">Loading...</p>
{:else if $currentRoute === "login"}
  <LoginWithPAT onSubmit={loginWithToken} error={loginError} />
{:else if $currentRoute === "consent"}
  <RepoConsent onApprove={approveRepo} onReject={rejectRepo} />
{:else if $currentRoute === "settings"}
  <Settings />
{:else if $currentRoute === "chats"}
  <Chats />
{:else if $currentRoute === "repos"}
  <Repos />
{:else}
  <Home />
{/if}


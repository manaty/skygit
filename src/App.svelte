<script>
  import { onMount } from "svelte";
  import { authStore } from "./stores/authStore.js";
  import { currentRoute } from "./stores/routeStore.js";

  import {
    loadStoredToken,
    validateToken,
    saveToken,
  } from "./services/githubToken.js";

  import {
    checkSkyGitRepoExists,
    createSkyGitRepo,
    streamPersistedReposFromGitHub,
  } from "./services/githubApi.js";

  import { syncState } from "./stores/syncStateStore.js";
  import { discoverAllRepos } from "./services/githubRepoDiscovery.js";
  import { initializeSettings } from "./services/startupService.js";

  import LoginWithPAT from "./components/LoginWithPAT.svelte";
  import RepoConsent from "./components/RepoConsent.svelte";
  import Home from "./routes/Home.svelte";
  import Settings from "./routes/Settings.svelte";
  import Repos from "./routes/Repos.svelte";

  let token, user;
  let loginError = "";

  // Redirect on logout
  authStore.subscribe((auth) => {
    if (!auth.isLoggedIn) {
      currentRoute.set("login");
      token = null;
      user = null;
    }
  });

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
      initializeRepoState();
    } else {
      currentRoute.set("consent");
    }
  }

  async function approveRepo() {
    await createSkyGitRepo(token);
    currentRoute.set("home");
    initializeRepoState();
  }

  function rejectRepo() {
    localStorage.removeItem("skygit_token");
    currentRoute.set("login");
  }

  async function initializeRepoState() {
    try {
      try {
        console.log("[SkyGit] Loading config and secrets...");
        await initializeSettings(token);
      } catch (e) {
        console.warn("[SkyGit] Failed to load config and secrets...");
      }

      console.log("[SkyGit] Syncing saved repos...");
      await streamPersistedReposFromGitHub(token);
    } catch (e) {
      console.warn("[SkyGit] Failed to stream stored repos:", e);
    }
  }

  // Trigger background discovery
  $: if (
    $currentRoute === "home" &&
    $syncState.phase === "done" &&
    !$syncState.paused
  ) {
    try {
      discoverAllRepos(token);
    } catch (e) {
      console.warn("[SkyGit] Repo discovery failed:", e);
    }
  }
</script>

{#if $currentRoute === "loading"}
  <p class="text-center mt-20">Loading...</p>
{:else if $currentRoute === "login"}
  <LoginWithPAT onSubmit={loginWithToken} error={loginError} />
{:else if $currentRoute === "consent"}
  <RepoConsent onApprove={approveRepo} onReject={rejectRepo} />
{:else if $currentRoute === "settings"}
  <Settings />
{:else if $currentRoute === "repos"}
  <Repos />
{:else}
  <Home />
{/if}

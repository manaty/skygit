<script>
    import { onMount } from "svelte";
    import { authStore } from "./stores/authStore.js";
  
    import {
      loadStoredToken,
      validateToken,
      saveToken
    } from "./services/githubToken.js";
  
    import {
      checkSkyGitRepoExists,
      createSkyGitRepo,
      streamPersistedReposFromGitHub
    } from "./services/githubApi.js";
  
    import { syncState } from "./stores/syncStateStore.js";
    import { discoverAllRepos } from "./services/githubRepoDiscovery.js";
  
    import LoginWithPAT from "./components/LoginWithPAT.svelte";
    import RepoConsent from "./components/RepoConsent.svelte";
    import Home from "./routes/Home.svelte";
  
    let state = "loading"; // 'login', 'consent', 'home'
    let token, user;
    let loginError = "";
  
    // Automatically return to login screen when logging out
    authStore.subscribe((auth) => {
      if (!auth.isLoggedIn) {
        state = "login";
        token = null;
        user = null;
      }
    });
  
    // Run on page load
    onMount(() => {
      const stored = loadStoredToken();
      if (stored) loginWithToken(stored);
      else state = "login";
    });
  
    // Main login flow
    async function loginWithToken(t) {
      loginError = "";
  
      const validatedUser = await validateToken(t);
      if (!validatedUser) {
        localStorage.removeItem("skygit_token");
        loginError = "Invalid token. Please check your PAT and try again.";
        state = "login";
        return;
      }
  
      token = t;
      user = validatedUser;
      saveToken(t);
      authStore.set({ isLoggedIn: true, token, user });
  
      const hasRepo = await checkSkyGitRepoExists(token, user.login);
  
      if (hasRepo) {
        state = "home"; // ✅ show UI immediately
        initializeRepoState(); // ✅ background repo sync
      } else {
        state = "consent";
      }
    }
  
    async function approveRepo() {
      await createSkyGitRepo(token);
      state = "home";
      initializeRepoState(); // start streaming after repo is created
    }
  
    function rejectRepo() {
      localStorage.removeItem("skygit_token");
      state = "login";
    }
  
    async function initializeRepoState() {
      try {
        await streamPersistedReposFromGitHub(token);
        console.log("[SkyGit] Streaming saved repos...");
      } catch (e) {
        console.warn("[SkyGit] Failed to stream stored repos:", e);
      }
    }
  
    // When repo loading is done and not paused, start GitHub repo discovery
    $: if (state === "home" && $syncState.phase === "done" && !$syncState.paused) {
      try {
        discoverAllRepos(token);
      } catch (e) {
        console.warn("[SkyGit] Repo discovery failed:", e);
      }
    }
  </script>
  
  {#if state === "loading"}
    <p class="text-center mt-20">Loading...</p>
  {:else if state === "login"}
    <LoginWithPAT onSubmit={loginWithToken} error={loginError} />
  {:else if state === "consent"}
    <RepoConsent onApprove={approveRepo} onReject={rejectRepo} />
  {:else if state === "home"}
    <Home />
  {/if}
  
<script>
    import { onMount } from "svelte";
    import { authStore } from "./stores/authStore.js";
    import {
        loadStoredToken,
        validateToken,
        saveToken,
    } from "./services/githubToken.js";
    import {
        checkSkyGitRepoExists,
        createSkyGitRepo,
    } from "./services/githubApi.js";

    import LoginWithPAT from "./components/LoginWithPAT.svelte";
    import RepoConsent from "./components/RepoConsent.svelte";
    import Home from "./routes/Home.svelte";

    let state = "loading"; // 'login', 'consent', 'home'
    let token, user;
    let loginError = "";

    // ⛳ Reactively switch back to login if user logs out
    authStore.subscribe((auth) => {
        if (!auth.isLoggedIn) {
            state = "login";
            token = null;
            user = null;
        }
    });

    onMount(() => {
        const stored = loadStoredToken();
        if (stored) loginWithToken(stored);
        else state = "login";
    });

    async function loginWithToken(t) {
        loginError = "";

        const validatedUser = await validateToken(t);
        if (validatedUser) {
            token = t;
            user = validatedUser;
            saveToken(t);
            authStore.set({ isLoggedIn: true, token, user });

            const hasRepo = await checkSkyGitRepoExists(token, user.login);
            state = hasRepo ? "home" : "consent";
        } else {
            localStorage.removeItem("skygit_token");
            loginError = "Invalid token. Please check your PAT and try again.";
            state = "login";
        }
    }

    async function approveRepo() {
        await createSkyGitRepo(token);
        state = "home";
    }

    function rejectRepo() {
        localStorage.removeItem("skygit_token");
        state = "login";
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

<script>
    import { authStore } from "../stores/authStore.js";
    import { logoutUser } from "../stores/authStore.js";
    import { clickOutside } from "../utils/clickOutside.js";
    import { onMount } from "svelte";

    let user = null;
    let menuOpen = false;
    let search = "";

    authStore.subscribe((auth) => {
        user = auth.user;
    });

    function toggleMenu() {
        menuOpen = !menuOpen;
    }

    function closeMenu() {
        menuOpen = false;
    }
    function openSettings() {
        alert("Settings clicked (TODO)");
    }

    function openHelp() {
        alert("Help clicked (TODO)");
    }
</script>

<div class="sidebar p-4 relative">
    <!-- User Info -->
    <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-3">
            {#if user?.avatar_url}
                <img class="avatar" src={user.avatar_url} alt="avatar" />
            {/if}
            <div>
                <p class="font-semibold">{user?.name || user?.login}</p>
                <p class="text-xs text-gray-500">@{user?.login}</p>
            </div>
        </div>
        <button
            on:click={toggleMenu}
            class="text-gray-500 hover:text-gray-700 text-lg font-bold"
            >⋯</button
        >
        {#if menuOpen}
            <div class="menu" use:clickOutside={closeMenu}>
                <button on:click={openSettings}>Settings</button>
                <button on:click={openHelp}>Help</button>
                <hr />
                <button on:click={logoutUser} class="text-red-600 font-semibold"
                    >Log out</button
                >
            </div>
        {/if}
    </div>

    <!-- Search -->
    <input
        type="text"
        bind:value={search}
        placeholder="Search repos, people..."
        class="w-full border border-gray-300 rounded px-3 py-2 text-sm mb-4"
    />

    <!-- Placeholder repo list -->
    <div class="space-y-2">
        <p class="text-sm text-gray-500 uppercase tracking-wide">Repos</p>
        <div class="bg-gray-100 hover:bg-gray-200 p-2 rounded cursor-pointer">
            github.com/user/project-a
        </div>
        <div class="bg-gray-100 hover:bg-gray-200 p-2 rounded cursor-pointer">
            github.com/user/project-b
        </div>
        <div class="bg-gray-100 hover:bg-gray-200 p-2 rounded cursor-pointer">
            github.com/user/awesome-lib
        </div>
    </div>
</div>

<style>
    .sidebar {
        width: 300px;
        min-width: 250px;
        max-width: 350px;
        height: 100vh;
        border-right: 1px solid #e5e7eb; /* Tailwind gray-200 */
        background-color: white;
        display: flex;
        flex-direction: column;
    }

    .avatar {
        width: 40px;
        height: 40px;
        border-radius: 9999px;
    }

    .menu {
        position: absolute;
        top: 50px;
        right: 10px;
        background-color: white;
        border: 1px solid #ddd;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
        border-radius: 4px;
        z-index: 10;
    }

    .menu button {
        padding: 8px 12px;
        width: 100%;
        text-align: left;
    }

    .menu button:hover {
        background-color: #f3f4f6; /* Tailwind gray-100 */
    }
</style>

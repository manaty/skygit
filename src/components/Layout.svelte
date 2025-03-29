<script>
    import Sidebar from "./Sidebar.svelte";
    import { authStore } from "../stores/authStore.js";
    import { onMount } from "svelte";

    let sidebarVisible = false;

    function handleSidebarToggle(event) {
        sidebarVisible = event.detail.open;
    }

    let user = null;
    authStore.subscribe((auth) => {
        user = auth.user;
    });

    onMount(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                sidebarVisible = false;
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    });
</script>

<div class="layout">
    <!-- Mobile menu toggle -->
    <div class="p-2 md:hidden">
        {#if !sidebarVisible}
            <button
                class="p-2 text-gray-700 text-xl rounded bg-white shadow"
                aria-label="Open sidebar"
                on:click={() => (sidebarVisible = true)}
            >
                ←
            </button>
        {/if}
    </div>

    <!-- Sidebar: always shown on desktop, toggled on mobile -->
    <!-- Sidebar: always shown on desktop, toggled on mobile -->
    <div
        class="sidebar md:block"
        class:hidden={!sidebarVisible}
        class:open={sidebarVisible}
    >
        <Sidebar on:toggle={handleSidebarToggle} />
    </div>

    <!-- Main panel: hidden on mobile if sidebar is visible -->
    <div class="main w-full" class:hidden={sidebarVisible}>
        <slot />
    </div>
</div>

<style>
    .layout {
        display: flex;
        height: 100vh;
        overflow: hidden;
    }

    .sidebar {
        flex-shrink: 0;
        height: 100%;
    }

    .main {
        flex-grow: 1;
        overflow-y: auto;
        padding: 24px;
        transition: all 0.3s ease;
        margin-top: 0.5rem; /* optional to push below the button */
    }

    /* Desktop width */
    @media (min-width: 768px) {
        .sidebar {
            width: 300px;
            max-width: 350px;
            min-width: 250px;
        }
    }

    /* Mobile slide-in behavior */
    @media (max-width: 768px) {
        .sidebar {
            position: absolute;
            z-index: 50;
            top: 0;
            left: 0;
            height: 100%;
            width: 100%;
            background-color: rgba(255, 0, 0, 0.1);
            transform: translateX(-100%);
            transition: transform 0.3s ease-in-out;
        }

        .sidebar.open {
            transform: translateX(0);
        }
    }
</style>

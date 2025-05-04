<script>
	const { children } = $props();

	let left = $state(100);
	let top = $state(100);

	let moving = $state(false);

	function onMouseDown() {
		moving = true;
	}

	function onMouseMove(e) {
		if (moving) {
			left += e.movementX;
			top += e.movementY;
		}
	}

	function onMouseUp() {
		moving = false;
	}
</script>

<section
	on:mousedown={onMouseDown}
	style="left: {left}px; top: {top}px;"
	class="draggable"
>
	{@render children()}
</section>

<svelte:window on:mouseup={onMouseUp} on:mousemove={onMouseMove} />

<style>
	.draggable {
		user-select: none;
		cursor: move;
		position: absolute;
	}
</style>

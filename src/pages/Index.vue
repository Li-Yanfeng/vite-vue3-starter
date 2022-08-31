<script setup lang="ts">
const { isDark, toggleDark } = useDarks()

const theme = computed(() => (isDark.value ? 'dark' : 'light'))

const counter = createCounter()
</script>

<template>
    <div class="m-6">Hello，This is the tov template！！</div>
    <div class="cursor-pointer m-6" @click="toggleDark()">theme: {{ theme }}</div>

    <div class="cursor-pointer mt-6 ml-6">
        <div @click="counter.inc()">counter: {{ counter.count }}</div>
    </div>
</template>

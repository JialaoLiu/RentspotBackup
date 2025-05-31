<template>
  <a
    :href="href"
    :class="[props.class, { 'router-link-active': isActive }]"
    @click="handleClick"
  >
    <slot></slot>
  </a>
</template>

<script setup>
import { computed, inject } from 'vue';

const props = defineProps({
  to: {
    type: [String, Object],
    required: true
  },
  class: {
    type: String,
    default: ''
  }
});

const router = inject('router');
const route = inject('route');

const href = computed(() => {
  if (typeof props.to === 'string') {
    return props.to;
  }
  // Handle object format { name: 'RouteName', params: {...}, query: {...} }
  if (props.to.name === 'RentPage' && props.to.params?.id) {
    return `/rentpage/${props.to.params.id}`;
  }
  return '/';
});

const isActive = computed(() => {
  return route.value.path === href.value;
});

const handleClick = (event) => {
  event.preventDefault();
  router.push(href.value);
};
</script>

<style scoped>
.router-link-active {
  /* prevent error */
  all: initial;
}
</style>
<template>
  <form>
    <label for="username">Enter a user name</label>
    <input v-model="userName" id="username"/>
    <button @click.prevent="createUser(userName)">Create user</button>
  </form>
</template>

<script>
/* eslint-disable */
import { get, post } from '../rest';

export default {
  name: 'login-view',
  props: {
    user: Object,
  },
  data() {
    return {
      userName: '',
    };
  },
  methods: {
    createUser(userName) {
      post('user', { username: userName }).then(response => {
        if (response.id) {
          localStorage.setItem('userId', response.id)
        }
        /**
         * `user` event emits the user
         **/
        this.$emit('user', response);
      });
    },
  },
}
</script>

<style>
  label {
    display: block;
    font-size: 1.5em;
  }

  input,
  button {
    font-size: 2rem;
    padding: 1rem;
  }
</style>

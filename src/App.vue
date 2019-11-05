<template>
  <div id="app" class="breadmarket">
    <login-view
      v-if="!user.id"
      @user="user = $event"
    />
    <bread-market
      v-else
      :user="user"
    />
  </div>
</template>

<script>
/* eslint-disable */
  // TODO: import `get` and `post` from rest.js
  import { get, post } from './rest';
  import LoginView from './views/login.vue';
  import BreadMarket from './views/market.vue';
  import UserMixin from './mixins/user';

  export default {
    name: 'App',
    components: {
      LoginView,
      BreadMarket,
    },
    mixins: [
      UserMixin,
    ],
    data() {
      return {
        userName: '',
        user: {},
      };
    },
    mounted() {
      //TODO: See if we have a user in localStorage and run updateUser with that ID
      const userId = localStorage.getItem('userId');
      if (userId) {
        this.updateUser(userId);
      }
    },
  };
</script>

<style
  lang="scss"
>
  .breadmarket {
    font-family: "Avenir", Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;

    .small-font {
      font-size: .8em;
      color: gray;
    }

    .credits {
      color: #5c5;
      font-size: 1.2em;
      font-weight: bold;
    }

    .scroll-wrapper {
      max-height: 55vh;
      overflow: auto;
      padding-top: 1rem;
      padding-bottom: 1rem;
      box-shadow: inset 0px 10px 20px -10px rgba(0,0,0, .05),
      inset 0px -10px 20px -10px rgba(0,0,0, .05);
    }

    .table {
      th, td {
        padding-left: 1rem;
        padding-right: 1rem;
      }
      td:last-child {
        text-align: right;
      }
      tr:not(:first-child):hover {
        background-color: aliceblue;
        cursor: pointer;
      }
      &.items tr:hover td {
        background-color: lightgoldenrodyellow;
      }
    }

    .tables-container {
      display: flex;
      justify-content: center;

      & > :not(:last-child) {
        margin-right: 4rem;
      }
    }

    .timer {
      margin: 4rem 12%;
      border-top: 1px dashed #dadada;
      padding: 1rem 0;
      border-bottom: 1px dashed #dadada;
    }

  }
</style>

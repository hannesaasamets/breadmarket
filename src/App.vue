<template>
  <div id="app">
    <div v-if="!user.id">
      <label for="username">Enter a user name</label>
      <input v-model="userName" id="username"/>
      <button @click="createUser()">createUser</button>
    </div>
    <div v-else>
      Hello, {{ user.name }}!

      <div style="display: flex;">
        <div>
          <h2>Bread market</h2>
          <table class="table" style="text-align: left">
            <tr>
              <th>Qty</th>
              <th>Bread</th>
              <th>Price</th>
            </tr>
            <tr
              v-for="(bread, index) in breads"
              :key="index"
              @click="buy(bread)"
            >
              <td>{{ bread.qty }}</td>
              <td>{{ bread.name }}</td>
              <td>{{ bread.price }} €</td>
            </tr>
          </table>
        </div>
        <div>
          <h2>Your items</h2>
          <table class="table" style="text-align: left">
            <tr>
              <th>Qty</th>
              <th>Bread</th>
              <th>Price</th>
            </tr>
            <tr v-for="(bread, index) in user.items" :key="index">
              <td>{{ bread.qty }}</td>
              <td>{{ bread.name }}</td>
              <td>{{ bread.price }} €</td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable */
  import HelloWorld from './components/HelloWorld';

  export default {
    name: 'App',
    components: {
      HelloWorld,
    },
    data() {
      return {
        userName: 'jj',
        source: 'http://localhost:3333',
        user: {},
        breads: [],
      };
    },
    mounted() {
      const userId = localStorage.getItem('userId');
      if (userId) this.fetchUser(userId);
      this.get('breads', res => this.breads = res);
    },
    methods: {
      createUser() {
        this.post(
          'user',
          { username: this.userName },
          res => {
            this.user = res;
            if (res.id) localStorage.setItem('userId', res.id);
          },
        );
      },
      fetchUser(id) {
        this.get(
          'user/' + id,
          res => this.user = res
        );
      },
      buy(bread) {

      },
      post(target, requestBody, responseHandler) {
        fetch(this.source + '/' + target,
          {
            method: 'post', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, cors, *same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody), // body data type must match "Content-Type" header
          },
        )
          .then(stream => stream.json())
          .then(responseHandler)
          .catch(error => console.error(error));
      },
      get(target, responseHandler) {
        fetch(this.source + '/' + target)
          .then(stream => stream.json())
          .then(responseHandler)
          .catch(error => console.error(error));
      },
    },
  };
</script>

<style lang="scss">
  #app {
    font-family: "Avenir", Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;

    input, button {
      font-size: 2rem;
      padding: 1rem;
    }

    .table {
      tr:hover td {
        background-color: aliceblue;
        cursor: pointer;
      }
    }
  }
</style>

<template>
  <div id="app">
    <div v-if="!user.id">
      <label for="username">Enter a user name</label>
      <input v-model="userName" id="username"/>
      <button @click="createUser()">createUser</button>
    </div>
    <div v-else>
      <p>Hello, {{ user.name }}!</p>

      <div class="tables-container">
        <div>
          <h2>Bread market</h2>
          <p class="small-font">Click on an item to buy</p>
          <div class="scroll-wrapper">
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
                <td>{{ formatFinancial(bread.price) }} €</td>
              </tr>
            </table>
          </div>
        </div>
        <div>
          <h2>Your items</h2>
          <p class="small-font">Click on an item to sell</p>
          <div class="scroll-wrapper">
            <table class="table items" style="text-align: left">
              <tr>
                <th>Qty</th>
                <th>Bread</th>
                <th>Price</th>
              </tr>
              <tr
                v-for="(myBread, index) in myItems"
                :key="index"
                @click="sell(myBread)"
              >
                <td>{{ myBread.qty }}</td>
                <td>{{ myBread.name }}</td>
                <td>{{ myBread.price }} €</td>
              </tr>
            </table>
          </div>
          <p class="credits">You have {{ formatFinancial(user.credits) }} €</p>
        </div>
      </div>
      <p class="timeLeft" :style="timeLeftStyles">
        The market day ends in {{ secondsRemaining }} seconds</p>
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
        nextUpdate: Number,
        secondsRemaining: 59,
      };
    },
    mounted() {
      const userId = localStorage.getItem('userId');
      if (userId) this.updateUser(userId);
      this.updateBreads();

      const timer = setInterval(() => {
        const now = new Date().getTime();
        this.secondsRemaining = -Math.round((now - this.nextUpdate) / 1000);
        if (this.secondsRemaining <= 0) {
          this.updateBreads();
        }
      }, 200);
    },
    methods: {
      formatFinancial(price) {
        return Number.parseFloat(price).toFixed(2);
      },
      createUser() {
        this.post(
          'user',
          { username: this.userName },
        ).then(res => {
          this.user = res;
          if (res.id) localStorage.setItem('userId', res.id);
        });
      },
      updateUser(id) {
        this.get('user/' + id).then(res => this.user = res);
      },
      updateBreads() {
        this.get('breads').then(res => {
          const now = new Date().getTime();
          this.nextUpdate = now + res.nextUpdate;
          this.breads = res.breads;
        });
      },
      //TODO: if item is out of stock, don't fetch
      buy(bread) {
        this.post(
          'buy',
          {
            "userId": this.user.id, // The name of the user making the purchase
            "purchases": [
              {
                "id": bread.id, // ID of bread
                "qty": 1, // How much of the bread you wish to buy
              },
            ],
          },
        ).then(res => {
          res.purchases.forEach(purhcasedItem => this.breads.find(bread => bread.id === purhcasedItem.id).qty = purhcasedItem.qty);
          this.updateUser(this.user.id)
        });
      },
      sell(bread) {
        this.post(
          'sell',
          {
            "userId": this.user.id, // The name of the user making the purchase
            "id": bread.id, // ID of bread
            "qty": 1, // How much of the bread you wish to sell
          },
          //TODO: sell returns user, so update it with the return value here
        ).then(res => {
          this.user.credits = res.credits;
          this.user.items = res.items;
          this.updateBreads()
        });
      },
      // TODO: move get and post to a rest module and make them return the promise or error
      post(target, requestBody) {
        return fetch(this.source + '/' + target,
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
          .catch(error => console.error(error));
      },
      get(target) {
        return fetch(this.source + '/' + target)
          .then(stream => stream.json())
          .catch(error => console.error(error));
      },
    },
    computed: {
      myItems() {
        if (this.breads.length && this.user.items) {
          return this.user.items.map(myBread => {
            const bread = this.breads.find(bread => bread.id === myBread.id);
            return {
              qty: myBread.qty,
              name: bread.name,
              price: this.formatFinancial(bread.price),
              id: bread.id,
            }
          });
        }
      },
      timeLeftStyles() {
        if (this.secondsRemaining < 10) {
          // TODO: tween the red
          return { color: 'rgb(255, 0, 0)' };
        }
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

    .timeLeft {
      margin: 4rem 12%;
      border-top: 1px dashed #dadada;
      padding: 1rem 0;
      border-bottom: 1px dashed #dadada;
    }

  }
</style>

<template>
  <div id="app" class="breadmarket">
    <form v-if="!user.id">
      <label for="username">Enter a user name</label>
      <input v-model="userName" id="username"/>
      <button @click="createUser()">Create user</button>
    </form>
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
      <p class="timer" :style="timeLeftStyles">
        The market day ends in {{ secondsRemaining }} seconds</p>
    </div>
  </div>
</template>

<script>
/* eslint-disable */
  import { get, post } from './rest.js';

  export default {
    name: 'App',
    data() {
      return {
        userName: '',
        user: {},
        breads: [],
        nextUpdate: Number,
        secondsRemaining: 59,
        timer: null,
      };
    },
    mounted() {
      const userId = localStorage.getItem('userId');
      if (userId) this.updateUser(userId);
      this.updateBreads();

      this.timer = setInterval(() => {
        const now = new Date().getTime();
        this.secondsRemaining = -Math.round((now - this.nextUpdate) / 1000);
        if (this.secondsRemaining <= 0) {
          this.updateBreads();
        }
      }, 200);
    },
    beforeDestroy() {
      clearInterval(this.timer);
    },
    methods: {
      formatFinancial(price) {
        return Number.parseFloat(price).toFixed(2);
      },
      createUser() {
        post('user', { username: this.userName }).then(res => {
          this.user = res;
          if (res.id) {
            localStorage.setItem('userId', res.id)
          }
        });
      },
      updateUser(id) {
        get('user/' + id).then(res => this.user = res);
      },
      updateBreads() {
        get('breads').then(res => {
          const now = new Date().getTime();
          this.nextUpdate = now + res.nextUpdate;
          this.breads = res.breads;
        });
      },
      //TODO: if item is out of stock, don't fetch
      buy(bread) {
        post(
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
        post(
          'sell',
          {
            "userId": this.user.id, // The name of the user making the purchase
            "id": bread.id, // ID of bread
            "qty": 1, // How much of the bread you wish to sell
          },
        ).then(res => {
          //TODO: sell returns user, so update it with the return value here
          this.user.credits = res.credits;
          this.user.items = res.items;
          this.updateBreads()
        });
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
        // TODO: tween the red
        if (this.secondsRemaining < 10) {
          const percent = (10 - this.secondsRemaining) / 10;
          const startRGB = [44, 62, 80];
          const endRGB = [255, 0, 0];
          const curRGB = startRGB.map((c, index) => c + (endRGB[index] - c) * percent );
          return { color: `rgb(${curRGB.join(',')})` };
        }
      },
    },
  };
</script>

<style lang="scss">
  .breadmarket {
    font-family: "Avenir", Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;

    label {
      display: block;
      font-size: 1.5em;
    }

    input,
    button {
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

    .timer {
      margin: 4rem 12%;
      border-top: 1px dashed #dadada;
      padding: 1rem 0;
      border-bottom: 1px dashed #dadada;
    }

  }
</style>

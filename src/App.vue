<template>
  <div id="app" class="breadmarket">
    <form v-if="!user.id">
      <label for="username">Enter a user name</label>
      <input v-model="userName" id="username"/>
      <button @click="createUser(userName)">Create user</button>
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
                <!-- display user items -->
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
  // TODO: import `get` and `post` from rest.js

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
      //TODO: See if we have a user in localStorage and run updateUser with that ID

      //TODO: update the list of breads when the app starts

      this.timer = setInterval(() => {
        const now = new Date().getTime();
        this.secondsRemaining = -Math.round((now - this.nextUpdate) / 1000);

        // TODO: Get the list of breads upon a new day
      }, 200);
    },
    beforeDestroy() {
      clearInterval(this.timer);
    },
    methods: {
      formatFinancial(price) {
        // format a number to two decimal points, returns a String
        return Number.parseFloat(price).toFixed(2);
      },
      createUser(userName) {
        post('user', { username: userName }).then(response => {
          this.user = response;
          if (response.id) {
            localStorage.setItem('userId', response.id)
          }
        });
      },
      updateUser(id) {
        get('user/' + id).then(response => this.user = response);
      },
      updateBreads() {
        get('breads').then(response => {
          const now = new Date().getTime();
          this.nextUpdate = now + response.nextUpdate;
          this.breads = response.breads;
        });
      },
      buy(bread) {
        //TODO: if item is out of stock, don't fetch

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
        ).then(response => {
          response.purchases.forEach(purhcasedItem => this.breads.find(bread => bread.id === purhcasedItem.id).qty = purhcasedItem.qty);
          this.updateUser(this.user.id)
        });
      },
      sell(bread) {
        post(
          'sell',
          {
            "userId": this.user.id, // The id of the user making the purchase
            "id": bread.id, // ID of bread
            "qty": 1, // How much of the bread you wish to sell
          },
        ).then(response => {
          //TODO: "sell" request returns the updated user info, so update the local value
          //TODO: "sell" does not return the new market situation, so we need to fetch all the breads
        });
      },
    },
    computed: {
      myItems() {
        // if the user has items and the list of breads is available
        if (this.breads.length && this.user.items) {
          // iterate over every item of the user
          return this.user.items.map(myBread => {
            // the user bread (myBread) contains just the id,
            // so find the full info for that bread from the full list of breads
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
        // TODO: show red when less than 10 seconds remaining
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

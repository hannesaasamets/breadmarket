<template>
  <div>
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
              <td>{{ myBread.qty }}</td>
              <td>{{ myBread.name }}</td>
              <td>{{ myBread.price }}</td>
            </tr>
          </table>
        </div>
        <p class="credits">You have {{ formatFinancial(user.credits) }} €</p>
      </div>
    </div>
    <p class="timer" :style="timeLeftStyles">
      The market day ends in {{ secondsRemaining }} seconds</p>
  </div>
</template>

<script>
import UserMixin from './mixins/user';

/* eslint-disable */
export default {
  name: 'bread-market',
  props: {
    user: Object,
  },
  mixins: [
    UserMixin,
  ],
  data() {
    return {
      someVar: 123,
      breads: [],
      nextUpdate: Number,
      secondsRemaining: 59,
      timer: null,
    };
  },
  mounted() {
    //TODO: update the list of breads when the app starts
    this.updateBreads();

    this.timer = setInterval(() => {
      const now = new Date().getTime();
      this.secondsRemaining = -Math.round((now - this.nextUpdate) / 1000);

      // TODO: Get the list of breads upon a new day
      this.updateBreads();
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
        this.user.items = response.items;
        this.user.credits = response.credits;

        //TODO: "sell" does not return the new market situation, so we need to fetch all the breads
        this.updateBreads();
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
      if (this.secondsRemaining <= 50) {
        return 'color: red';
      }
    },
  },
}
</script>

/**
 * @mixin
 */
export default {
  methods: {
    updateUser(id) {
      get('user/' + id)
        .then(response =>
          this.user = response
        );
    },
  }
}

/* eslint-disable */
const base_url = 'http://localhost:3333';

export function post(target, requestBody) {
  return fetch(base_url + '/' + target,
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
}

export function get(target) {
  return fetch(base_url + '/' + target)
    .then(stream => stream.json())
    .catch(error => console.error(error));
}

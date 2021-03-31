const axios   = require('axios');

module.exports = async function() {
    let url = `http://localhost:1337/conditions`;

    return axios.get(url)
      .then(function (response) {
          return response.data;
      })
      .catch(function(error) {
          console.log(error);
      });
}
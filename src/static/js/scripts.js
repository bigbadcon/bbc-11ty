/* -------------------------------------------------------------------------- */
/*                              Helper functions                              */
/* -------------------------------------------------------------------------- */

function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .normalize('NFD') // separate accent from letter
        .replace(/[\u0300-\u036f]/g, '') // remove all separated accents
        .replace(/\s+/g, '-') // replace spaces with dash
        .replace(/&/g, '-and-') // replace & with 'and'
        .replace(/[^\w-]+/g, '') // remove all non-word chars
        .replace(/--+/g, '-') // replace multiple dash with single
}

/* -------------------------------------------------------------------------- */
/*                                    Auth                                    */
/* -------------------------------------------------------------------------- */

function alertMsg(msg = 'error') {
    // TODO add onscreen toast message for failed login
    console.log(msg)
}

const apiUrl = "https://bigbadcon.com:8091/apidev/"

function authData() {
    return {
        async submitLogin() {
            const data = {
                username: this.username,
                password: this.password
            }
            console.log(apiUrl + "login", data);
            try {
              const res = await axios.post(apiUrl + "login", data)
              if (res.status === 200 && res.headers.authorization) {
                // loginUser(res.headers.authorization)
                alertMsg(`login successful ${res.headers.authorization}`)
              } else {
                alertMsg(`login failed, status: ${res.status}`)
              }
            } catch (err) {
              alertMsg(`login failed, error: ${err}`)
            }
        },
        username: "",
        password: ""
    }
}

function registerData() {
    return {
        username: "",
        email: ""
    }
}
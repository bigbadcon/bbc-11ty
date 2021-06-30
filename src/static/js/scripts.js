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
/*                        LocalStorage Helper Functions                       */
/* -------------------------------------------------------------------------- */

function setLSWithExpiry(key, value, ttl) {
  const now = new Date()

  // `item` is an object which contains the original value
  // as well as the time when it's supposed to expire (now + time in milliseconds)
  const item = {
    value: value,
    expiry: now.getTime() + ttl,
  }
  localStorage.setItem(key, JSON.stringify(item))
}

function getLSWithExpiry(key) {
  const itemStr = localStorage.getItem(key)
  // if the item doesn't exist, return null
  if (!itemStr) {
    return null
  }
  const item = JSON.parse(itemStr)
  const now = new Date()
  // compare the expiry time of the item with the current time
  if (now.getTime() > item.expiry) {
    // If the item is expired, delete the item from storage
    // and return null
    localStorage.removeItem(key)
    return null
  }
  return item.value
}

/* -------------------------------------------------------------------------- */
/*                                    Auth                                    */
/* -------------------------------------------------------------------------- */

// Note apiBaseUrl is coming from the html_head allowing it to switch between dev and prod versions

function alertMsg(msg = 'error') {
    // TODO add onscreen toast message for failed login
    console.log(msg)
}

/* -------------------------------------------------------------------------- */
/*                                Alpine Store                                */
/* -------------------------------------------------------------------------- */

document.addEventListener('alpine:initializing', () => {
  const lsToken = getLSWithExpiry('authToken') || null
  const lsUser = getLSWithExpiry('user') || null

  Alpine.store('theme', {
    theme: "auto",
    setTheme(theme) {
      this.theme = theme
      window.localStorage.setItem('darkmode',theme)
    },
    getTheme() {
      const theme = window.localStorage.getItem('darkmode')
      if (theme) this.theme = theme
    }
  });

  Alpine.store('auth', {
      token: lsToken,
      isAuth: (lsToken),
      user: lsUser,
      async submitLogin(data) {
        // data is formatted as {username: 'username', password: 'password'}
        try {
          const res = await axios.post(apiBaseUrl + "login", data)
          if (res.status === 200 && res.headers.authorization) {
            this.token = res.headers.authorization;
            this.isAuth = true;
            setLSWithExpiry('authToken', this.token, 86400000)
            alertMsg(`login successful`);
            this.getUserData(this.token);
          } else {
            alertMsg(`login failed, status: ${res.status}`)
          }
        } catch (err) {
          alertMsg(`login failed, error: ${err}`)
        }
      },
      logout() {
        this.isAuth = false;
        this.user = false;
        this.token = null;
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
      },
      async getUserData(token) {
        token = token || this.token;
        try {
          const config = { headers: { Authorization: token } }
          const res = await axios.get(apiBaseUrl + 'users/me', config)
          if (res.status === 200) {
            alertMsg(`user data fetched`)
            this.user = res.data
            alertMsg(`fetch user data successful for ${res.data.userNicename}`)
            setLSWithExpiry('user', res.data, 86400000);
          } else {
            alertMsg(`get user data failed, status: ${res.status}`)
          }
        } catch (err) {
          alertMsg(`get user data failed, error: ${err}`)
        }
      }
  })
})
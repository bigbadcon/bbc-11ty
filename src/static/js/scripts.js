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
  console.log("🚀 ~ file: scripts.js ~ line 23 ~ setLSWithExpiry ~ value", key, value)
  ttl = ttl || 86400000 // one day
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

function getAuthToken() {
  return getLSWithExpiry('authToken')
}
function setAuthToken(token) {
  return setLSWithExpiry('authToken', token)
}

/* -------------------------------------------------------------------------- */
/*                            Misc Functions                                  */
/* -------------------------------------------------------------------------- */

// Note apiBaseUrl is coming from the html_head allowing it to switch between dev and prod versions

// TODO: make alert toast
function alertMsg(msg = 'error') {
    // TODO add onscreen toast message for failed login
    console.log(msg)
}

/* ------------ Transform metadata from events to a keyed object ------------ */
function metadataArrayToObject(arr) {
  const object = arr.reduce(function(result, item, index, array) {
    result[item.metaKey] = item.metaValue;
    return result;
  }, {});
  return object
}

/* -------------------------------------------------------------------------- */
/*                                Alpine Stuff                                */
/* -------------------------------------------------------------------------- */

// TODO: refactor this a bit. Need token available more globally. Also need some of the stores to have init for data

document.addEventListener('alpine:init', () => {

  /* -------------------------------------------------------------------------- */
  /*                             API Fetch Functions                            */
  /* -------------------------------------------------------------------------- */

  const api = {
    getEvent: async (id) => {
      const config = { headers: { Authorization: getAuthToken() } }
      const params = { id: id }
      try {
        const res = await axios.post(apiBaseUrl + 'events/find', params, config)
        const data = await {...res.data, metadata: metadataArrayToObject(res.data.metadata)}
        return data
      } catch (err) {
        alertMsg(`get event #${id} failed, error: ${err}`)
        return null
      }
    },
    getFavEvents: async () => {
      const config = { headers: { Authorization: getAuthToken() } }
      try {
        const res = await axios.get(apiBaseUrl + 'events/me/favorites', config);
        const data = await res.data
        return data.map(item => { return { eventId: item.eventId } })
        // TODO: get Jerry to change to just a list of ids?
      } catch (err) {
        alertMsg(`get user fav events failed, error: ${err}`)
        return null
      }
    },
    getBookedEvents: async () => {
      const config = { headers: { Authorization: getAuthToken() } }
      try {
        const res = await axios.get(apiBaseUrl + 'events/me', config);
        const data = await res.data
        console.log("user events", data);
        const asyncResult = await Promise.all(data.map( async eventId => {
          const eventData = await api.getEvent(eventId)
          return {eventId: eventId, eventName: eventData.eventName}
        }))
        console.log("🚀 ~ file: scripts.js ~ line 130 ~ getBookedEvents: ~ asyncResult", asyncResult)
        return asyncResult
      } catch (err) {
        alertMsg(`get booked events failed, error: ${err}`)
        return null
      }
    },
    getUserData: async () => {
      // contains { displayName, userNicename }
      try {
        const config = { headers: { Authorization: getAuthToken() } }
        const res = await axios.get(apiBaseUrl + 'users/me', config)
        console.log("🚀 ~ file: scripts.js ~ line 143 ~ getUserData: ~ res", res)
        if (res.status === 200) {
          return res.data
        } else {
          alertMsg(`get user data failed, status: ${res.status}`)
        }
      } catch (err) {
        alertMsg(`get user data failed, error: ${err}`)
      }
    },
    submitLogin: async (username, password) => {
      try {
        const res = await axios.post(apiBaseUrl + "login", { username: username, password: password })
        if (res.status === 200 && res.headers.authorization) {
          const token = res.headers.authorization
          return token
        } else {
          alertMsg(`login failed, status: ${res.status}`)
        }
      } catch (err) {
        alertMsg(`login failed, error: ${err}`)
      }
    },
  }

  /* -------------------------------------------------------------------------- */
  /*                                Alpine Stores                               */
  /* -------------------------------------------------------------------------- */

  /* -------------------------- Light/Dark/Auto Theme ------------------------- */

  Alpine.store('theme', {
    theme: "auto",
    setTheme(theme) {
      this.theme = theme;
      setLSWithExpiry('theme', theme)
    },
    getTheme() {
      const theme = getLSWithExpiry('theme')
      if (theme) this.theme = theme
      // console.log("theme:", this.theme);
    }
  });

  Alpine.store('panel', {
    isFlipped: false,
    flip() { 
      console.log("flip panel");
      this.isFlipped = !this.isFlipped 
    }
  });

  /* ---------------------------- Auth Store --------------------------- */
  // ALl data for logged in users

  // TODO: add alert for failed password
  Alpine.store('auth', {
    async init() {
      const token = getAuthToken()
      this.isAuth = (typeof token === 'string')
      this.user = getLSWithExpiry('user')
      this.bookedEvents = getLSWithExpiry('bookedEvents')
      this.favEvents = getLSWithExpiry('favEvents')
      if (this.isAuth) {
        if (!this.user) this.getUserData()
        if (!this.bookedEvents) this.getBookedEvents()
        if (!this.favEvents) this.getFavEvents()
      }
    },
    // Login stuff
    username: "",
    password: "",
    email: "",
    isAuth: false,
    // User Data
    user: false,
    // User Events
    bookedEvents: [],
    favEvents: [],
    isBooked(id) {
      if (this.bookedEvents) return this.bookedEvents.some( item => item.eventId === id)
      return false
    },
    isFav(id) {
      if (this.favEvents) return this.favEvents.some( item => item.eventId === id)
      return false
    },
    // functions
    async submitLogin() {
      const token = await api.submitLogin(this.username,this.password)
      this.username = ""
      this.password = ""
      if (token) {
        setAuthToken(token)
        this.isAuth = true
        this.getUserData()
        this.getBookedEvents()
        this.getFavEvents()
      }
    },
    test(){
      console.log(this.isAuth)
    },
    async createAccount() {},
    async forgetPassword() {},
    async toggleFav() {
      // if id is faved then removeFavorite()
      // otherwise addFavorite()
      // getFavEvents() or reset locally
    },
    async bookEvent() {
      // post bookEvent()
      // if success getBookedEvents or just reset bookedEvents locally and localStorage
    },
    async cancelBooking() {
      // post cancelBooking()
      // if success getBookedEvents or just reset bookedEvents locally and localStorage
    },
    async getUserData() {
      const data = await api.getUserData()
      this.user = data
      setLSWithExpiry('user', data)
    },
    async getBookedEvents() {
      const data = await api.getBookedEvents()
      this.bookedEvents = data
      setLSWithExpiry('bookedEvents',data)
    },
    async getFavEvents() {
      const data = await api.getFavEvents()
      this.favEvents = data
      setLSWithExpiry('favEvents',data)
    },
    logout() {
      console.log("logout")
      this.isAuth = false
      this.user = null
      this.bookedEvents = null
      this.favEvents = null
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      localStorage.removeItem('favEvents')
      localStorage.removeItem('bookedEvents')
    },
  })

  /* -------------------------------------------------------------------------- */
  /*                            Alpine Component Data                           */
  /* -------------------------------------------------------------------------- */

  /* -------------------------- eventInfo panel data -------------------------- */

  // TODO: getEvent needs to be called once logged in use $watch maybe
  Alpine.data('eventInfo', () => ({
    event: {},
    maxPlayers: null,
    spaces: null,
    owner: null,
    async getEvent(id) {
      const data = await api.getEvent(id)
      this.event = data
      this.maxPlayers = parseInt(data.metadata.Players)
      this.owner = data.eventOwner.displayName
      this.spaces = parseInt(data.eventRsvp) - 1 + parseInt(data.metadata.Players)
    },
    async bookEvent() {
      // Get this working
    },
    async cancelBooking() {
      // get this working
    }
  }))

})
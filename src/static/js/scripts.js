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
/*                             dayjs event format                             */
/* -------------------------------------------------------------------------- */

function formatEventDate(date, tz = 'America/Los_Angeles') {
  return "<span style='white-space: nowrap;'>" + dayjs(date).tz(tz).format('MMM D, YYYY') + "</span> <span>" + dayjs(date).tz(tz).format('h:mm a') + "</span>"
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

function alertMsg(msg = 'error') {
    console.log(msg)
}

/* ------------ Transform metadata from events to a keyed object ------------ */
function metadataArrayToObject(arr) {
  const object = arr.reduce(function(result, item) {
    result[item.metaKey] = item.metaValue;
    return result;
  }, {});
  return object
}

/* -------------------------------------------------------------------------- */
/*                                Alpine Stuff                                */
/* -------------------------------------------------------------------------- */

document.addEventListener('alpine:init', () => {

  /* -------------------------------------------------------------------------- */
  /*                             API Fetch Functions                            */
  /* -------------------------------------------------------------------------- */

  const apiBaseUrl = "https://admin.bigbadcon.com:8091/api/"

  const api = {
    getEvent: async (id) => {
      const token = getAuthToken()
      if (!token) return null
      const config = { headers: { Authorization: token } }
      const params = { id: id }
      try {
        const res = await axios.post(apiBaseUrl + 'events/find', params, config)
        const event = res.data

        // Create Javascript date object
        const eventStartDateTime = dayjs(event.eventStartDate + "T" + event.eventStartTime + "-07:00").toDate()
        const eventEndDateTime = dayjs(event.eventEndDate + "T" + event.eventEndTime + "-07:00").toDate()
  
        const data = {...event, 
          // Convert to keyed object
          metadata: metadataArrayToObject(event.metadata),
          // strip out status 0 which are canceled attendees
          bookings: res.data.bookings.filter(booking => booking.bookingStatus === 1),
          eventStartDateTime: eventStartDateTime,
          eventEndDateTime: eventEndDateTime,
        }
        return data
      } catch (err) {
        alertMsg(`get event #${id} failed, error: ${err}`)
        return null
      }
    },
    getEventsCategory: async (category) => {
      const token = getAuthToken()
      if (!token) return null
      const config = { headers: { Authorization: token } }
      try {
        const res = await axios.get(apiBaseUrl + 'events/category/' + category, config)
        const events = res.data

        const data = events.map(event => {
          const spacesTotal = Number(event.metadata.find( m => m.metaKey === 'Players' ).metaValue)
          const bookings = event.bookings.filter(booking => booking.bookingStatus === 1).length
          // return only the spaces numbers as that's all I need right now
          // TODO: this will break when we have events where the GM is listed as booked!!!
          return {
            eventId: event.eventId,
            spacesOpen: spacesTotal - bookings,
            spacesTotal: spacesTotal
          }
        })

        return data
      } catch (err) {
        alertMsg(`get events category ${category} failed, error: ${err}`)
        return null
      }
    },
    getFavEvents: async () => {
      const token = getAuthToken()
      if (!token) return null
      const config = { headers: { Authorization: token } }
      try {
        const res = await axios.get(apiBaseUrl + 'events/me/favorites', config);
        const data = await res.data
        const simpleArray = data.map(item => item.eventId)
        return simpleArray
        // TODO: get Jerry to change to just a list of ids?
      } catch (err) {
        alertMsg(`get user fav events failed, error: ${err}`)
        return null
      }
    },
    getBookedEvents: async () => {
      const token = getAuthToken()
      if (!token) return null
      const config = { headers: { Authorization: token } }
      try {
        const res = await axios.get(apiBaseUrl + 'events/me', config);
        const data = await res.data
        console.log("user events", data);
        const asyncResult = await Promise.all(data.map( async eventId => {
          const event = await api.getEvent(eventId)
          
          // Create Javascript date object
          const eventStartDateTime = dayjs(event.eventStartDate + "T" + event.eventStartTime + "-07:00").toDate()
          const eventEndDateTime = dayjs(event.eventEndDate + "T" + event.eventEndTime + "-07:00").toDate()

          // Create Duration
          const duration = (dateStart,dateEnd) => {
            // calculate hours
            let diffInMilliSeconds = Math.abs(dateEnd - dateStart) / 1000;
            const hours = Math.floor(diffInMilliSeconds / 3600) % 24;
        
            diffInMilliSeconds -= hours * 3600;
            // calculate minutes
            const minutes = Math.floor(diffInMilliSeconds / 60) % 60;
            diffInMilliSeconds -= minutes * 60;
            return hours.toString()
          };

          return {
            eventId: eventId, 
            eventName: event.eventName,
            eventSlug: event.eventSlug,
            categories: event.categories,
            isVolunteer: event.categories.some(cat => cat.slug === "volunteer-shift"),
            eventStartDateTime: eventStartDateTime,
            eventDuration: duration(eventStartDateTime,eventEndDateTime)
          }
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
      const token = getAuthToken()
      if (!token) return null
      try {
        const config = { headers: { Authorization: token } }
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
    getAvailableSlots: async () => {
      // contains { displayName, userNicename }
      const token = getAuthToken()
      if (!token) return null
      try {
        const config = { headers: { Authorization: token } }
        const res = await axios.get(apiBaseUrl + 'bookings/myAvailableSlots', config)
        console.log("🚀 ~ file: scripts.js ~ line 174 ~ getAvailableSlots: ~ res", res)
        if (res.status === 200) {
          return res.data
        } else {
          alertMsg(`get myAvailableSlots failed, status: ${res.status}`)
        }
      } catch (err) {
        alertMsg(`get myAvailableSlots failed, error: ${err}`)
      }
    },
    addFav: async (id) => {
      const token = getAuthToken()
      if (!token) return null
      const config = { headers: { Authorization: token } }
      const params = { eventId: id }
      try {
        const res = await axios.post(apiBaseUrl + 'events/me/favorite/create', params, config)
        const data = res.data
        return data
      } catch (err) {
        alertMsg(`fav event failed, error: ${err}`)
        return null
      }
    },
    deleteFav: async (id) => {
      const token = getAuthToken()
      if (!token) return null
      const config = { headers: { Authorization: token }, data: { eventId: id } }
      try {
        const res = await axios.delete(apiBaseUrl + 'events/me/favorite/delete', config)
        const data = res.data
        return data
      } catch (err) {
        alertMsg(`delete fav failed, error: ${err}`)
        return null
      }
    },
    bookEvent: async (id) => {
      const token = getAuthToken()
      if (!token) return null
      const config = { headers: { Authorization: token } }
      const params = { gameId: id }
      try {
        const res = await axios.post(apiBaseUrl + 'bookings/bookMeIntoGame', params, config)
        const data = res.data
        return data
      } catch (err) {
        alertMsg(`book event failed, error: ${err}`)
        return null
      }
    },
    cancelBooking: async (id) => {
      const token = getAuthToken()
      if (!token) return null
      const config = { headers: { Authorization: token }, data: { gameId: id } }
      try {
        const res = await axios.delete(apiBaseUrl + 'bookings/removeMeFromGame', config)
        const data = res.data
        return data
      } catch (err) {
        alertMsg(`cancel booking failed, error: ${err}`)
        return null
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
          return null
        }
      } catch (err) {
        alertMsg(`login failed, error: ${err}`)
        return null
      }
    },
    changePassword: async (userId, password) => {
      const token = getAuthToken()
      if (!token) return null
      const config = { headers: { Authorization: token } }
      try {
        const res = await axios.post(apiBaseUrl + "users/setMyPassword", { userId: userId, password: password }, config)
        if (res.status === 200 || res.status === 201) {
          return true
        } else {
          alertMsg(`login failed, status: ${res.status}`)
          return null
        }
      } catch (err) {
        alertMsg(`login failed, error: ${err}`)
        return null
      }
    },
  }

  /* -------------------------------------------------------------------------- */
  /*                                Alpine Stores                               */
  /* -------------------------------------------------------------------------- */

  /* ---------------------------- Auth Store --------------------------- */
  // ALl data for logged in users
  // TODO: refactor to data with persist?

  Alpine.store('auth', {
    async init() {
      const token = getAuthToken()
      this.isAuth = (typeof token === 'string')
      this.user = getLSWithExpiry('user')
      this.availableSlots = getLSWithExpiry('availableSlots')
      this.bookedEvents = getLSWithExpiry('bookedEvents')
      this.favEvents = getLSWithExpiry('favEvents')
      this.volunteerEventSpaces = getLSWithExpiry('volunteerEventSpaces')
      this.favsOnly = getLSWithExpiry('favsOnly')
      this.openOnly = getLSWithExpiry('openOnly')
      if (this.isAuth) {
        if (!this.user) this.getUserData()
        if (!this.bookedEvents) this.getBookedEvents()
        if (!this.favEvents) this.getFavEvents()
        if (typeof this.availableSlots !== 'number') this.getAvailableSlots()
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
    availableSlots: null,
    bookedEvents: [],
    favEvents: [],
    volunteerEventSpaces: [],
    isBooked(id) {
      if (this.bookedEvents) return this.bookedEvents.some( item => item.eventId === id)
      return false
    },
    isFav(id) {
      if (this.favEvents) return this.favEvents.some( item => item === id)
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
        this.getAvailableSlots()
      } else this.makeToast('Login failed')
    },
    test(){
      console.log(this.isAuth)
    },
    async createAccount() {},
    async forgetPassword() {},
    async toggleFav(id) {
      let data
      if (this.isFav(id)) { 
        this.favEvents = this.favEvents.filter(fav => fav !== id)
        data = await api.deleteFav(id) 
      }
      else { 
        this.favEvents = [...this.favEvents, id]
        data = await api.addFav(id) 
      }
      if (data && data.status === 'FAILURE') this.makeToast(data.message)
      if (data && data.status === 'SUCCESS') {
        this.getFavEvents()
      }
    },
    async bookEvent(id) {
      const data = await api.bookEvent(id)
      console.log("🚀 ~ file: scripts.js ~ line 294 ~ bookEvent ~ data", data)
      if (data && data.status === 'FAILURE') this.makeToast(data.message)
      if (data && data.status === 'SUCCESS') {
        this.getBookedEvents()
        this.makeToast("You've booked this event!")
      }
    },
    async cancelBooking(id) {
      const data = await api.cancelBooking(id)
      console.log("🚀 ~ file: scripts.js ~ line 294 ~ bookEvent ~ data", data)
      if (data && data.status === 'FAILURE') this.makeToast(data.message)
      if (data && data.status === 'SUCCESS') {
        this.getBookedEvents()
        this.makeToast("Booking canceled")
      }
    },
    async getUserData() {
      const data = await api.getUserData()
      this.user = data
      setLSWithExpiry('user', data)
    },
    async getAvailableSlots() {
      const data = await api.getAvailableSlots()
      this.availableSlots = data
      setLSWithExpiry('availableSlots',data)
    },
    async getEventsCategory(category) {
      // console.log("🚀 ~ file: scripts.js ~ line 429 ~ getEventsCategory ~ category", category)
      const data = await api.getEventsCategory(category)
      this.volunteerEventSpaces = data
      setLSWithExpiry('volunteerEventSpaces',data)
      // console.log("🚀 ~ file: scripts.js ~ line 431 ~ getEventsCategory ~ data", data)
    },
    volunteerEventSpace(eventId) {
      return (this.volunteerEventSpaces && this.volunteerEventSpaces.length > 0) ? this.volunteerEventSpaces.find( e => e.eventId === eventId) : false
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
    async changePassword(newPassword) {
      // console.log("change password",this.user.id,newPassword);
      // returns boolean value
      const isChanged = await api.changePassword(this.user.id, newPassword)
      // triggers toast
      if (isChanged) { this.makeToast("Password changed") } else this.makeToast("Error: Failed to change password")
      return isChanged
    },
    logout() {
      console.log("logout")
      this.isAuth = false
      this.user = null
      this.bookedEvents = null
      this.favEvents = null
      this.availableSlots = null
      this.volunteerEventSpaces = null
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      localStorage.removeItem('favEvents')
      localStorage.removeItem('bookedEvents')
      localStorage.removeItem('availableSlots')
      localStorage.removeItem('volunteerEventSpaces')
    },
    // Toast notifications
    // TODO: look into making this global
    toast: null,
    makeToast(notification) {
      this.toast = notification
      setTimeout(() => this.toast = null, 2000);
    },
    // Event Table Filter
    favsOnly: false, // filter to only show favs
    openOnly: false, // filter to only show open events
    toggleFavsOnly() {
      setLSWithExpiry('favsOnly',!this.favsOnly);
      this.favsOnly = !this.favsOnly;
    },
    toggleOpenOnly() {
      setLSWithExpiry('openOnly',!this.openOnly);
      this.openOnly = !this.openOnly;
    },
    filterEvent(eventId) {
      let showEvent = true
      if (this.favsOnly && !this.isFav(eventId)) showEvent = false // hide if favsOnly true and not a fav
      if (this.openOnly && this.volunteerEventSpaces.length > 0 && this.volunteerEventSpaces.find( e => e.eventId === eventId) && this.volunteerEventSpaces.find( e => e.eventId === eventId).spacesOpen === 0) showEvent = false // hide if openOnly true and no availableSlots
      return showEvent
    }
  })

  /* -------------------------------------------------------------------------- */
  /*                            Alpine Component Data                           */
  /* -------------------------------------------------------------------------- */

  /* -------------------------- eventInfo panel data -------------------------- */

  Alpine.data('eventInfo', () => ({
    event: null,
    spacesTotal: null,
    spacesOpen: null,
    owner: null,
    gm: null,
    bookings: [], // bookings minus all GMs
    async getEvent(id) {
      const data = await api.getEvent(id)
      console.log("🚀 ~ file: scripts.js ~ line 373 ~ getEvent ~ data", data)
      if (data) {
        this.event = data
        const spacesTotal = parseInt(data.metadata.Players)
        this.spacesTotal = spacesTotal
        this.owner = data.eventOwner.displayName
        this.gm = data.metadata.GM
        const bookings = data.bookings.filter(booking => booking.bookingComment !== "GM")
        this.bookings = bookings
        this.spacesOpen = spacesTotal - bookings.length
      }
    },
    showTimezone(date,tz) {
      console.log(dayjs(date).tz(tz))
    }
  }))

  Alpine.data('createAccount',() => ({
    agree: false, 
    userNicename: '', 
    userEmail: '', 
    userPass:'', 
    firstName:'', 
    lastName:'', 
    howToDisplay: 'firstlast', 
    nickname:'', 
    displayName:'', 
    twitter:'', // not set up yet in API
    userLogin: '',
  }))

})

/* -------------------------------------------------------------------------- */
/*                           Polyfills for Safari 11                          */
/* -------------------------------------------------------------------------- */

/* ----------------------------- queueMicrotask ----------------------------- */
if (typeof self.queueMicrotask !== "function") {
  self.queueMicrotask = function (callback) {
    Promise.resolve()
      .then(callback)
      .catch(e => setTimeout(() => { throw e; })); // report exceptions
  };
}
/* ------------------------- Polyfill for globalThis ------------------------ */
(function() {
	if (typeof globalThis === 'object') return;
	Object.prototype.__defineGetter__('__magic__', function() {
		return this;
	});
	__magic__.globalThis = __magic__; // lolwat
	delete Object.prototype.__magic__;
}());

/* -------------------------------- flatMap() ------------------------------- */
// See https://unpkg.com/array-flat-polyfill in head
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
  // console.log("🚀 ~ file: scripts.js ~ line 23 ~ setLSWithExpiry ~ value", key, value)
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
/*                             API Fetch Functions                            */
/* -------------------------------------------------------------------------- */

// TODO: refactor all this to simpler global functions 

const apiBaseUrl = 'https://admin.bigbadcon.com:8091/api/'

// Global Fetch Function for API
async function fetchData(url, options, authToken) {
  authToken = authToken || JSON.parse(localStorage.getItem('_x_authToken'))
  options = {...options, 
    method: 'GET', 
    headers: { 
      'Content-Type': 'application/json;charset=utf-8',
      Authorization: authToken
    }
  }
  if (options.body) options.body = JSON.stringify(options.body)

  console.log(`fetch options for ${url}`,options)
  try {
    let response = await fetch(apiBaseUrl + url, options)
    let result = await response.json()
    console.log(`RESULT:fetch for ${url}`, result)
    return result
  } catch (err) {
    console.log(`ERROR:fetch for ${url}`,err)
    return false
  }
}

const api = {
  getEvent: async (id) => {
    let data = await fetchData('events/find','POST',{id: id},)
    if (!data) return false
    // Create Javascript date object
    const eventStartDateTime = dayjs(data.eventStartDate + "T" + data.eventStartTime + "-07:00").toDate()
    const eventEndDateTime = dayjs(data.eventEndDate + "T" + data.eventEndTime + "-07:00").toDate()
    
    data = {...data, 
      // Convert to keyed object
      metadata: metadataArrayToObject(data.metadata),
      // strip out status 0 which are canceled attendees
      bookings: data.bookings.filter(booking => booking.bookingStatus === 1),
      eventStartDateTime: eventStartDateTime,
      eventEndDateTime: eventEndDateTime,
    }
    return data
  },
  getEventsCategory: async (category) => {
    let data = await fetchData('events/category/' + category,'POST')
    if (!data) return false
    data = data.map(event => {
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
  },
  getFavEvents: async () => {
    let data = await fetchData('events/me/favorites')
    return data && data.map(item => item.eventId)
  },
  getBookedEvents: async () => {
    
    const token = getAuthToken()
    if (!token) return null
    const config = { headers: { Authorization: token } }
    try {
      const res = await axios.get(apiBaseUrl + 'events/me', config);
      const data = await res.data
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
      // console.log("🚀 ~ file: scripts.js ~ line 130 ~ getBookedEvents: ~ asyncResult", asyncResult)
      return asyncResult
    } catch (err) {
      alertMsg(`get booked events failed, error: ${err}`)
      return null
    }
  },
  getUserData: async () => {
    let data = await fetchData('users/me')
    return data
  },
  getAvailableSlots: async () => {
    let data = await fetchData('bookings/myAvailableSlots')
    return data
  },
  addFav: async (id) => {
    let data = await fetchData('events/me/favorite/create','POST',{ eventId: id })
    return data
  },
  deleteFav: async (id) => {
    let data = await fetchData('events/me/favorite/delete',{ eventId: id },'DELETE')
    return data
  },
  bookEvent: async (id) => {
    let data = await fetchData('bookings/bookMeIntoGame',{ gameId: id },'POST')
    return data
  },
  cancelBooking: async (id) => {
    let data = await fetchData('bookings/removeMeFromGame',{ gameId: id },'DELETE')
    return data
  },
  submitLogin2: async (username, password) => {
    // let data = await fetchData('login',{ username: username, password: password },'POST')
    let res = await fetch(apiBaseUrl + 'login', {headers: { 'Content-Type': 'application/json;charset=utf-8' }, method: 'POST', body:JSON.stringify({ username: username, password: password })})
    if (res.status === 200 && res.headers.get('authorization')) {
      const token = res.headers.get('authorization')
      return token
    } else return false
  },
  submitLogin: async (username, password) => {
    try {
      const res = await axios.post(apiBaseUrl + "login", { username: username, password: password })
      if (res.status === 200 && res.headers.authorization) {
        const token = res.headers.authorization
        console.log('token',token)
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
    let data = await fetchData('users/setMyPassword',{ userId: userId, password: password },'POST')
    return data
  }
}

/* -------------------------------------------------------------------------- */
/*                                Alpine Stuff                                */
/* -------------------------------------------------------------------------- */

// TODO: convert to Alpine 3 persist

document.addEventListener('alpine:init', () => {

  /* -------------------------------------------------------------------------- */
  /*                                Alpine Stores                               */
  /* -------------------------------------------------------------------------- */

  /* ---------------------------- Auth Store --------------------------- */
  // ALl data for logged in users
  // TODO: refactor to data with persist?
  
  Alpine.data('global', function () {
    return {
      authToken: this.$persist(false),
      user: this.$persist(false),
      availableSlots: this.$persist(null),
      bookedEvents: this.$persist([]),
      favEvents: this.$persist([]),
      isRegistered: this.$persist(null),
      volunteerEventSpaces: this.$persist([]),
      async submitLogin(username, password) {
        let res = await fetch(apiBaseUrl + 'login', { headers: { 'Content-Type': 'application/json;charset=utf-8' }, method: 'POST', body:JSON.stringify({ username: username, password: password })})
        if (res.status === 200 && res.headers.get('authorization')) {
          const token = res.headers.get('authorization')
          this.authToken = token
          this.makeToast('logged in!')
          if (token) {
            // Need to pass token since there is a delay with the $persist code storing it
            this.user = await fetchData('users/me',{},token)
            this.availableSlots = await fetchData('bookings/myAvailableSlots',{}, token)
            this.bookedEvents = await this.getBookedEvents()
            this.favEvents = await fetchData('events/me/favorites',{},token)
            this.checkRegistration()
          }
          return token
        } else return false
      },
      logout () {
        this.authToken = null
        this.user = null
        this.bookedEvents = null
        this.favEvents = []
        this.availableSlots = []
        this.isRegistered = null
        this.volunteerEventSpaces = []
      },
      async getUserData() {
        // TODO: do we need this for more than the login?
        const data = await fetchData('users/me')
        this.user = data
        return data
      },
      async checkRegistration () {
        
      },
      async getBookedEvents() {
        // TODO: fill this in
      },
      // Toast notifications
      toast: null,
      makeToast(notification) {
        this.toast = notification
        setTimeout(() => this.toast = null, 4000);
      }
    }
  })
  
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
      this.bboDiscordInvite = getLSWithExpiry('bboDiscordInvite')
      this.isRegistered = getLSWithExpiry('isRegistered')
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
    // Big Bad Online Registration
    isRegistered: null, // null is not set; false for no; true for yes;
    bboDiscordInvite: null, //stores discord invite link id grabbed from server; null == not set; false = unregistered; id string = discord invite id
    // Big Bad Online Registration Functions
    async checkRegistration() {
      // If not registered but logged in then check registration status
      if (!this.isRegistered && this.isAuth) {
        console.log("not registered so checking reg");
        try {
          const res = await axios.get(`/.netlify/functions/check-registration/${this.user.id}/${this.user.userNicename}`)
          if (res && res.data) {
            console.log(res.data)
            const bboDiscordInvite = res.data.bboDiscordInvite || null
            const isRegistered = res.data.isRegistered;
            this.bboDiscordInvite = bboDiscordInvite
            this.isRegistered = isRegistered
            setLSWithExpiry('bboDiscordInvite', bboDiscordInvite)
            setLSWithExpiry('isRegistered', isRegistered)
            return bboDiscordInvite
          }
        } catch(err) {
          this.makeToast('Failed to check registration status. Try reloading page.')
          console.log("failed to reach Google Sheet. Try reloading page.")
          return false
        }
      }
    },
    // Event Table Functions
    isBooked(id) {
      if (this.bookedEvents) return this.bookedEvents.some( item => item.eventId === id)
      return false
    },
    isFav(id) {
      if (this.favEvents) return this.favEvents.some( item => item === id)
      return false
    },
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
    },
    // Login functions
    async submitLogin(username,password) {
      const token = await api.submitLogin(username,password)
      if (token) {
        setAuthToken(token)
        this.isAuth = true
        // await getUserData as we need this for checkRegistration
        await this.getUserData()
        this.getBookedEvents()
        this.getFavEvents()
        this.getAvailableSlots()
        this.checkRegistration()
      } else this.makeToast('Login failed')
    },
    
    async createAccount() {},
    async forgetPassword() {},
    async changePassword(newPassword) {
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
      localStorage.removeItem('isRegistered')
      localStorage.removeItem('bboDiscordInvite')
    },
    // Booking functions
    async bookEvent(id) {
      const data = await api.bookEvent(id)
      // console.log("🚀 ~ file: scripts.js ~ line 294 ~ bookEvent ~ data", data)
      if (data && data.status === 'FAILURE') this.makeToast(data.message)
      if (data && data.status === 'SUCCESS') {
        this.getBookedEvents()
        this.makeToast("You've booked this event!")
      }
    },
    async cancelBooking(id) {
      const data = await api.cancelBooking(id)
      // console.log("🚀 ~ file: scripts.js ~ line 294 ~ bookEvent ~ data", data)
      if (data && data.status === 'FAILURE') this.makeToast(data.message)
      if (data && data.status === 'SUCCESS') {
        this.getBookedEvents()
        this.makeToast("Booking canceled")
      }
    },
    // User data
    async getUserData() {
      const data = await api.getUserData()
      this.user = data
      setLSWithExpiry('user', data)
      return data
    },
    async getAvailableSlots() {
      const data = await api.getAvailableSlots()
      this.availableSlots = data
      setLSWithExpiry('availableSlots',data)
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
    // Load full events data for category. This is mainly to show number of slots open of volunteer shifts
    // TODO: make this work for other event types, hopefully with simpler API
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
    // Toast notifications
    // TODO: look into making this global
    toast: null,
    makeToast(notification) {
      this.toast = notification
      setTimeout(() => this.toast = null, 4000);
    },
  })
  
  Alpine.store('toast', {
    toast: null,
    makeToast(notification) {
      this.toast = notification
      setTimeout(() => this.toast = null, 4000);
    },
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
      // console.log("🚀 ~ file: scripts.js ~ line 373 ~ getEvent ~ data", data)
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
      // console.log(dayjs(date).tz(tz))
    }
  }))

  Alpine.data('createAccount',() => ({
    agree: false,
    userNicename: '',
    userNicenameExists: false,
    userEmail: '',
    userPass:'',
    firstName:'',
    lastName:'',
    howToDisplay: 'firstlast',
    nickname:'',
    displayName:'',
    twitter:'', // not set up yet in API
    userLogin: '',
    async checkUsername() {
      try {
        const res = await axios.get(`/.netlify/functions/check-user/${this.userNicename}`)
        if (res && res.data === "user exists") {
          this.userNicenameExists = true;
        }
      } catch (err) {
        console.log(err);
      }
    }
  }))

  // Change Password
  Alpine.data('resetPasswordForm',() => ({
    userEmail: '',
    resetPasswordFormState: "empty",
    async resetPassword() {
      resetPasswordFormState = "working"
      if (this.userEmail) {
        const paramSafeEmail = this.userEmail.replace(/\+/gi, '%2B') // replace + symbols for URLSearchParams
        const res = await axios.get(`/.netlify/functions/forgot-password/?email=${paramSafeEmail}`)
        if (res && res.data === "forgot password email sent") {
          this.resetPasswordFormState = "succeeded"
          console.log("email address found. Sent reset email");
        } else {
          this.resetPasswordFormState = "failed"
        }
        this.userEmail = ''
      }
    }
  }))

  // Change Password
  Alpine.data('changePasswordForm',() => ({
    uuid: null,
    userEmail: '',
    userPass: '',
    passwordChangedState: 'empty',
    async changePassword() {
      this.passwordChangedState = 'working'
      if (this.uuid) {
        const paramSafeEmail = this.userEmail.replace(/\+/gi, '%2B') // replace + symbols for URLSearchParams
        const res = await axios.get(`/.netlify/functions/change-password/?uuid=${this.uuid}&email=${paramSafeEmail}&password=${this.userPass}`)
        if (res && res.data === "password changed") {
          console.log("password change succeeded");
          this.passwordChangedState = 'succeeded'
        } else {
          console.log("password change failed");
          this.passwordChangedState = 'failed'
        }
        this.userEmail = ''
        this.userPass = ''
      }
    }
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
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


/* --------------------------- Event Duration ------------------------------ */

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

/* -------------------------------------------------------------------------- */
/*                             API Fetch Functions                            */
/* -------------------------------------------------------------------------- */

// TODO: refactor all this to simpler global functions 

const apiBaseUrl = 'https://admin.bigbadcon.com:8091/api/'

// Global Fetch Function for API
async function fetchData(url, options, authToken) {
  authToken = authToken || JSON.parse(localStorage.getItem('_x_authToken'))
  options = { 
    method: 'GET', 
    headers: { 
      'Content-Type': 'application/json;charset=utf-8',
      Authorization: authToken
    }, 
    ...options
  }
  if (options.body) options.body = JSON.stringify(options.body)
  // console.log(`fetch options for ${url}`,options)
  // TODO: add throw for non-200 status responses
  try {
    let response = await fetch(apiBaseUrl + url, options)
    console.log(`RESPONSE:fetch for ${url}`, response)
    let result = await response.json()
    console.log(`RESULT:fetch for ${url}`, result)
    return result
  } catch (err) {
    console.log(`ERROR:fetch for ${url}`,err)
    return false
  }
}

/* -------------------------------------------------------------------------- */
/*                                Alpine Stuff                                */
/* -------------------------------------------------------------------------- */

document.addEventListener('alpine:init', () => {

  /* -------------------------------------------------------------------------- */
  /*                                Alpine Global                               */
  /* -------------------------------------------------------------------------- */

  // Main data for logged in users
  
  Alpine.data('global', function () {
    return {
      init() {
        // TODO: add a check to test when the last login was. logout if it's been too long.
      },
      lastLogin: '',
      authToken: this.$persist(false),
      get isAuth() { return (typeof this.authToken === "string") },
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
            // Need to pass token for first couple since there is a delay with the $persist code storing it
            this.user = await fetchData('users/me',{},token)
            this.availableSlots = await fetchData('bookings/myAvailableSlots',{}, token)
            await this.getBookedEvents()
            await this.getFavEvents()
            this.checkRegistration()
          }
          return token
        } else return false
      },
      logout () {
        this.authToken = null
        this.user = null
        this.favEvents = []
        this.availableSlots = []
        this.bookedEvents = null
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
      async getEvent(id) {
        const data = await fetchData('events/find',{method: 'POST',body: {id: id}})
        
        // Create Javascript date object
        const eventStartDateTime = dayjs(data.eventStartDate + "T" + data.eventStartTime + "-07:00").toDate()
        const eventEndDateTime = dayjs(data.eventEndDate + "T" + data.eventEndTime + "-07:00").toDate()
        
        return {...data, 
          // Convert to keyed object
          metadata: metadataArrayToObject(data.metadata),
          // strip out status 0 which are canceled attendees
          bookings: data.bookings.filter(booking => booking.bookingStatus === 1),
          // add simple isVolunteer boolean
          isVolunteer: event.categories.some(cat => cat.slug === "volunteer-shift"),
          // add javascript date objects and duration
          eventStartDateTime: eventStartDateTime,
          eventEndDateTime: eventEndDateTime,
          eventDuration: duration(eventStartDateTime,eventEndDateTime)
        }
      },
      async getBookedEvents() {
        // TODO: test this
        // 1. Get ID array of my events
        let myEvents = await fetchData('events/me/',{})
        // 2. Get event data for each ID
        myEvents = await Promise.all(myEvents.map( async id => {
          const event = await this.getEvent(id)
          return event
        }))
        this.bookedEvents = myEvents
        return myEvents
      },
      async bookEvent(id) {
        let data = await fetchData('bookings/bookMeIntoGame',{method: 'POST',body: { gameId: id }})
        return data
      },
      async cancelBooking(id) {
        let data = await fetchData('bookings/removeMeFromGame',{method: 'DELETE',body: { gameId: id }})
        return data
      },
      async getFavEvents() {
        let data = await fetchData('events/me/favorites')
        this.favEvents = data && data.map(item => item.eventId)
        return data && data.map(item => item.eventId)
      },
      async toggleFav(id) {
        let data
        if (this.isFav(id)) {
          data = await fetchData('events/me/favorite/delete',{ method: 'DELETE', body:{eventId: id} })
        } else { 
          data = await fetchData('events/me/favorite/create',{ method: 'POST', body:{eventId: id} })
        }
        if (data && data.status === 'FAILURE') this.makeToast(data.message)
        if (data && data.status === 'SUCCESS') {
          this.getFavEvents()
        }
      },
      isFav(id) {
        // console.log("fav events",this.favEvents)
        if (this.favEvents) return this.favEvents.some( item => item === id)
        return false
      },
      isBooked(id) {
        if (this.bookedEvents) return this.bookedEvents.some( item => item.eventId === id)
        return false
      },
      isOpen(id) {
        return true
      },
      async changePassword(userId,password) {
        let data = await fetchData('users/setMyPassword',{ method: 'POST', body: { userId: userId, password: password }})
        return data
      },
      // Toast notifications
      toast: null,
      makeToast(notification) {
        this.toast = notification
        setTimeout(() => this.toast = null, 4000);
      }
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
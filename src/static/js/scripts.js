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

function isFullArray(arr) {
  return Array.isArray(arr) && arr.length
}

function compareArrays(arr1, arr2) {
  return Array.isArray(arr1) && Array.isArray(arr2) && arr1.filter(val => arr2.indexOf(val) !== -1)
}

/* -------------------------------------------------------------------------- */
/*                             dayjs event format                             */
/* -------------------------------------------------------------------------- */

function formatEventDate(date, tz = 'America/Los_Angeles') {
  // TODO: this is a kludge forcing the timezone to be Pacific time until I make this work more modular for online vs in person.
  tz = 'America/Los_Angeles'
  return "<span style='white-space: nowrap;'>" + dayjs(date).tz(tz).format('MMM D, YYYY') + "</span> <span>" + dayjs(date).tz(tz).format('h:mm a') + "</span>"
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

const apiBaseUrl = 'https://admin.bigbadcon.com:8091/api'
// Dev API using Caddy server reverse proxy
// const apiBaseUrl = '/apidev'

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

  try {
    let response = await fetch(apiBaseUrl + url, options)
    console.log(`RESPONSE:fetch for ${url}`, response)
    if (response.status !== 200) throw `fetch fail status: ${response.status}`
    let result = await response.json()
    console.log(`RESULT:fetch for ${url}`, result)
    return result
  } catch (err) {
    console.error(`ERROR:fetch for ${url}`,err)
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
        // logout if it's been more than 10 days
        if (!dayjs(this.lastLogin).isValid() || dayjs(this.lastLogin).diff(dayjs(),'hour') < - 240) this.logout()
      },
      lastLogin: this.$persist(null),
      authToken: this.$persist(false),
      user: this.$persist(false),
      availableSlots: this.$persist(null),
      bookedEvents: this.$persist([]),
      favEvents: this.$persist([]),
      isRegistered: this.$persist(null),
      volunteerEventSpaces: this.$persist([]),
      bboDiscordInvite: null,
      get isAuth() { return (typeof this.authToken === "string") },
      async submitLogin(username, password) {
        console.log("submitLogin", username)
        let res = await fetch(apiBaseUrl + '/login', { headers: { 'Content-Type': 'application/json;charset=utf-8' }, method: 'POST', body:JSON.stringify({ username: username, password: password })})
        console.log("response", res, res.headers.get('authorization'))
        if (res.status === 200 && res.headers.get('authorization')) {
          const token = res.headers.get('authorization')
          this.authToken = token
          this.lastLogin = dayjs()
          if (token) {
            // Need to pass token for first couple since there is a delay with the $persist code storing it
            await this.getUserData(token)
            this.availableSlots = await fetchData('/bookings/myAvailableSlots',{}, token)
            await this.getBookedEvents()
            await this.getFavEvents()
            // this.checkRegistration()  this was for Big Bad Online
          }
          return token
        } else {
          // TODO: better error message to say if password is wrong
          this.$dispatch('toast', 'ERROR: login failed')
          return false
        }
      },
      logout () {
        this.authToken = null
        this.user = null
        this.favEvents = []
        this.availableSlots = null
        this.bookedEvents = null
        this.isRegistered = null
        this.volunteerEventSpaces = []
        this.bboDiscordInvite = null
        this.$dispatch('toast', 'You have been logged out')
      },
      async getUserData(token) {
        token = token || this.authToken
        let user = await fetchData('/users/me',{}, token)

        if (!user) {this.logout(); return false;}

        const userMetadata = metadataArrayToObject(user.metadata)
        // TODO: not 
        const userRoles = [...userMetadata.wp_tuiny5_capabilities.matchAll(/"([a-z]+)/g)].map( (match) => match[1])
        user = {
          ...user,
          metadata: userMetadata,
          roles: userRoles,
        }
        console.log("user data transformed",user);
        this.user = user
        return user
      },
      get badgeRoles() {
        return compareArrays(this.user.roles,['gm','paidattendee','volunteer','comp','staff'])
      },
      get hasBadge() {
        return this.user && Array.isArray(this.badgeRoles) && this.badgeRoles.length > 0
      },
      isRole(role) {
        return this.user && Array.isArray(this.user.roles) && this.user.roles.includes(role)
      },
      get isVolunteer() {
        return this.isRole('volunteer')
      },
      get isAdmin() {
        return this.isRole('administrator')
      },
      get isTeen() {
        return this.isRole('teen')
      },
      get isTeen() {
        return this.isRole('teen')
      },
      get isPaid() {
        return this.isRole('paidattendee')
      },
      async checkRegistration () {
        // Used for Big Bad Online
        const url = `/.netlify/functions/check-registration/${this.user.id}/${this.user.userNicename}`
        try {
          const response = await fetch(url)
          console.log(`RESPONSE:fetch for ${url}`, response)
          if (response.status !== 200) throw `checkRegistration fetch fail status: ${response.status}`
          let data = await response.json()
          console.log(`RESULT:fetch for ${url}`, data)
          this.bboDiscordInvite = data.bboDiscordInvite
          this.isRegistered = data.isRegistered
          return data
        } catch(err) {
          console.error(`ERROR: fetch for ${url}`,err)
          return false
        }
      },
      async getEvents() {
        const data = await fetchData('/events/all/public')
        console.log('getEvents', data)
      },
      async getEvent(id) {
        const data = await fetchData('/events/find',{method: 'POST',body: {id: id}})
        
        // Create Javascript date object
        const eventStartDateTime = dayjs(data.eventStartDate + "T" + data.eventStartTime + "-07:00").toDate()
        const eventEndDateTime = dayjs(data.eventEndDate + "T" + data.eventEndTime + "-07:00").toDate()
        
        return {...data,
          // Convert to keyed object
          metadata: metadataArrayToObject(data.metadata),
          // strip out status 0 which are canceled attendees
          bookings: data.bookings.filter(booking => booking.bookingStatus === 1),
          // add simple isVolunteer boolean
          isVolunteer: data.categories.some(cat => cat.slug === "volunteer-shift"),
          // add javascript date objects and duration
          eventStartDateTime: eventStartDateTime,
          eventEndDateTime: eventEndDateTime,
          eventDuration: duration(eventStartDateTime,eventEndDateTime)
        }
      },
      async getBookedEvents() {
        // 1. Get ID array of my events
        let myEvents = await fetchData('/events/me/',{})
        if (myEvents === false) {this.logout(); return false;}
        // 2. Get event data for each ID
        myEvents = await Promise.all(myEvents.map( async id => {
          const event = await this.getEvent(id)
          return event
        }))
        // remove any trashed events
        myEvents = myEvents.filter(event => event.eventStatus >= 0);
        this.bookedEvents = myEvents
        return myEvents
      },
      async bookEvent(id) {
        let data = await fetchData('/bookings/bookMeIntoGame',{method: 'POST',body: { gameId: id }})
        this.getBookedEvents()
        return data
      },
      async cancelBooking(id) {
        let data = await fetchData('/bookings/removeMeFromGame',{method: 'DELETE',body: { gameId: id, guid: id }})
        this.getBookedEvents()
        return data
      },
      async getFavEvents() {
        let data = await fetchData('/events/me/favorites')
        if (!data)
        this.favEvents = data && data.map(item => item.eventId)
        return data && data.map(item => item.eventId)
      },
      async toggleFav(id) {
        let data
        if (this.isFav(id)) {
          data = await fetchData('/events/me/favorite/delete',{ method: 'DELETE', body:{eventId: id} })
        } else { 
          data = await fetchData('/events/me/favorite/create',{ method: 'POST', body:{eventId: id} })
        }
        if (data && data.status === 'FAILURE') this.$dispatch('toast', data.message)
        if (data && data.status === 'SUCCESS') {
          this.getFavEvents()
        }
      },
      isFav(id) {
        return isFullArray(this.favEvents) && this.favEvents.some( item => item === id)
      },
      isBooked(id) {
        return isFullArray(this.bookedEvents) && this.bookedEvents.some( item => item.eventId === id)
      },
      async changePassword(userId,password) {
        let data = await fetchData('/users/setMyPassword',{ method: 'POST', body: { userId: userId, password: password }})
        return data
      }
    }
  })


  /* -------------------------------------------------------------------------- */
  /*                            Alpine Component Data                           */
  /* -------------------------------------------------------------------------- */
  

  /* -------------------------- eventInfo panel data -------------------------- */

  Alpine.data('eventInfo', function () {
    return {
      spacesTotal: null,
      spacesOpen: null,
      owner: null,
      gm: null,
      bookings: [], // bookings minus all GMs
      events: this.$persist({}),
      async getEventBooking(id) {
        // Check localStorage first to quickly populate this
        let events = this.events
        if (events[id]) {
          // set Alpine 'eventInfo' variables
          this.owner = events[id].owner
          this.gm = events[id].gm
          this.bookings = events[id].bookings
          this.spacesTotal = events[id].spacesTotal
          this.spacesOpen = events[id].spacesOpen
        }
        // fetch new data from server
        const data = await fetchData('/events/find',{ method: 'POST', body: { id: id }})
        if (data) {
          // Convert metadata array to object
          const metadata = metadataArrayToObject(data.metadata)
          // set Alpine 'eventInfo' variables
          this.owner = data.eventOwner.displayName
          this.gm = metadata.GM
          // filter out all cancelled bookings and GM roles
          const bookings = data.bookings.filter(booking => booking.bookingStatus === 1 && booking.bookingComment !== "GM")
          this.bookings = bookings
          this.spacesTotal = parseInt(metadata.Players)
          this.spacesOpen = parseInt(metadata.Players) - bookings.length

          // add to events store
          events = {...events, [id]:{
            owner: this.owner,
            gm: this.gm,
            bookings: this.bookings,
            spacesTotal: this.spacesTotal,
            spacesOpen: this.spacesOpen,
            metadata: metadata
          }}
          this.events = events
        }
      },
      async uploadImage(e) {

        if (!this.isAdmin) return false

        const eventId = e.target.eventId.value
        const formData = new FormData(e.target)

        async function customFetch(url, authToken) {
          const options = {
            method: 'POST',
            headers: {
              Authorization: authToken
            },
            body: formData
          }

          console.log(options);

          try {
            let response = await fetch(apiBaseUrl + url, options)
            console.log(`RESPONSE:fetch for ${url}`, response)
            if (response.status !== 200) throw `fetch fail status: ${response.status}`
            let result = await response.json()
            console.log(`RESULT:fetch for ${url}`, result)
            return result
          } catch (err) {
            console.error(`ERROR:fetch for ${url}`,err)
            return false
          }
        }

        let data = await customFetch('/events/image', this.authToken)

        if (data) {
          // if data update event data with new image
          let event = this.events[eventId]
          event.metadata.event_image = data.fileName
          this.events = {...this.events, [eventId]: event}
        }
        location.reload()
        return data
      },
      showPreview(e) {
        if (e.target.files.length > 0) {
          const src = URL.createObjectURL(e.target.files[0]);
          const preview = document.getElementById("image-preview");
          const button = document.getElementById("upload-button");
          preview.src = src;
          preview.style.display = "block";
          button.style.display = "inline-block";
        }
      },
    }
  })

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
    // TODO: change to fetch
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
      this.resetPasswordFormState = "working"
      if (this.userEmail) {
        const paramSafeEmail = this.userEmail.replace(/\+/gi, '%2B') // replace + symbols for URLSearchParams
        // TODO: change to fetch
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
        // TODO: change to fetch
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